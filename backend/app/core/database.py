from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta
from typing import AsyncGenerator
from app.core.config import get_settings

settings = get_settings()

# Prepare database URL for async engine
database_url = settings.DATABASE_URL

# Add async driver if using PostgreSQL and it's not already specified
if "postgresql" in database_url and "+asyncpg" not in database_url:
    # Replace postgresql:// with postgresql+asyncpg://
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
elif "sqlite" in database_url and "+aiosqlite" not in database_url:
    # Replace sqlite:/// with sqlite+aiosqlite:///
    database_url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///")

# Configure engine with appropriate settings for PostgreSQL or SQLite
if "postgresql" in database_url:
    # PostgreSQL configuration with connection pooling
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        future=True,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
else:
    # SQLite configuration (for local development)
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        future=True,
        connect_args={"check_same_thread": False},
    )

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base: DeclarativeMeta = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
