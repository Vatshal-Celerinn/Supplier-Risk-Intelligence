from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Migrating Supplier table...")
        try:
            conn.execute(text("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address VARCHAR;"))
            conn.execute(text("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS naics_code VARCHAR;"))
            conn.execute(text("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS certifications JSON;"))
            conn.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
