from sqlalchemy.orm import Session

from app.nlp.entity_extractor import extract_entities
from app.nlp.relationship_extractor import extract_relationships
from app.services.entity_resolution_service import resolve_or_create_entity
from app.graph.supplier_graph_service import create_entity_relationship


def process_document(text: str, db: Session):

    extracted_entities = extract_entities(text)
    extracted_relationships = extract_relationships(text)

    entity_map = {}

    # Resolve entities
    for ent in extracted_entities:
        entity, _ = resolve_or_create_entity(
            name=ent["text"],
            db=db,
            entity_type=ent["label"],
        )

        entity_map[ent["text"]] = entity.canonical_name

    # Resolve relationships
    for rel in extracted_relationships:
        subject = rel["subject"]
        obj = rel["object"]
        relation = rel["relationship"]

        if subject in entity_map and obj in entity_map:
            create_entity_relationship(
                subject_entity=entity_map[subject],
                object_entity=entity_map[obj],
                relationship_type=relation,
                confidence=0.85,
            )
