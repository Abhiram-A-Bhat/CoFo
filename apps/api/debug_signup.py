import sys
sys.path.insert(0, ".")

from app.db.session import SessionLocal, engine
from app.db.base import Base

# Ensure all tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    from app.core.security import hash_password
    from app.repositories.users import create_user, get_user_by_email

    email = "debugtest@example.com"

    # Check if already exists
    existing = get_user_by_email(db, email)
    if existing:
        print(f"User already exists: {existing.id}")
    else:
        user = create_user(
            db,
            email=email,
            hashed_password=hash_password("TestPassword123"),
            full_name="Debug Test",
        )
        print(f"User created successfully: {user.id}, {user.email}")

    from app.core.security import create_access_token
    from app.schemas.user import UserPublic

    token, _, expires_at = create_access_token(str(user.id if not existing else existing.id))
    print(f"Token created: {token[:20]}...")

    user_obj = existing or user
    public = UserPublic.model_validate(user_obj)
    print(f"UserPublic schema: {public}")

except Exception as e:
    import traceback
    print("ERROR:")
    traceback.print_exc()
finally:
    db.close()
