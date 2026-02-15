import re
from sqlalchemy.orm import Session
from sqlalchemy import or_

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

    # Check canonical match
    entity = (
        db.query(GlobalEntity)
        .filter(GlobalEntity.normalized_name == normalized_name)
        .first()
    )

    if entity:
        return entity, 1.0

    # Check alias match
    alias = (
        db.query(GlobalEntityAlias)
        .filter(GlobalEntityAlias.normalized_alias == normalized_name)
        .first()
    )

    if alias:
        return alias.entity, 0.9

    # Create new canonical entity
    entity = GlobalEntity(
        canonical_name=name,
        normalized_name=normalized_name,
        entity_type=entity_type,
        country=country,
    )

    db.add(entity)
    db.commit()
    db.refresh(entity)

    # Sync to Neo4j
    create_global_entity_node(
        canonical_name=name,
        entity_type=entity_type,
        country=country,
    )

    return entity, 1.0


# =====================================================
# RESOLVE SUPPLIER → ENTITY
# =====================================================

def resolve_supplier_entity(supplier, db: Session):
    entity, confidence = resolve_or_create_entity(
        name=supplier.name,
        db=db,
        entity_type="COMPANY",
        country=supplier.country,
    )

    # Prevent duplicate link
    existing = (
        db.query(SupplierEntityLink)
        .filter(
            SupplierEntityLink.supplier_id == supplier.id,
            SupplierEntityLink.entity_id == entity.id,
        )
        .first()
    )

    if not existing:
        link = SupplierEntityLink(
            supplier_id=supplier.id,
            entity_id=entity.id,
            confidence_score=confidence,
            resolution_method="AUTO",
        )

        db.add(link)
        db.commit()

    # Sync relationship to graph
    link_supplier_to_entity(
        supplier_name=supplier.name,
        canonical_name=entity.canonical_name,
        confidence_score=confidence,
        resolution_method="AUTO",
    )

    return entity
