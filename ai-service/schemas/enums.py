"""
Alivio AI Infrastructure - Enums Definition
Defines all domain enums used across request schemas, Gemini response schemas, and routers.
"""

from enum import Enum


class ValidationModeEnum(str, Enum):
    STUDENT_INTAKE = "student_intake"
    STAFF_RESOLUTION = "staff_resolution"


class RejectionReasonEnum(str, Enum):
    VALID = "VALID"
    IMAGE_TEXT_MISMATCH = "IMAGE_TEXT_MISMATCH"
    SPAM_OR_MEME = "SPAM_OR_MEME"
    PERSONAL_SELFIE = "PERSONAL_SELFIE"
    DEGRADED_OR_BLANK = "DEGRADED_OR_BLANK"


class CategoryEnum(str, Enum):
    ELECTRICAL = "Electrical"
    PLUMBING = "Plumbing"
    CIVIL = "Civil & Infrastructure"
    SANITATION = "Sanitation & Hygiene"
    HVAC = "HVAC & Air Conditioning"
    IT_NETWORK = "IT & Network"
    HOSTEL = "Hostel Amenities"
    ROADS_LIGHTING = "Campus Roads & Lighting"
    SAFETY_SECURITY = "Safety & Security"
    OTHER = "Other"


class DepartmentEnum(str, Enum):
    ELECTRICAL = "Electrical Maintenance"
    PLUMBING = "Plumbing & Water Supply"
    CIVIL = "Civil Works & Masonry"
    SANITATION = "Housekeeping & Sanitation"
    HVAC = "HVAC & Refrigeration"
    IT_NETWORK = "IT & Campus Network"
    HOSTEL = "Hostel Warden Office"
    ROADS_LIGHTING = "Estate & Landscape"
    SAFETY_SECURITY = "Campus Security"
    OTHER = "General Administration"


class PriorityEnum(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AIOutcomeEnum(str, Enum):
    MODEL = "model"
    FALLBACK = "fallback"
    SCOPE_GUARD = "scope_guard"


class AIFallbackReasonEnum(str, Enum):
    NONE = "none"
    TIMEOUT = "timeout"
    QUOTA_EXHAUSTED = "quota_exhausted"
    PROVIDER_UNAVAILABLE = "provider_unavailable"
    INVALID_OUTPUT = "invalid_output"
