from app.graph.graph_client import get_session


def create_supplier_node(supplier_name: str):
    with get_session() as session:
        session.run(
            """
            MERGE (s:Supplier {name: $name})
            """,
            name=supplier_name
        )

def link_supplier_to_entity(supplier_name: str, entity_name: str):
    with get_session() as session:
        session.run(
            """
            MERGE (s:Supplier {name: $supplier})
            MERGE (e:GlobalEntity {name: $entity})
            MERGE (s)-[:RESOLVES_TO]->(e)
            """,
            supplier=supplier_name,
            entity=entity_name
        )
