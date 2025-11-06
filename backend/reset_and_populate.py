"""
Database Reset and Safelist Population Script
Truncates users, scans, and safelist, then populates safelist with default data
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete, text
from app.models.safelist import SafelistDomain
from app.models.user import User
from app.models.scan import Scan
from app.models.batch_job import BatchJob
from app.core.config import get_settings
from datetime import datetime

settings = get_settings()

# Safelist data
SAFELIST_DATA = {
    "tier1": {
        "Banking & Finance": [
            "chase.com",
            "bankofamerica.com",
            "wellsfargo.com",
            "citibank.com",
            "usbank.com",
            "capitalone.com",
            "discover.com",
            "americanexpress.com",
            "paypal.com",
            "venmo.com",
            "stripe.com",
            "square.com",
        ],
        "Government": [
            "usa.gov",
            "irs.gov",
            "ssa.gov",
            "cdc.gov",
            "fda.gov",
            "nasa.gov",
            "whitehouse.gov",
            "state.gov",
            "treasury.gov",
            "defense.gov",
        ],
        "Major Tech Companies": [
            "google.com",
            "microsoft.com",
            "apple.com",
            "amazon.com",
            "facebook.com",
            "twitter.com",
            "linkedin.com",
            "github.com",
            "youtube.com",
            "instagram.com",
            "whatsapp.com",
            "zoom.us",
            "netflix.com",
            "spotify.com",
            "reddit.com",
            "wikipedia.org",
        ],
    },
    "tier2": {
        "Education": [
            "mit.edu",
            "stanford.edu",
            "harvard.edu",
            "berkeley.edu",
            "princeton.edu",
            "yale.edu",
            "columbia.edu",
            "cornell.edu",
            "coursera.org",
            "edx.org",
            "khanacademy.org",
            "udemy.com",
        ],
        "News & Media": [
            "bbc.com",
            "cnn.com",
            "nytimes.com",
            "theguardian.com",
            "washingtonpost.com",
            "reuters.com",
            "apnews.com",
            "bloomberg.com",
            "wsj.com",
            "npr.org",
            "forbes.com",
            "economist.com",
        ],
        "E-commerce": [
            "ebay.com",
            "walmart.com",
            "target.com",
            "bestbuy.com",
            "homedepot.com",
            "costco.com",
            "alibaba.com",
            "etsy.com",
            "shopify.com",
            "wayfair.com",
        ],
        "Cloud Services": [
            "aws.amazon.com",
            "azure.microsoft.com",
            "cloud.google.com",
            "digitalocean.com",
            "heroku.com",
            "cloudflare.com",
            "dropbox.com",
            "box.com",
            "onedrive.com",
            "icloud.com",
        ],
    },
    "tier3": {
        "Development Tools": [
            "stackoverflow.com",
            "gitlab.com",
            "bitbucket.org",
            "npmjs.com",
            "pypi.org",
            "docker.com",
            "kubernetes.io",
            "jenkins.io",
            "jetbrains.com",
            "visualstudio.com",
        ],
        "Communication": [
            "slack.com",
            "discord.com",
            "telegram.org",
            "skype.com",
            "teams.microsoft.com",
            "webex.com",
        ],
        "Productivity": [
            "notion.so",
            "trello.com",
            "asana.com",
            "monday.com",
            "airtable.com",
            "evernote.com",
            "figma.com",
        ],
    },
}


async def reset_database():
    """Truncate all user data and safelist"""
    print("🗑️  Resetting Database...")
    print("=" * 60)

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        try:
            # Delete in order to respect foreign keys
            print("Deleting batch jobs...")
            await session.execute(delete(BatchJob))

            print("Deleting scans...")
            await session.execute(delete(Scan))

            print("Deleting users...")
            await session.execute(delete(User))

            print("Deleting safelist domains...")
            await session.execute(delete(SafelistDomain))

            await session.commit()
            print("✅ Database reset complete!\n")

        except Exception as e:
            await session.rollback()
            print(f"❌ Error resetting database: {str(e)}")
            raise

    await engine.dispose()


async def populate_safelist():
    """Populate safelist with default domains"""
    print("🔐 Populating Safelist...")
    print("=" * 60)

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    total_added = 0

    async with async_session() as session:
        for tier, categories in SAFELIST_DATA.items():
            print(f"\n📊 {tier.upper()}")
            print("-" * 60)

            for category, domains in categories.items():
                print(f"\n  Category: {category}")

                for domain in domains:
                    try:
                        new_domain = SafelistDomain(
                            domain=domain,
                            tier=tier,
                            source="system",
                            notes=f"Category: {category}",
                            added_by=None,
                            created_at=datetime.utcnow(),
                        )
                        session.add(new_domain)
                        await session.flush()
                        print(f"    ✓ {domain}")
                        total_added += 1

                    except Exception as e:
                        print(f"    ✗ {domain} - Error: {str(e)}")
                        await session.rollback()
                        continue

        await session.commit()

    await engine.dispose()

    print("\n" + "=" * 60)
    print(f"✅ Successfully added {total_added} domains to safelist!")
    print("=" * 60)


async def main():
    """Main execution"""
    print("\n" + "=" * 60)
    print("DATABASE RESET AND SAFELIST POPULATION")
    print("=" * 60)
    print(f"Database: {settings.DATABASE_URL[:50]}...\n")

    # Step 1: Reset database
    await reset_database()

    # Step 2: Populate safelist
    await populate_safelist()

    print("\n" + "=" * 60)
    print("✅ ALL DONE!")
    print("=" * 60)
    print("\nDatabase is now clean with populated safelist.")
    print("You can now register a new user and start using the system.\n")


if __name__ == "__main__":
    asyncio.run(main())
