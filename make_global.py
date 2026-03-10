from app.database import SessionLocal
from app.models import Supplier

def make_global():
    db = SessionLocal()
    try:
        s = db.query(Supplier).filter(Supplier.name == "Alpha Defense Systems").first()
        if s:
            s.is_global = True
            db.commit()
            print(f"Supplier '{s.name}' (ID: {s.id}) is now GLOBAL.")
        else:
            print("Supplier 'Alpha Defense Systems' not found.")
    finally:
        db.close()

if __name__ == "__main__":
    make_global()
