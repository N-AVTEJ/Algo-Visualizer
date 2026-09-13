"""API router aggregation."""
from fastapi import APIRouter
from app.api.routes import auth, modules, algorithms, progress

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(algorithms.router, prefix="/algorithms", tags=["algorithms"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
