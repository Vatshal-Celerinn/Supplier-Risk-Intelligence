from app.graph.graph_client import get_session


def create_global_entity_node(name: str, entity_type: str):
    with get_session() as session:
        session.run(
            """
            MERGE (e:GlobalEntity {canonical_name: $name})
            SET e.entity_type = $type,
                e.updated_at = timestamp()
            """,
            name=name,
            type=entity_type,
        )


def create_relationship(
    subject: str,
    obj: str,
    relation: str,
    confidence: float,
):
    with get_session() as session:
        session.run(
            """
            MERGE (a:GlobalEntity {canonical_name: $subject})
            MERGE (b:GlobalEntity {canonical_name: $object})
            MERGE (a)-[r:RELATION {type: $relation}]->(b)
            SET r.confidence = $confidence,
                r.weight = $confidence * 10,
                r.updated_at = timestamp()
            """,
            subject=subject,
            object=obj,
            relation=relation.upper(),
            confidence=confidence,
        )
