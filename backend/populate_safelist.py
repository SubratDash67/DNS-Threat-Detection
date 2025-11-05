"""
Sample Safelist Data Script
Populates database with categorized safelist domains
"""

import sqlite3
from datetime import datetime

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
        ],
    },
    "tier2": {
        # Tier 2: Corporate/organizational domains - Education, News, E-commerce
        "Education": [
            "mit.edu",
            "stanford.edu",
            "harvard.edu",
            "berkeley.edu",
            "princeton.edu",
            "yale.edu",
            "columbia.edu",
            "cornell.edu",
            "upenn.edu",
            "caltech.edu",
            "coursera.org",
            "edx.org",
            "khanacademy.org",
            "udemy.com",
            "codecademy.com",
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
            "newegg.com",
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
            "atlassian.com",
        ],
        "Communication": [
            "slack.com",
            "discord.com",
            "telegram.org",
            "skype.com",
            "teams.microsoft.com",
            "webex.com",
            "gotomeeting.com",
        ],
        "Productivity": [
            "notion.so",
            "trello.com",
            "asana.com",
            "monday.com",
            "airtable.com",
            "evernote.com",
            "todoist.com",
            "figma.com",
        ],
    },
}


def populate_safelist():
    """Populate database with sample safelist data"""
    conn = sqlite3.connect("dns_detection.db")
    cursor = conn.cursor()

    print("🔐 Populating DNS Safelist Database...")
    print("=" * 60)

    total_added = 0

    for tier, categories in SAFELIST_DATA.items():
        print(f"\n📊 {tier.upper()}")
        print("-" * 60)

        for category, domains in categories.items():
            print(f"\n  Category: {category}")

            for domain in domains:
                try:
                    cursor.execute(
                        """
                        INSERT INTO safelist_domains (domain, tier, source, notes, added_by, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """,
                        (
                            domain,
                            tier,
                            "system",
                            f"Category: {category}",
                            1,  # System user
                            datetime.utcnow().isoformat(),
                        ),
                    )
                    print(f"    ✓ {domain}")
                    total_added += 1
                except sqlite3.IntegrityError:
                    print(f"    ⊘ {domain} (already exists)")

    conn.commit()
    conn.close()

    print("\n" + "=" * 60)
    print(f"✅ Successfully added {total_added} domains to safelist!")
    print("\nNote: These are sample domains for demonstration.")
    print("In production, verify and customize this list based on your needs.")
    print("=" * 60)


if __name__ == "__main__":
    populate_safelist()
