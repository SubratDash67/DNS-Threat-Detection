"""
Async Safelist Population Script for Production
Works with SQLite (aiosqlite) and async SQLAlchemy
"""

import asyncio
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.models.safelist import SafelistDomain
from app.core.config import get_settings
from datetime import datetime

settings = get_settings()

# Sample safelist domains organized by category and tier
SAFELIST_DATA = {
    "tier1": {
        # Tier 1: Critical system domains - Banks, Government, Major Tech
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
        # Tier 2: Corporate/organizational domains
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
        # Tier 3: User-defined trusted domains
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


async def populate_safelist():
    """Populate database with sample safelist data"""
    print("🔐 Populating DNS Safelist Database...")
    print("=" * 60)
    print(f"Database URL: {settings.DATABASE_URL[:50]}...")

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    total_added = 0
    total_skipped = 0

    async with async_session() as session:
        for tier, categories in SAFELIST_DATA.items():
            print(f"\n📊 {tier.upper()}")
            print("-" * 60)

            for category, domains in categories.items():
                print(f"\n  Category: {category}")

                for domain in domains:
                    try:
                        # Check if domain already exists
                        result = await session.execute(
                            select(SafelistDomain).where(
                                SafelistDomain.domain == domain
                            )
                        )
                        existing = result.scalar_one_or_none()

                        if existing:
                            print(f"    ⊘ {domain} (already exists)")
                            total_skipped += 1
                            continue

                        # Add new domain (added_by=None since users table may not exist yet)
                        new_domain = SafelistDomain(
                            domain=domain,
                            tier=tier,
                            source="system",
                            notes=f"Category: {category}",
                            added_by=None,  # NULL - will be updated when admin logs in
                            created_at=datetime.utcnow(),
                        )
                        session.add(new_domain)
                        await session.flush()  # Flush after each add to catch errors early
                        print(f"    ✓ {domain}")
                        total_added += 1

                    except Exception as e:
                        print(f"    ✗ {domain} - Error: {str(e)}")
                        await session.rollback()  # Rollback on error
                        continue

        # Commit all changes
        await session.commit()

    await engine.dispose()

    print("\n" + "=" * 60)
    print(f"✅ Successfully added {total_added} domains to safelist!")
    print(f"⊘ Skipped {total_skipped} existing domains")
    print("\nNote: These are sample domains for demonstration.")
    print("In production, verify and customize this list based on your needs.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(populate_safelist())
