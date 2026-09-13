"""Algorithms router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.algorithm import Algorithm
from app.models.module import Module
from app.schemas.algorithm import AlgorithmResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[AlgorithmResponse],
    summary="List algorithms (optionally filtered by module_id)",
)
def list_algorithms(
    module_id: Optional[int] = Query(None, description="Filter algorithms by parent module ID"),
    db: Session = Depends(get_db),
) -> List[Algorithm]:
    """Retrieve algorithms, optionally filtering by module_id."""
    if module_id is not None:
        # Check whether the specified module exists
        module = db.query(Module).filter(Module.id == module_id).first()
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found",
            )
        algorithms = db.query(Algorithm).filter(Algorithm.module_id == module_id).all()
    else:
        algorithms = db.query(Algorithm).all()

    return algorithms


@router.get(
    "/{id}",
    response_model=AlgorithmResponse,
    summary="Get a specific algorithm by ID",
)
def get_algorithm(
    id: int,
    db: Session = Depends(get_db),
) -> Algorithm:
    """Retrieve a single algorithm by its ID."""
    algorithm = db.query(Algorithm).filter(Algorithm.id == id).first()
    if not algorithm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Algorithm not found",
        )
    return algorithm
