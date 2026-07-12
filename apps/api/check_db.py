import sqlite3

conn = sqlite3.connect('fundflow.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]
print('Tables:', tables)

# Check needed tables for admin
needed = ['users', 'profile_verifications', 'announcements', 'match_settings', 'revoked_tokens']
for t in needed:
    if t not in tables:
        print(f'MISSING: {t}')
    else:
        cur.execute(f'PRAGMA table_info({t})')
        cols = [c[1] for c in cur.fetchall()]
        print(f'OK: {t} - cols: {cols}')

conn.close()
