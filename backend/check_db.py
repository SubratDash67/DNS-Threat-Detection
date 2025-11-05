import sqlite3

# Connect to the database
conn = sqlite3.connect("dns_detection.db")
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Existing tables:")
for table in tables:
    print(f"  - {table[0]}")

# Check if alembic_version exists and what version it has
cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'"
)
if cursor.fetchone():
    cursor.execute("SELECT version_num FROM alembic_version")
    version = cursor.fetchone()
    if version:
        print(f"\nCurrent Alembic version: {version[0]}")
    else:
        print("\nalembic_version table exists but is empty")
else:
    print("\nalembic_version table does NOT exist")

# Check if users table has avatar_url column
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print("\nUsers table columns:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

conn.close()
