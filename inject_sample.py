from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Supplier, Organization, User, GlobalEntity
from app.services.entity_resolution_service import normalize

def inject_sample_supplier():
    db = SessionLocal()
    try:
        # Get Bruce's org (14)
        target_org_id = 14
        org = db.query(Organization).get(target_org_id)
        if not org:
            print(f"Org {target_org_id} not found, using first available.")
            org = db.query(Organization).first()
        
        if not org:
            print("No organizations found at all!")
            return

        print(f"Using Org: {org.name} (ID: {org.id})")
        
        # Ensure a GlobalEntity exists for resolution
        name = "Alpha Defense Systems"
        norm = normalize(name)
        
        entity = db.query(GlobalEntity).filter(GlobalEntity.normalized_name == norm).first()
        if not entity:
            entity = GlobalEntity(
                canonical_name=name,
                normalized_name=norm,
                country="United States",
                entity_type="Company"
            )
            db.add(entity)
            db.commit()
            db.refresh(entity)
            print(f"Created GlobalEntity for {name}")

        # Check if supplier exists
        existing = db.query(Supplier).filter(Supplier.normalized_name == norm, Supplier.organization_id == org.id).first()
        
        if not existing:
            supplier = Supplier(
                name=name,
                normalized_name=norm,
                country="United States",
                industry="Aerospace & Defense",
                address="1 Pentagon Row, Arlington, VA 22202",
                naics_code="336411",
                certifications=["ISO 9001:2015", "AS9100D", "NIST 800-171"],
                organization_id=org.id,
                is_global=False
            )
            db.add(supplier)
            db.commit()
            db.refresh(supplier)
            print(f"Injected supplier: {name} (ID: {supplier.id}) into Org {org.id}")
        else:
            print(f"Supplier {name} already exists in Org {org.id} (ID: {existing.id})")
            existing.address = "1 Pentagon Row, Arlington, VA 22202"
            existing.naics_code = "336411"
            existing.certifications = ["ISO 9001:2015", "AS9100D", "NIST 800-171"]
            db.commit()
            print("Updated existing supplier metadata.")
    finally:
        db.close()

if __name__ == "__main__":
    inject_sample_supplier()
