"""AlgoLens Pro FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router

app = FastAPI(
    title="AlgoLens Pro API",
    description="High-performance backend API for algorithm visualizations and telemetry",
    version="0.1.0",
)

# Configure CORS specifically for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
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
