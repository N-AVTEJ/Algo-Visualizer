"""AlgoLens Pro FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="AlgoLens Pro API",
    description="High-performance backend API for algorithm visualizations and telemetry",
    version="0.1.0",
)

cors_origins = settings.CORS_ORIGINS
allow_credentials = cors_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AlgoLens Pro API",
        "version": "0.1.0",
    }


@app.get("/", tags=["Root"])
async def root():
    """Root metadata endpoint."""
    return {
        "message": "Welcome to AlgoLens Pro API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
