from app.graph.graph_client import get_session
import math


# =====================================================
# RELATIONSHIP WEIGHT CONFIGURATION
# =====================================================

RELATION_WEIGHTS = {
    "OWNS": 1.0,
    "CONTROLS": 0.9,
    "SUBSIDIARY_OF": 0.85,
    "PARTNER_OF": 0.6,
    "ASSOCIATED_WITH": 0.4,
    "MENTIONED_WITH": 0.2,
}


# =====================================================
# BASIC NODE CREATION
# =====================================================

def create_supplier_node(supplier_name: str, organization_id: int = None):
    with get_session() as session:
        session.run(
            """
            MERGE (s:Supplier {name: $name})
            SET s.updated_at = timestamp()
            """,
            name=supplier_name,
        )


def create_global_entity_node(
    canonical_name: str,
    entity_type: str = "COMPANY",
    country: str = None,
):
    with get_session() as session:
        session.run(
            """
            MERGE (e:GlobalEntity {canonical_name: $name})
            SET e.entity_type = $type,
                e.country = $country,
                e.updated_at = timestamp()
            """,
            name=canonical_name,
            type=entity_type,
            country=country,
        )


# =====================================================
# LINK SUPPLIER → ENTITY
# =====================================================

def link_supplier_to_entity(
    supplier_name: str,
    canonical_name: str,
    confidence_score: float = 1.0,
    resolution_method: str = "AUTO",
):
    with get_session() as session:
        session.run(
            """
            MERGE (s:Supplier {name: $supplier})
            MERGE (e:GlobalEntity {canonical_name: $entity})
            MERGE (s)-[r:RESOLVES_TO]->(e)
            SET r.confidence = $confidence,
                r.method = $method,
                r.updated_at = timestamp()
            """,
            supplier=supplier_name,
            entity=canonical_name,
            confidence=confidence_score,
            method=resolution_method,
        )


# =====================================================
# ENTITY RELATIONSHIP CREATION
# =====================================================

def create_entity_relationship(
    subject_entity: str,
    object_entity: str,
    relationship_type: str,
    confidence: float = 0.8,
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
            subject=subject_entity,
            object=object_entity,
            relation=relationship_type.upper(),
            confidence=confidence,
        )


# =====================================================
# SANCTION MARKING
# =====================================================

def mark_entity_as_sanctioned(entity_name: str, source: str):
    with get_session() as session:
        session.run(
            """
            MERGE (e:GlobalEntity {canonical_name: $name})
            SET e.sanctioned = true,
                e.sanction_source = $source,
                e.enterprise_risk_score = 100,
                e.updated_at = timestamp()
            """,
            name=entity_name,
            source=source,
        )


# =====================================================
# ENTERPRISE TRUST SCORING
# =====================================================

def calculate_enterprise_trust_score(entity_name: str):

    with get_session() as session:

        result = session.run(
            """
            MATCH (e:GlobalEntity {canonical_name: $name})
            OPTIONAL MATCH path = (e)-[r:RELATION*1..4]->(connected)
            WITH e, path
            RETURN path
            """,
            name=entity_name,
        )

        total_risk = 0.0
        breakdown = []

        for record in result:
            path = record["path"]
            if not path:
                continue

            depth = len(path.relationships)
            depth_decay = 1 / (depth + 1)

            path_risk = 0.0

            for rel in path.relationships:
                rel_type = rel.get("type", "ASSOCIATED_WITH")
                confidence = rel.get("confidence", 0.5)

                base_weight = RELATION_WEIGHTS.get(rel_type, 0.3)
                weighted_risk = base_weight * confidence
                path_risk += weighted_risk

            path_risk *= depth_decay
            total_risk += path_risk

            breakdown.append({
                "depth": depth,
                "path_risk": round(path_risk, 4),
            })

        sanction_result = session.run(
            """
            MATCH (e:GlobalEntity {canonical_name: $name})
            RETURN e.sanctioned as sanctioned
            """,
            name=entity_name,
        ).single()

        if sanction_result and sanction_result["sanctioned"]:
            total_risk += 1.5
            breakdown.append({"direct_sanction_boost": 1.5})

        normalized_score = min(round(total_risk * 20, 2), 100)

        session.run(
            """
            MATCH (e:GlobalEntity {canonical_name: $name})
            SET e.enterprise_risk_score = $score,
                e.updated_at = timestamp()
            """,
            name=entity_name,
            score=normalized_score,
        )

        return {
            "score": normalized_score,
            "breakdown": breakdown,
        }


