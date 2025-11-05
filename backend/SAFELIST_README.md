# Safelist Database - Important Notes

## Overview
The safelist database contains **108 sample domains** organized into 3 tiers for demonstration purposes.

## Tier Structure

### Tier 1 - System/Critical (34 domains)
**Purpose:** High-trust domains that are essential services
**Categories:**
- **Banking & Finance** (12): Chase, Bank of America, Wells Fargo, PayPal, Stripe, etc.
- **Government** (10): usa.gov, irs.gov, nasa.gov, cdc.gov, etc.
- **Major Tech Companies** (12): Google, Microsoft, Apple, Amazon, GitHub, etc.

### Tier 2 - Corporate/Organizational (55 domains)
**Purpose:** Verified organizational and corporate domains
**Categories:**
- **Education** (15): MIT, Stanford, Harvard, Coursera, Khan Academy, etc.
- **News & Media** (12): BBC, CNN, NY Times, Reuters, Bloomberg, etc.
- **E-commerce** (11): eBay, Walmart, Target, Best Buy, Shopify, etc.
- **Cloud Services** (10): AWS, Azure, Google Cloud, DigitalOcean, Cloudflare, etc.

### Tier 3 - User-Defined (19 domains)
**Purpose:** User-trusted domains for specific use cases
**Categories:**
- **Development Tools** (11): Stack Overflow, GitLab, NPM, Docker, Jenkins, etc.
- **Communication** (7): Slack, Discord, Telegram, Teams, Zoom, etc.
- **Productivity** (8): Notion, Trello, Asana, Airtable, Figma, etc.

## ⚠️ IMPORTANT WARNINGS

### 🔴 Production Use
**These are SAMPLE domains for demonstration only!**

Before deploying to production:
1. **Review every domain** - Verify they align with your organization's trust policies
2. **Add your domains** - Include your organization's legitimate domains
3. **Remove unnecessary entries** - Delete domains not relevant to your use case
4. **Verify ownership** - Ensure domains listed are actually owned by claimed entities
5. **Regular updates** - Keep the safelist current (domains can be sold/transferred)

### 🔴 Security Considerations
- **False sense of security:** A safelist does NOT guarantee safety
- **Domain hijacking:** Legitimate domains can be compromised
- **Subdomain abuse:** Even trusted domains can have malicious subdomains
- **Typosquatting:** Similar-looking domains can bypass safelist checks
- **DNS cache poisoning:** Safelist checks can be circumvented

### 🔴 Maintenance Requirements
- Review safelist quarterly at minimum
- Monitor for domain ownership changes
- Track domain expiration dates
- Audit usage patterns
- Document approval process for additions

## Usage

### Populating the Database
```bash
# Run from backend directory with virtual environment active
cd dns_web_app/backend
python populate_safelist.py
```

### Adding Custom Domains
Via API:
```bash
POST /api/safelist
{
  "domain": "example.com",
  "tier": "tier3",
  "notes": "Corporate internal domain"
}
```

Via UI:
1. Navigate to Safelist page
2. Click "Add Domain" button
3. Enter domain and select tier
4. Add notes for documentation

### Exporting Safelist
```bash
GET /api/safelist/export?tier=tier1
```

## Integration with Detection System

The safelist is checked **before** ML model prediction:
1. Domain arrives for scanning
2. Check Tier 1 safelist → If match, return "benign" (instant)
3. Check Tier 2 safelist → If match, return "benign" (instant)
4. Check Tier 3 safelist → If match, return "benign" (instant)
5. No match → Proceed to ML model for classification

**Performance benefit:** Safelist hits bypass ML inference, reducing latency by ~95%

## Database Schema
```sql
CREATE TABLE safelist_domains (
    id INTEGER PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(10) NOT NULL,  -- 'tier1', 'tier2', 'tier3'
    source VARCHAR(50),          -- 'system', 'user', 'corporate'
    notes TEXT,
    added_by INTEGER,            -- Foreign key to users table
    created_at DATETIME,
    FOREIGN KEY (added_by) REFERENCES users(id)
);
```

## Best Practices

### What to Add
✅ Your organization's legitimate domains
✅ Verified partner/vendor domains
✅ Well-known infrastructure (CDNs, cloud providers)
✅ Government/educational institutions (after verification)
✅ Financial institutions (after verification)

### What NOT to Add
❌ Domains you "think" are safe
❌ Newly registered domains (<90 days old)
❌ Free hosting/subdomain services
❌ URL shorteners (bit.ly, tinyurl, etc.)
❌ Dynamic DNS domains
❌ Domains without proper WHOIS information

## Monitoring & Logging

All safelist hits are logged in the `scans` table with:
- `method: "safelist"`
- `tier: "tier1" | "tier2" | "tier3"`
- Timestamp and user information

Use analytics to:
- Track safelist hit rates
- Identify frequently scanned safelisted domains
- Detect unusual patterns
- Justify safelist maintenance efforts

## Support

For questions or issues:
1. Review this documentation
2. Check the API documentation at `/docs`
3. Consult the deployment guide
4. Contact system administrator

---

**Last Updated:** November 2025
**Safelist Version:** 1.0.0
**Total Domains:** 108 (demonstration)
