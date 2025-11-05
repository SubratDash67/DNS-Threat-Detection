from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class HistoryFilter(BaseModel):
    domain: Optional[str] = None
    result: Optional[str] = None
    method: Optional[str] = None
    min_confidence: Optional[float] = None
    max_confidence: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    batch_only: bool = False
    page: int = 1
    page_size: int = 50


class AnalyticsDashboard(BaseModel):
    total_scans: int
    unique_domains: int
    threat_rate: float
    avg_processing_time: float
    today_scans: int
    week_scans: int
    month_scans: int


class TrendData(BaseModel):
    date: str
    total_scans: int
    malicious_count: int
    suspicious_count: int
    benign_count: int


class TLDAnalysis(BaseModel):
    tld: str
    total_count: int
    malicious_count: int
    suspicious_count: int
    benign_count: int
    risk_score: float


class HeatmapData(BaseModel):
    hour: int
    day: str
    count: int


class ReportRequest(BaseModel):
    report_type: str
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_charts: bool = True
    filters: Optional[Dict[str, Any]] = None
