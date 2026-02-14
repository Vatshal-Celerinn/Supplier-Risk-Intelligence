from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Supplier, AssessmentHistory, User
from app.schemas import SupplierCreate, SupplierResponse
from typing import List
from app.services.assessment_service import run_assessment
from app.services.audit_service import log_action
from app.routes.auth import get_current_user
import asyncio

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.post("/", response_model=SupplierResponse)
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)

    # Audit log
    log_action(
        db=db,
        user_id=current_user.id,
        action="CREATE_SUPPLIER",
        resource_type="Supplier",
        resource_id=db_supplier.id,
        details={"name": db_supplier.name},
    )

    return db_supplier


@router.get("/", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()


@router.get("/with-status")
def list_suppliers_with_status(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    result = []

    for supplier in suppliers:
        latest = (
            db.query(AssessmentHistory)
            .filter(AssessmentHistory.supplier_id == supplier.id)
            .order_by(AssessmentHistory.created_at.desc())
            .first()
        )

        result.append({
            "id": supplier.id,
            "name": supplier.name,
            "country": supplier.country,
            "industry": supplier.industry,
            "risk": latest.overall_status if latest else None,
        })

    return result


@router.get("/{supplier_id}/assessment")
def supplier_assessment(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = run_assessment(supplier_id, db)

    # Audit log
    log_action(
        db=db,
        user_id=current_user.id,
        action="RUN_ASSESSMENT",
        resource_type="Supplier",
        resource_id=supplier_id,
        details={"result": result.get("overall_status")},
    )

    return result


@router.post("/compare")
def compare_suppliers(
    supplier_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []

    for sid in supplier_ids:
        result = run_assessment(sid, db)

        log_action(
            db=db,
            user_id=current_user.id,
            action="RUN_ASSESSMENT_COMPARE",
            resource_type="Supplier",
            resource_id=sid,
            details={"result": result.get("overall_status")},
        )

        results.append(result)

    return results


@router.get("/{supplier_id}/history")
def supplier_history(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.supplier_id == supplier_id)
        .order_by(AssessmentHistory.created_at.asc())
        .all()
    )


@router.websocket("/stream/{supplier_id}")
async def stream_supplier(websocket: WebSocket, supplier_id: int):
    await websocket.accept()
    from app.database import SessionLocal

    while True:
        db = SessionLocal()
        result = run_assessment(supplier_id, db)
        db.close()
        await websocket.send_json(result)
        await asyncio.sleep(5)
