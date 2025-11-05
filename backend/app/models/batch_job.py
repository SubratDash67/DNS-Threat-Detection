from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename = Column(String(255), nullable=True)
    total_domains = Column(Integer, nullable=False)
    processed_domains = Column(Integer, default=0)
    malicious_count = Column(Integer, default=0)
    suspicious_count = Column(Integer, default=0)
    benign_count = Column(Integer, default=0)
    status = Column(String(50), default="pending", index=True)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
