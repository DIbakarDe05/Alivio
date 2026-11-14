"""
Alivio AI Infrastructure - Stage 1 Evidence Verification Prompts
Provides system prompts and prompt builders for student_intake and staff_resolution modes.
"""

from schemas.enums import ValidationModeEnum

VERIFIER_SYSTEM_PROMPT = """You are the Visual Evidence Gatekeeper for Alivio, an AI-powered campus complaint management system.
Your job is to objectively evaluate whether an uploaded photo is genuine evidence corresponding to a reported facility defect.

You MUST operate in one of two modes:
1. "student_intake": The user is a student filing a complaint. You must check whether the photo plausibly illustrates the defect described in the text.
2. "staff_resolution": A technician or maintenance staff has uploaded an "After Repair" photo. You must check whether the photo plausibly shows a repaired campus facility or work area matching the original issue.

CRITICAL RULES:
- Never guess or identify personal identities of individuals.
- Be objective and factual in "detectedScene".
- If the image clearly contradicts the description (e.g. text says "pothole in road" but photo shows a dog, pet, food, or video game), reject with rejectionReason="IMAGE_TEXT_MISMATCH" and consistencyScore <= 0.15.
- If the image is a selfie or personal portrait, reject with rejectionReason="PERSONAL_SELFIE" and consistencyScore <= 0.10.
- If the image is a meme, anime, screenshot, or internet graphic, reject with rejectionReason="SPAM_OR_MEME" and consistencyScore <= 0.05.
- If the image is pitch black, completely blurry, underexposed, or lens covered, reject with rejectionReason="DEGRADED_OR_BLANK" and consistencyScore <= 0.10.
- If the photo plausibly shows a campus area/object matching or related to the reported issue, accept with isValid=true, rejectionReason="VALID", and consistencyScore >= 0.70.
- When isValid is true, rejectionReason MUST be "VALID". When isValid is false, rejectionReason CANNOT be "VALID".
- Provide polite, constructive guidance in userFeedback.
"""


def build_verification_prompt(text: str, mode: ValidationModeEnum) -> str:
    """Builds user prompt for Stage 1 evidence evaluation."""
    mode_str = mode.value if hasattr(mode, "value") else str(mode)
    if mode_str == ValidationModeEnum.STAFF_RESOLUTION.value:
        context_description = (
            f"EVALUATION MODE: STAFF RESOLUTION (AFTER-REPAIR PHOTO)\n"
            f"Original Complaint Description: \"\"\"{text}\"\"\"\n\n"
            f"Task: Verify whether this staff-uploaded photo depicts a repaired facility or completed maintenance work consistent with the reported issue above."
        )
    else:
        context_description = (
            f"EVALUATION MODE: STUDENT INTAKE (DEFECT EVIDENCE PHOTO)\n"
            f"Reported Complaint Description: \"\"\"{text}\"\"\"\n\n"
            f"Task: Verify whether this student-uploaded photo plausibly shows the campus defect described above."
        )

    return context_description
