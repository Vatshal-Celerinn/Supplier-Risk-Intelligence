from app.database import SessionLocal
from app.models import User, Supplier
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def audit():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("--- Users ---")
        for u in users:
            print(f"Username: '{u.username}', ID: {u.id}, OrgID: {u.organization_id}")
        
        print("\n--- Target Supplier ---")
        s = db.query(Supplier).filter(Supplier.name.ilike("%Alpha Defense%")).first()
        if s:
            print(f"Name: {s.name}, ID: {s.id}, OrgID: {s.organization_id}, is_global: {s.is_global}")
        else:
            print("Alpha Defense Systems not found")
            
    finally:
        db.close()

if __name__ == "__main__":
    audit()
