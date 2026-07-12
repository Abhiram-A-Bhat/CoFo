import sqlite3

conn = sqlite3.connect('fundflow.db')
cur = conn.cursor()

# 1. Create announcements table if missing
cur.execute("""
CREATE TABLE IF NOT EXISTS announcements (
    id CHAR(32) PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1
)
""")
print("announcements table ready")

# 2. Create system_settings table if missing
cur.execute("""
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(4000) NOT NULL
)
""")
print("system_settings table ready")

# 3. Add missing columns to profile_verifications
try:
    cur.execute("ALTER TABLE profile_verifications ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 0")
    print("Added is_verified to profile_verifications")
except Exception as e:
    print(f"is_verified: {e}")

try:
    cur.execute("ALTER TABLE profile_verifications ADD COLUMN rejection_reason VARCHAR(500)")
    print("Added rejection_reason to profile_verifications")
except Exception as e:
    print(f"rejection_reason: {e}")

conn.commit()

# Verify
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
print("\nAll tables:", [r[0] for r in cur.fetchall()])

cur.execute("PRAGMA table_info(profile_verifications)")
print("profile_verifications cols:", [c[1] for c in cur.fetchall()])

conn.close()
print("\nAll migrations done!")
