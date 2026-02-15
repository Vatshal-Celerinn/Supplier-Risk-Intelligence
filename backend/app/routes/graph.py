from fastapi import APIRouter
from app.graph.graph_client import get_session

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("/{entity_name}")
def get_graph(entity_name: str):
    with get_session() as session:
        result = session.run(
            """
            MATCH (n {name: $name})-[r*1..2]-(m)
            RETURN n, r, m
            """,
            name=entity_name
        )

        nodes = {}
        edges = []

        for record in result:
            n = record["n"]
            m = record["m"]

            nodes[n["name"]] = {"id": n["name"], "label": list(n.labels)[0]}
            nodes[m["name"]] = {"id": m["name"], "label": list(m.labels)[0]}

            edges.append({
                "from": n["name"],
                "to": m["name"]
            })

        return {
            "nodes": list(nodes.values()),
            "edges": edges
        }
