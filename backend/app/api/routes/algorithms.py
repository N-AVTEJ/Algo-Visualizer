"""Algorithms router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.algorithm import Algorithm
from app.models.module import Module
from app.schemas.algorithm import AlgorithmResponse
from app.schemas.module1 import Module1RunRequest, Module1RunResponse
from app.schemas.modules2_4 import (
    Module2RunRequest,
    Module2RunResponse,
    Module3RunRequest,
    Module3RunResponse,
    Module4RunRequest,
    Module4RunResponse,
)
from app.schemas.modules5_7 import (
    Module5RunRequest,
    Module5RunResponse,
    Module6RunRequest,
    Module6RunResponse,
    Module7RunRequest,
    Module7RunResponse,
)
from app.schemas.modules8_10 import (
    Module8RunRequest,
    Module8RunResponse,
    Module9RunRequest,
    Module9RunResponse,
    Module10RunRequest,
    Module10RunResponse,
)
from app.algorithms.module1 import run_linear_search, run_binary_search
from app.algorithms.module2 import run_merge_sort, run_quick_sort
from app.algorithms.module3 import run_n_queens
from app.algorithms.module4 import run_floyd_warshall
from app.algorithms.module5 import run_knapsack
from app.algorithms.module6 import run_job_sequencing
from app.algorithms.module7 import run_kruskal
from app.algorithms.module8 import run_branch_bound
from app.algorithms.module9 import run_sat_solver
from app.algorithms.module10 import run_graph_coloring

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


@router.post(
    "/module2/run",
    response_model=Module2RunResponse,
    summary="Run Module 2 algorithm (Merge Sort or Quick Sort) and return execution trace",
)
def run_module2_algorithm(request: Module2RunRequest) -> Module2RunResponse:
    """Execute Merge Sort or Quick Sort and return a deterministic step trace."""
    if request.algorithm == "merge_sort":
        result = run_merge_sort(request.array)
    elif request.algorithm == "quick_sort":
        result = run_quick_sort(request.array)
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported algorithm: {request.algorithm}",
        )

    return Module2RunResponse(**result)


@router.post(
    "/module3/run",
    response_model=Module3RunResponse,
    summary="Run Module 3 algorithm (N-Queens) and return search and backtracking trace",
)
def run_module3_algorithm(request: Module3RunRequest) -> Module3RunResponse:
    """Execute N-Queens backtracking and return a step trace of attempts, placements, and backtracks."""
    try:
        result = run_n_queens(
            n=request.n,
            stop_at_first_solution=request.stop_at_first_solution,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module3RunResponse(**result)


@router.post(
    "/module4/run",
    response_model=Module4RunResponse,
    summary="Run Module 4 algorithm (Floyd-Warshall) and return (k, i, j) relaxation trace",
)
def run_module4_algorithm(request: Module4RunRequest) -> Module4RunResponse:
    """Execute Floyd-Warshall all-pairs shortest paths algorithm with relaxation step trace."""
    try:
        result = run_floyd_warshall(
            matrix=request.matrix,
            labels=request.labels,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module4RunResponse(**result)


@router.post(
    "/module5/run",
    response_model=Module5RunResponse,
    summary="Run Module 5 algorithm (0/1 Knapsack) and return DP table & backtracking trace",
)
def run_module5_algorithm(request: Module5RunRequest) -> Module5RunResponse:
    """Execute 0/1 Knapsack DP algorithm with complete table fill and backtracking trace."""
    items_list = None
    if request.items is not None:
        items_list = [item.model_dump() for item in request.items]

    try:
        result = run_knapsack(
            items=items_list,
            capacity=request.capacity,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module5RunResponse(**result)


@router.post(
    "/module6/run",
    response_model=Module6RunResponse,
    summary="Run Module 6 algorithm (Job Sequencing with Deadlines) and return timeline trace",
)
def run_module6_algorithm(request: Module6RunRequest) -> Module6RunResponse:
    """Execute Job Sequencing with Deadlines greedy algorithm with slot allocation trace."""
    jobs_list = None
    if request.jobs is not None:
        jobs_list = [job.model_dump() for job in request.jobs]

    try:
        result = run_job_sequencing(
            jobs=jobs_list,
            max_slots=request.max_slots,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module6RunResponse(**result)


@router.post(
    "/module7/run",
    response_model=Module7RunResponse,
    summary="Run Module 7 algorithm (Kruskal's MST) and return cycle-detection and edge trace",
)
def run_module7_algorithm(request: Module7RunRequest) -> Module7RunResponse:
    """Execute Kruskal's Minimum Spanning Tree algorithm with Disjoint Set Union decision trace."""
    edges_list = None
    if request.edges is not None:
        edges_list = [edge.model_dump() for edge in request.edges]

    try:
        result = run_kruskal(
            vertices=request.vertices,
            edges=edges_list,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module7RunResponse(**result)


@router.post(
    "/module8/run",
    response_model=Module8RunResponse,
    summary="Run Module 8 algorithm (Branch & Bound 0/1 Knapsack) and return state-space tree trace",
)
def run_module8_algorithm(request: Module8RunRequest) -> Module8RunResponse:
    """Execute 0/1 Knapsack Branch & Bound algorithm with deterministic state-space tree trace."""
    items_list = None
    if request.items is not None:
        items_list = [item.model_dump() for item in request.items]

    try:
        result = run_branch_bound(
            items=items_list,
            capacity=request.capacity,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module8RunResponse(**result)


@router.post(
    "/module9/run",
    response_model=Module9RunResponse,
    summary="Run Module 9 algorithm (Brute-Force SAT Solver) and return truth table trace",
)
def run_module9_algorithm(request: Module9RunRequest) -> Module9RunResponse:
    """Execute Brute-force SAT solver enumerating assignments with clause evaluation trace."""
    try:
        result = run_sat_solver(
            variables=request.variables,
            clauses=request.clauses,
            stop_on_first_satisfying=request.stop_on_first_satisfying if request.stop_on_first_satisfying is not None else True,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module9RunResponse(**result)


@router.post(
    "/module10/run",
    response_model=Module10RunResponse,
    summary="Run Module 10 algorithm (Graph Coloring Backtracking) and return search trace",
)
def run_module10_algorithm(request: Module10RunRequest) -> Module10RunResponse:
    """Execute Graph Coloring backtracking algorithm with conflict detection and chromatic number trace."""
    edges_list = None
    if request.edges is not None:
        edges_list = [edge.model_dump() for edge in request.edges]

    try:
        result = run_graph_coloring(
            vertices=request.vertices,
            edges=edges_list,
            max_colors=request.max_colors,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    return Module10RunResponse(**result)



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
