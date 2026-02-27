from fastapi import APIRouter
from app.graph.graph_client import get_session
from app.graph.supplier_graph_service import build_supply_chain_graph

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("/{supplier_name}")
def get_graph(supplier_name: str):
    return build_supply_chain_graph(supplier_name)