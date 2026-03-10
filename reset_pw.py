from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "Bruce W").first()
        if user:
            user.hashed_password = pwd_context.hash("password123")
            db.commit()
            print("Password for 'Bruce W' reset to 'password123'")
        else:
            print("User 'Bruce W' not found")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password()
