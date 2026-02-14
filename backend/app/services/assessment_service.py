from sqlalchemy.orm import Session
from app.services.sanctions_service import check_sanctions
from app.services.section889_service import evaluate_section_889
from app.models import AssessmentHistory, ScoringConfig


def generate_executive_brief(overall_status: str):
    if overall_status == "FAIL":
        return "Severe compliance exposure detected. Immediate mitigation recommended."
    if overall_status == "CONDITIONAL":
        return "Moderate compliance risk identified. Enhanced due diligence advised."
    return "No material compliance risk detected based on current screening data."


def get_active_scoring_config(db: Session):
    config = db.query(ScoringConfig).filter_by(active=True).first()

    if not config:
        config = ScoringConfig(
            sanctions_weight=70,
            section889_fail_weight=30,
            section889_conditional_weight=15,
            version="v1",
            active=True
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


def calculate_overall_status(risk_score: int):
    """
    Dynamic threshold logic:
    0–29  → PASS
    30–69 → CONDITIONAL
    70+   → FAIL
    """

    if risk_score >= 70:
        return "FAIL"
    elif risk_score >= 30:
        return "CONDITIONAL"
    else:
        return "PASS"


def run_assessment(supplier_id: int, db: Session):

    config = get_active_scoring_config(db)

    sanctions_result = check_sanctions(supplier_id, db)
    section889_result = evaluate_section_889(supplier_id, db)

    risk_score = 0
    reasons = []

    # Sanctions Weight
    if sanctions_result.get("overall_status") == "FAIL":
        risk_score += config.sanctions_weight
        reasons.append("Supplier matched sanctions list")

    # Section 889 Weights
    section_status = section889_result.get("section_889_status")

    if section_status == "FAIL":
        risk_score += config.section889_fail_weight
        reasons.append(section889_result.get("reason"))

    elif section_status == "CONDITIONAL":
        risk_score += config.section889_conditional_weight
        reasons.append(section889_result.get("reason"))

    # Cap risk score to 100
    risk_score = min(risk_score, 100)

    overall_status = calculate_overall_status(risk_score)

    executive_brief = generate_executive_brief(overall_status)

    # Persist history
    history = AssessmentHistory(
        supplier_id=supplier_id,
        risk_score=risk_score,
        overall_status=overall_status,
        scoring_version=config.version
    )

    db.add(history)
    db.commit()

    return {
        "supplier": sanctions_result.get("supplier"),
        "overall_status": overall_status,
        "risk_score": risk_score,
        "sanctions": sanctions_result,
        "section_889": section889_result,
        "explanations": reasons,
        "executive_brief": executive_brief
    }
