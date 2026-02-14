from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from app.models import Supplier, SanctionedEntity


MATCH_THRESHOLD = 85


def normalize(text: str):
    return text.lower().replace(",", "").replace(".", "").strip()


def check_sanctions(supplier_id: int, db: Session):
    supplier = db.query(Supplier).filter_by(id=supplier_id).first()

    if not supplier:
        return {"error": "Supplier not found"}

    matches = []
    sanctions = db.query(SanctionedEntity).all()

    supplier_name = normalize(supplier.name)

    highest_score = 0

    for entity in sanctions:
        score = fuzz.token_set_ratio(
            supplier_name,
            normalize(entity.name)
        )

        if score >= MATCH_THRESHOLD:
            matches.append({
                "sanctioned_name": entity.name,
                "source": entity.source,
                "match_score": score
            })

            highest_score = max(highest_score, score)

    if matches:
        return {
            "supplier": supplier.name,
            "overall_status": "FAIL",
            "risk_score": 100,
            "reason": "High confidence sanctions match",
            "matches": matches
        }

    return {
        "supplier": supplier.name,
        "overall_status": "PASS",
        "risk_score": 0,
        "reason": "No sanctions match found",
        "matches": []
    }
