from app.database import SessionLocal
from app.models import User, Supplier
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def finalize_env():
    db = SessionLocal()
    try:
        # User config
        user = db.query(User).filter(User.username == "Bruce Wayne").first()
        if user:
            user.hashed_password = pwd_context.hash("Batman")
            db.commit()
            print(f"User 'Bruce Wayne' password set to 'Batman'.")
        else:
            print("User 'Bruce Wayne' not found.")
            
        # Supplier config
        s = db.query(Supplier).filter(Supplier.name.ilike("%Alpha Defense%")).first()
        if s:
            s.is_global = True
            db.commit()
            print(f"Supplier '{s.name}' (ID: {s.id}) is now GLOBAL.")
        else:
            print("Alpha Defense Systems not found")
            
    finally:
        db.close()

if __name__ == "__main__":
    finalize_env()