# =====================================================
# GRAPH CONFIG
# =====================================================

MAX_DEPTH = 2
MAX_NODES = 200
MAX_EDGES = 400


def classify_risk(score: float, sanctioned: bool):
    if sanctioned:
        return "RED"
    if score is None:
        return "GREEN"
    if score <= 30:
        return "GREEN"
    elif score <= 60:
        return "YELLOW"
    return "RED"


# =====================================================
# MULTI-TIER SUPPLY CHAIN GRAPH
# =====================================================

def build_supply_chain_graph(supplier_name: str, depth: int = MAX_DEPTH):

    nodes = {}
    links = {}
    sanction_paths = []

    with get_session() as session:

        # -------------------------------------------------
        # Tier 0 + Tier 1 (Always include)
        # -------------------------------------------------
        resolve_query = """
        MATCH (s:Supplier {name: $name})-[:RESOLVES_TO]->(g:GlobalEntity)
        RETURN s, g
        """

        resolve_result = session.run(resolve_query, name=supplier_name)

        nodes[supplier_name] = {
            "id": supplier_name,
            "type": "Supplier",
            "tier": 0,
            "risk_score": 0,
            "risk_level": "GREEN",
            "sanctioned": False,
        }

        for record in resolve_result:
            entity_node = record["g"]

            entity_name = entity_node.get("canonical_name")
            risk_score = entity_node.get("enterprise_risk_score", 0)
            sanctioned = entity_node.get("sanctioned", False)

            nodes[entity_name] = {
                "id": entity_name,
                "type": "GlobalEntity",
                "tier": 1,
                "risk_score": risk_score,
                "risk_level": classify_risk(risk_score, sanctioned),
                "sanctioned": sanctioned,
            }

            links[(supplier_name, entity_name)] = {
                "source": supplier_name,
                "target": entity_name,
                "type": "RESOLVES_TO",
            }

        # -------------------------------------------------
        # Tier 2+ Traversal
        # -------------------------------------------------
        query = f"""
        MATCH path =
            (s:Supplier {{name: $name}})
            -[:RESOLVES_TO]->(g:GlobalEntity)
            -[:RELATION*1..{depth}]->(connected:GlobalEntity)
        RETURN path
        """

        result = session.run(query, name=supplier_name)

        for record in result:
            path = record["path"]
            if not path:
                continue

            relationships = path.relationships
            nodes_in_path = path.nodes

            for idx, node in enumerate(nodes_in_path):

                if "GlobalEntity" not in node.labels:
                    continue

                name = node.get("canonical_name")
                if not name:
                    continue

                tier = idx  # depth from supplier

                risk_score = node.get("enterprise_risk_score", 0)
                sanctioned = node.get("sanctioned", False)

                nodes[name] = {
                    "id": name,
                    "type": "GlobalEntity",
                    "tier": tier,
                    "risk_score": risk_score,
                    "risk_level": classify_risk(risk_score, sanctioned),
                    "sanctioned": sanctioned,
                }

            for rel in relationships:
                start = rel.start_node.get("canonical_name")
                end = rel.end_node.get("canonical_name")

                if start and end:
                    links[(start, end)] = {
                        "source": start,
                        "target": end,
                        "type": rel.get("type"),
                    }

        # -------------------------------------------------
        # Sanction Path Detection
        # -------------------------------------------------
        sanction_query = f"""
        MATCH path =
            (s:Supplier {{name: $name}})
            -[:RESOLVES_TO|RELATION*1..{depth}]->
            (g:GlobalEntity {{sanctioned: true}})
        RETURN path
        """

        sanction_result = session.run(sanction_query, name=supplier_name)

        for record in sanction_result:
            path = record["path"]
            sanction_paths.append([
                node.get("canonical_name")
                for node in path.nodes
                if node.get("canonical_name")
            ])

    # -------------------------------------------------
    # Enforce Caps
    # -------------------------------------------------
    node_list = list(nodes.values())[:MAX_NODES]
    link_list = list(links.values())[:MAX_EDGES]

    return {
        "nodes": node_list,
        "links": link_list,
        "sanction_paths": sanction_paths
    }