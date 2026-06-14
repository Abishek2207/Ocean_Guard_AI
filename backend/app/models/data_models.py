from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class DataSourceStatus(str, Enum):
    LIVE_API = "LIVE_API"
    CACHED_HISTORICAL = "CACHED_HISTORICAL"
    TOKEN_MISSING = "TOKEN_MISSING"
    MODEL_MISSING = "MODEL_MISSING"
    API_ERROR = "API_ERROR"

class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float

class SARDetection(BaseModel):
    id: str
    confidence: float
    bbox: BoundingBox
    class_name: str = "vessel-like"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AISMatch(BaseModel):
    match_status: str # "matched", "no_match", "unknown"
    source_status: DataSourceStatus
    vessel_id: Optional[str] = None
    vessel_name: Optional[str] = None
    distance_meters: Optional[float] = None
    time_diff_minutes: Optional[float] = None

class MPAStatus(BaseModel):
    status: str # "inside", "near_buffer", "outside"
    source_status: DataSourceStatus
    mpa_name: Optional[str] = None
    distance_km: Optional[float] = None

class RiskScore(BaseModel):
    score: int
    level: str # "Low", "Medium", "High", "Critical"
    factors: Dict[str, int]

class EvidenceCard(BaseModel):
    detection_id: str
    sar_model_name: str
    sar_model_confidence: float
    ais_status: str
    ais_source_status: DataSourceStatus
    mpa_status: str
    mpa_name: Optional[str] = None
    mpa_source_status: DataSourceStatus
    distance_to_mpa_km: Optional[float]
    fishing_likelihood: float
    risk_score: int
    risk_level: str
    why_flagged: str
    human_review_required: bool = True
    legal_safety_note: str = "This is possible dark-fishing risk for human review, not proof of illegal fishing."

class AgentExplanations(BaseModel):
    detection_analyst: str
    ais_intelligence: str
    mpa_geospatial: str
    risk_reasoning: str
    human_reviewer: str
