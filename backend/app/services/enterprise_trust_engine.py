from sqlalchemy.orm import Session
from app.graph.graph_client import get_session
from app.models import TrustModelConfig, TrustScoreHistory, GlobalEntity
import math


def calculate_trust_score(entity_name: str, scenario: str, db: Session):

    config = (
        db.query(TrustModelConfig)
        .filter(
            TrustModelConfig.model_name == scenario,
            TrustModelConfig.active == True
        )
        .first()
    )

    if not config:
        raise Exception("Active trust model not configured")

    with get_session() as session:

        result = session.run(
            f"""
            MATCH (e:GlobalEntity {{canonical_name: $name}})
            OPTIONAL MATCH path = (e)-[r:RELATION*1..{config.depth_limit}]->(connected)
            RETURN path
            """,
            name=entity_name,
        )

        total_risk = 0.0
        explainability = []

        for record in result:
            path = record["path"]
            if not path:
                continue

            depth = len(path.relationships)
            depth_decay = 1 / ((depth + 1) * config.decay_factor)

            path_score = 0

            for rel in path.relationships:
                rel_type = rel.get("type", "ASSOCIATED_WITH")
                confidence = rel.get("confidence", 0.5)

                weight = config.relationship_weights.get(rel_type, 0.3)
                path_score += weight * confidence

            path_score *= depth_decay
            total_risk += path_score

            explainability.append({
                "depth": depth,
                "path_score": round(path_score, 4)
            })

        # Direct sanction check
        sanction = session.run(
            """
            MATCH (e:GlobalEntity {canonical_name: $name})
            RETURN e.sanctioned as sanctioned
            """,
            name=entity_name,
        ).single()

        if sanction and sanction["sanctioned"]:
            total_risk += config.sanction_boost
            explainability.append({
                "sanction_boost": config.sanction_boost
            })

        final_score = min(round(total_risk * 20, 2), 100)

    # Persist history (audit)
    entity = (
        db.query(GlobalEntity)
        .filter(GlobalEntity.canonical_name == entity_name)
        .first()
    )

    history = TrustScoreHistory(
        entity_id=entity.id,
        model_version=config.version,
        scenario=scenario,
        score=final_score,
        breakdown=explainability,
    )

    db.add(history)
    db.commit()

    return {
        "score": final_score,
        "model_version": config.version,
        "scenario": scenario,
        "explainability": explainability,
    }
