"""Modules router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.module import Module
from app.schemas.module import ModuleResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[ModuleResponse],
    summary="List all curriculum modules",
)
def list_modules(
    db: Session = Depends(get_db),
) -> List[Module]:
    """Retrieve all curriculum modules ordered sequentially."""
    modules = db.query(Module).order_by(Module.order_index.asc()).all()
    return modules


@router.get(
    "/{id}",
    response_model=ModuleResponse,
    summary="Get a specific module by ID",
)
def get_module(
    id: int,
    db: Session = Depends(get_db),
) -> Module:
    """Retrieve a single curriculum module by its ID."""
    module = db.query(Module).filter(Module.id == id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )
    return module
