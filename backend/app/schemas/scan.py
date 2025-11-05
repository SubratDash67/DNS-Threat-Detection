from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime


class ScanRequest(BaseModel):
    domain: str = Field(..., min_length=1, max_length=255)
    use_safelist: bool = True


class ScanResponse(BaseModel):
    id: int
    domain: str
    prediction: str
    confidence: float
    method: str
    reason: str
    stage: Optional[str] = None
    latency_ms: float
    typosquatting_target: Optional[str] = None
    edit_distance: Optional[int] = None
    safelist_tier: Optional[str] = None
    features: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchScanRequest(BaseModel):
    domains: list[str] = Field(..., max_length=10000)
    use_safelist: bool = True


class BatchJobResponse(BaseModel):
    id: int
    user_id: int
    filename: Optional[str] = None
    total_domains: int
    processed_domains: int
    malicious_count: int
    suspicious_count: int
    benign_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BatchJobStatus(BaseModel):
    id: int
    status: str
    total_domains: int
    processed_domains: int
    malicious_count: int
    suspicious_count: int
    benign_count: int
    progress_percentage: float
    estimated_time_remaining: Optional[float] = None
