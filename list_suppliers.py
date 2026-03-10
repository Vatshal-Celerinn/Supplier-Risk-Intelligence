from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Supplier, Organization

def list_suppliers():
    db = SessionLocal()
    try:
        suppliers = db.query(Supplier).all()
        print(f"Total suppliers: {len(suppliers)}")
        for s in suppliers:
            print(f"ID: {s.id}, Name: {s.name}, Normalized: {s.normalized_name}, OrgID: {s.organization_id}")
    finally:
        db.close()

if __name__ == "__main__":
    list_suppliers()
