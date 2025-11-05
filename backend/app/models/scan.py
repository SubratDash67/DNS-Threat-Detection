from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    domain = Column(String(255), nullable=False, index=True)
    result = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    method = Column(String(100), nullable=False)
    reason = Column(String(500), nullable=True)
    stage = Column(String(100), nullable=True)
    latency_ms = Column(Float, nullable=False)
    features = Column(JSON, nullable=True)
    typosquatting_target = Column(String(255), nullable=True)
    edit_distance = Column(Integer, nullable=True)
    safelist_tier = Column(String(50), nullable=True)
    batch_job_id = Column(
        Integer,
        ForeignKey("batch_jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
