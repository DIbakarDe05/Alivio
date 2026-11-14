"""
Alivio AI Infrastructure - In-Memory Image Sanitizer & SSRF-Safe Fetcher
Performs strict Base64 decoding in RAM, magic-byte MIME detection, 5MB size enforcement,
and SSRF-safe Cloudinary URL retrieval. Zero disk I/O.
"""

import base64
import re
from typing import Tuple, Optional
from urllib.parse import urlparse
from fastapi import HTTPException, status
import httpx

from config import settings
from utils.logger import logger

# Maximum Base64 encoded length for 5 MiB binary payload
# 5 * 1024 * 1024 * 4 / 3 = 6,990,507 bytes (+ padding and prefix margin)
MAX_B64_CHAR_LENGTH = 6_990_508

DATA_URI_PATTERN = re.compile(r"^data:(image/[a-zA-Z0-9.+_-]+);base64,(.*)$", re.DOTALL)


def detect_mime_from_magic_bytes(data: bytes) -> str:
    """
    Validates binary header signatures to determine authentic image format.
    Raises HTTPException(400) if unrecognized or corrupted.
    """
    if len(data) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is too small to be a valid image header.",
        )

    # JPEG signature: \xFF\xD8\xFF
    if data[0:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # PNG signature: \x89PNG\r\n\x1a\n
    if data[0:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"

    # WebP signature: RIFF....WEBP
    if data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported image format. Only JPEG, PNG, and WebP are allowed.",
    )


def sanitize_and_decode_base64_image(raw_base64_str: str) -> Tuple[bytes, str]:
    """
    Decodes in-memory Base64 string, strips data URI header, enforces 5MB limit,
    and validates magic-byte MIME signature.
    Zero disk writes.
    """
    if not raw_base64_str or not raw_base64_str.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="imageBase64 field cannot be empty.",
        )

    clean_str = raw_base64_str.strip()
    declared_mime: Optional[str] = None

    match = DATA_URI_PATTERN.match(clean_str)
    if match:
        declared_mime = match.group(1).lower()
        clean_str = match.group(2)

    # Quick pre-decode length guard
    if len(clean_str) > MAX_B64_CHAR_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Base64 image string exceeds maximum allowed size ({settings.MAX_IMAGE_BYTES} bytes decoded).",
        )

    try:
        image_bytes = base64.b64decode(clean_str, validate=True)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed Base64 image payload: {str(exc)}",
        )

    byte_length = len(image_bytes)
    if byte_length == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decoded image buffer is empty (0 bytes).",
        )

    if byte_length > settings.MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decoded image size ({byte_length} bytes) exceeds maximum ceiling of {settings.MAX_IMAGE_BYTES} bytes (5 MiB).",
        )

    actual_mime = detect_mime_from_magic_bytes(image_bytes)

    # Check for mismatch between declared URI header and magic bytes
    if declared_mime:
        # Normalize jpg to jpeg
        norm_declared = "image/jpeg" if declared_mime in ("image/jpg", "image/pjpeg") else declared_mime
        if norm_declared != actual_mime:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Declared MIME header '{declared_mime}' mismatches actual image signature '{actual_mime}'.",
            )

    return image_bytes, actual_mime


async def fetch_ssrf_safe_image(url: str, client: httpx.AsyncClient) -> Tuple[bytes, str]:
    """
    Safely retrieves an image from an allowlisted HTTPS Cloudinary host.
    Guards against SSRF, internal network probing, redirects, and oversized payloads.
    """
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid imageUrl format.",
        )

    if parsed.scheme.lower() != "https":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="imageUrl must use secure HTTPS protocol.",
        )

    if parsed.username or parsed.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="imageUrl cannot contain embedded credentials.",
        )

    host = (parsed.hostname or "").lower()
    if host not in settings.IMAGE_URL_ALLOWED_HOSTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Host '{host}' is not in the approved image origin allowlist.",
        )

    try:
        # Stream response to cap buffer size and avoid memory ballooning
        async with client.stream("GET", url, follow_redirects=False, timeout=4.0) as response:
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to fetch image from host (HTTP {response.status_code}).",
                )

            buffer = bytearray()
            async for chunk in response.aiter_bytes():
                buffer.extend(chunk)
                if len(buffer) > settings.MAX_IMAGE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Remote image exceeds 5 MiB ceiling ({len(buffer)} bytes received).",
                    )

            image_bytes = bytes(buffer)
            mime_type = detect_mime_from_magic_bytes(image_bytes)
            return image_bytes, mime_type

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error fetching remote image: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to download image from allowlisted origin: {str(exc)}",
        )
