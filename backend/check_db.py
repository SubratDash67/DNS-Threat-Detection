"""
Database Connection Checker
Works with both SQLite and PostgreSQL
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, inspect
from app.core.config import get_settings

settings = get_settings()


async def check_database():
    """Check database connection and schema"""
    print(f"🔍 Checking Database Connection...")
    print("=" * 60)
    print(f"Database URL: {settings.DATABASE_URL[:50]}...")

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    try:
        async with engine.begin() as conn:
            # Get all tables
            if "postgresql" in settings.DATABASE_URL:
                # PostgreSQL query
                result = await conn.execute(
                    text(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                    )
                )
            else:
                # SQLite query
                result = await conn.execute(
                    text("SELECT name FROM sqlite_master WHERE type='table'")
                )

            tables = result.fetchall()

            print("\n📊 Existing tables:")
            for table in tables:
                print(f"  ✓ {table[0]}")

            # Check alembic version
            if "postgresql" in settings.DATABASE_URL:
                result = await conn.execute(
                    text(
                        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alembic_version')"
                    )
                )
                has_alembic = result.scalar()
            else:
                result = await conn.execute(
                    text(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'"
                    )
                )
                has_alembic = result.fetchone() is not None

            if has_alembic:
                result = await conn.execute(
                    text("SELECT version_num FROM alembic_version")
                )
                version = result.fetchone()
                if version:
                    print(f"\n🔖 Current Alembic version: {version[0]}")
                else:
                    print("\n⚠️  alembic_version table exists but is empty")
            else:
                print("\n⚠️  alembic_version table does NOT exist")

            # Check users table columns
            if "postgresql" in settings.DATABASE_URL:
                result = await conn.execute(
                    text(
                        """
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = 'users' AND table_schema = 'public'
                        ORDER BY ordinal_position
                        """
                    )
                )
            else:
                result = await conn.execute(text("PRAGMA table_info(users)"))

            columns = result.fetchall()
            if columns:
                print("\n👤 Users table columns:")
                for col in columns:
                    if "postgresql" in settings.DATABASE_URL:
                        print(f"  - {col[0]} ({col[1]})")
                    else:
                        print(f"  - {col[1]} ({col[2]})")
            else:
                print("\n⚠️  Users table not found")

            # Check safelist_domains count
            result = await conn.execute(text("SELECT COUNT(*) FROM safelist_domains"))
            safelist_count = result.scalar()
            print(f"\n🔐 Safelist domains: {safelist_count}")

            # Check users count
            result = await conn.execute(text("SELECT COUNT(*) FROM users"))
            users_count = result.scalar()
            print(f"👥 Total users: {users_count}")

            print("\n" + "=" * 60)
            print("✅ Database connection successful!")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("=" * 60)

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_database())
