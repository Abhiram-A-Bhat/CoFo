import sys, traceback
sys.path.insert(0, ".")

try:
    from app.db.session import SessionLocal
    from app.services.auth import authenticate_user
    from app.schemas.auth import LoginRequest

    db = SessionLocal()
    try:
        # Try with a known user — change email/password to match what you registered with
        payload = LoginRequest(email="debugtest@example.com", password="TestPassword123")
        result = authenticate_user(db, payload)
        print("Login SUCCESS:", result)
    except Exception as e:
        print("Login ERROR:")
        traceback.print_exc()
    finally:
        db.close()

except Exception as e:
    print("Import/setup ERROR:")
    traceback.print_exc()
