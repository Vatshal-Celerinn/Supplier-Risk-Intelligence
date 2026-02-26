import re
from sqlalchemy.orm import Session

from app.models import (
    GlobalEntity,
    GlobalEntityAlias,
    SupplierEntityLink,
)
from app.graph.supplier_graph_service import (
    create_global_entity_node,
    link_supplier_to_entity,
)


# =====================================================
# NORMALIZATION
# =====================================================

def normalize(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r"[^\w\s]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name


# =====================================================
# RESOLVE OR CREATE GLOBAL ENTITY
# =====================================================

def resolve_or_create_entity(
    name: str,
    db: Session,
    entity_type: str = "COMPANY",
    country: str = None,
):
    normalized_name = normalize(name)

    # ---------------------------------------------
    # 1️⃣ Canonical match
    # ---------------------------------------------
    entity = (
        db.query(GlobalEntity)
        .filter(GlobalEntity.normalized_name == normalized_name)
        .first()
    )

    if entity:
        # Ensure graph node exists (idempotent MERGE)
        create_global_entity_node(
            canonical_name=entity.canonical_name,
            entity_type=entity.entity_type,
            country=entity.country,
        )
        return entity, 1.0

    # ---------------------------------------------
    # 2️⃣ Alias match
    # ---------------------------------------------
    alias = (
        db.query(GlobalEntityAlias)
        .filter(GlobalEntityAlias.normalized_alias == normalized_name)
        .first()
    )

    if alias:
        entity = alias.entity

        # Ensure graph node exists
        create_global_entity_node(
            canonical_name=entity.canonical_name,
            entity_type=entity.entity_type,
            country=entity.country,
        )
        return entity, 0.9

    # ---------------------------------------------
    # 3️⃣ Create new canonical entity
    # ---------------------------------------------
    entity = GlobalEntity(
        canonical_name=name,
        normalized_name=normalized_name,
        entity_type=entity_type,
        country=country,
    )

    db.add(entity)
    db.commit()
    db.refresh(entity)

    # Sync to Neo4j (MERGE = safe)
    create_global_entity_node(
        canonical_name=entity.canonical_name,
        entity_type=entity.entity_type,
        country=entity.country,
    )

    return entity, 1.0


# =====================================================
# RESOLVE SUPPLIER → ENTITY (STRICT 1:1 ENFORCED)
# =====================================================

def resolve_supplier_entity(supplier, db: Session):
    """
    Enforces:
    - Each supplier resolves to exactly one canonical GlobalEntity
    - SQL link always exists
    - Graph RESOLVES_TO relationship always exists
    - Idempotent (safe to call multiple times)
    """

    entity, confidence = resolve_or_create_entity(
        name=supplier.name,
        db=db,
        entity_type="COMPANY",
        country=supplier.country,
    )

    # ---------------------------------------------
    # Ensure exactly ONE link per supplier
    # ---------------------------------------------
    existing_links = (
        db.query(SupplierEntityLink)
        .filter(SupplierEntityLink.supplier_id == supplier.id)
        .all()
    )

    # Remove incorrect links (hard enforcement of 1:1)
    for link in existing_links:
        if link.entity_id != entity.id:
            db.delete(link)

    db.commit()

    # Check correct link exists
    correct_link = (
        db.query(SupplierEntityLink)
        .filter(
            SupplierEntityLink.supplier_id == supplier.id,
            SupplierEntityLink.entity_id == entity.id,
        )
        .first()
    )

    if not correct_link:
        new_link = SupplierEntityLink(
            supplier_id=supplier.id,
            entity_id=entity.id,
            confidence_score=confidence,
            resolution_method="AUTO",
        )
        db.add(new_link)
        db.commit()

    # ---------------------------------------------
    # Always sync graph relationship (MERGE safe)
    # ---------------------------------------------
    link_supplier_to_entity(
        supplier_name=supplier.name,
        canonical_name=entity.canonical_name,
        confidence_score=confidence,
        resolution_method="AUTO",
    )

    return entity