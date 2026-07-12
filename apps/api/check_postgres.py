import sys
sys.path.insert(0, '.')
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.database_url)
print("Connecting to:", settings.database_url)

try:
    with engine.connect() as conn:
        # Get tables
        res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [r[0] for r in res.fetchall()]
        print('Tables in Postgres:', tables)

        # Check if users table exists
        if 'users' in tables:
            res = conn.execute(text("SELECT email, role, is_active FROM users WHERE email='abhiramabhat2005@gmail.com'"))
            user = res.fetchone()
            if user:
                print(f'Found user in Postgres: {user[0]}, role={user[1]}, is_active={user[2]}')
                # Make sure the user is admin
                conn.execute(text("UPDATE users SET role='admin' WHERE email='abhiramabhat2005@gmail.com'"))
                conn.commit()
                print('Updated user in Postgres to admin successfully!')
            else:
                print('User NOT found in Postgres! All users in Postgres:')
                res = conn.execute(text("SELECT email, role FROM users"))
                for r in res.fetchall():
                    print(f'  {r[0]}: {r[1]}')
        else:
            print("Users table does not exist in Postgres!")
except Exception as e:
    print("Error connecting/executing in Postgres:", e)
