from sqlalchemy.orm import Session
from app.models import Supplier, SanctionedEntity
from app.services.entity_resolution_service import resolve_supplier_entity, resolve_or_create_entity
from app.services.public_data_service import check_sanctions_lists
from app.graph.graph_client import get_session


MATCH_THRESHOLD = 85


def check_sanctions(supplier_id: int, db: Session):
    supplier = db.query(Supplier).filter_by(id=supplier_id).first()

    if not supplier:
        return {"error": "Supplier not found"}

    # 1. Resolve Supplier safely to a GlobalEntity
    primary_entity = resolve_supplier_entity(supplier, db)
    entities_to_check = {primary_entity.canonical_name: primary_entity}

    # 2. Extract related entities via Graph
    try:
        with get_session() as session:
            # Parents
            parent_result = session.run(
                """
                MATCH (e:GlobalEntity {canonical_name: $name})
                      -[:RELATION {type:'SUBSIDIARY_OF'}]->
                      (parent:GlobalEntity)
                RETURN parent.canonical_name AS name, parent.country AS country
                """,
                name=primary_entity.canonical_name,
            )
            for r in parent_result:
                name = r["name"]
                if name not in entities_to_check:
                    ent, _ = resolve_or_create_entity(name, db, country=r.get("country"))
                    entities_to_check[name] = ent

            # Subsidiaries
            child_result = session.run(
                """
                MATCH (child:GlobalEntity)
                      -[:RELATION {type:'SUBSIDIARY_OF'}]->
                      (e:GlobalEntity {canonical_name: $name})
                RETURN child.canonical_name AS name, child.country AS country
                """,
                name=primary_entity.canonical_name,
            )
            for r in child_result:
                name = r["name"]
                if name not in entities_to_check:
                    ent, _ = resolve_or_create_entity(name, db, country=r.get("country"))
                    entities_to_check[name] = ent
    except Exception as e:
        print(f"⚠️ Graph relation fetch failed for sanctions: {e}")

    # 3. Check direct parent_company attribute if present
    if supplier.parent_company and supplier.parent_company not in entities_to_check:
        ent, _ = resolve_or_create_entity(supplier.parent_company, db)
        entities_to_check[supplier.parent_company] = ent

    all_matches = []
    highest_score = 0

    # 4. Check all entities against live Sanctions APIs
    for name, entity in entities_to_check.items():
        results = check_sanctions_lists(name, entity.country or "")
        
        if results.get("flagged"):
            for hit in results.get("hits", []):
                score = hit.get("match_score", 0)
                if score >= MATCH_THRESHOLD:
                    # Idempotent save to DB
                    existing_sanction = db.query(SanctionedEntity).filter_by(
                        entity_id=entity.id,
                        source=hit.get("list", "Unknown"),
                        program=hit.get("program", "")
                    ).first()

                    if not existing_sanction:
                        new_sanction = SanctionedEntity(
                            source=hit.get("list", "Unknown"),
                            program=hit.get("program", ""),
                            entity_id=entity.id
                        )
                        db.add(new_sanction)

                    all_matches.append({
                        "checked_name": name,
                        "sanctioned_name": hit.get("matched_name"),
                        "source": hit.get("list"),
                        "match_score": score,
                        "program": hit.get("program", ""),
                        "reference_url": hit.get("reference_url", "")
                    })
                    highest_score = max(highest_score, score)
    
    db.commit()

    if all_matches:
        primary_flagged = any(m["checked_name"] == primary_entity.canonical_name for m in all_matches)
        reason = "High confidence sanctions match on primary supplier" if primary_flagged else "High confidence sanctions match on related entity"
        return {
            "supplier": supplier.name,
            "overall_status": "FAIL",
            "risk_score": 100,
            "reason": reason,
            "matches": all_matches
        }

    return {
        "supplier": supplier.name,
        "overall_status": "PASS",
        "risk_score": 0,
        "reason": "No sanctions match found",
        "matches": []
    }
