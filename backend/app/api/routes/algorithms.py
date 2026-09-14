"""Algorithms router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.algorithm import Algorithm
from app.models.module import Module
from app.schemas.algorithm import AlgorithmResponse
from app.schemas.module1 import Module1RunRequest, Module1RunResponse
from app.algorithms.module1 import run_linear_search, run_binary_search

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


@router.post(
    "/module1/run",
    response_model=Module1RunResponse,
    summary="Run Module 1 algorithm (Linear or Binary Search) and return execution trace",
)
def run_module1_algorithm(request: Module1RunRequest) -> Module1RunResponse:
    """Execute Linear Search or Binary Search and return a deterministic step trace."""
    if request.algorithm == "linear":
        result = run_linear_search(request.array, request.target)
    elif request.algorithm == "binary":
        try:
            result = run_binary_search(request.array, request.target)
        except ValueError as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(err),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported algorithm: {request.algorithm}",
        )

    return Module1RunResponse(**result)


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
