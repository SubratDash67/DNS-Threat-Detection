import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.user import User
from app.core.database import Base

settings = get_settings()


async def init_database():
    print("Initializing database...")

    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    print("Database tables created")

    SessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with SessionLocal() as session:
        demo_user = User(
            email="demo@example.com",
            password=get_password_hash("demo123456"),
            full_name="Demo User",
            role="user",
            is_active=True,
        )

        admin_user = User(
            email="admin@example.com",
            password=get_password_hash("admin123456"),
            full_name="Admin User",
            role="admin",
            is_active=True,
        )

        session.add(demo_user)
        session.add(admin_user)

        await session.commit()

        print("Demo users created:")
        print("  - Email: demo@example.com, Password: demo123456")
        print("  - Email: admin@example.com, Password: admin123456")

    await engine.dispose()
    print("Database initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_database())
