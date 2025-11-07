from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "DNS Threat Detection API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "production"
    ENVIRONMENT: str = "production"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Support both PostgreSQL and SQLite
    # PostgreSQL format: postgresql+asyncpg://user:password@host:port/database
    # SQLite format: sqlite+aiosqlite:///./dns_security.db
    DATABASE_URL: str = "sqlite+aiosqlite:///./dns_security.db"

    # CORS - Allow production frontend URLs
    ALLOWED_ORIGINS: Optional[str] = None

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """Parse CORS origins from environment variable or use defaults"""
        if self.ALLOWED_ORIGINS:
            # Split comma-separated origins for production
            origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
            return origins
        # Development defaults
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
        ]

    RATE_LIMIT_PER_MINUTE: int = 60

    CACHE_TTL_SECONDS: int = 3600

    MAX_BATCH_SIZE: int = 10000
    BATCH_CHUNK_SIZE: int = 100

    # Render-specific: Use PORT environment variable
    PORT: int = int(os.getenv("PORT", "8000"))

    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow extra fields for backwards compatibility
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
