# 16 CHANGELOG

All notable changes to this project will be documented in this file chronologically.

## [0.1.0] - 2026-09-13
### Added
- Monorepo structure established for **AlgoLens Pro** with isolated `frontend/` and `backend/` packages.
- Frontend setup with Vite, React 18, TypeScript, Tailwind CSS, ESLint, and Prettier.
- Frontend folder structure: `src/components`, `src/pages`, `src/store`, `src/api`, `src/types`.
- Backend setup with Python 3.13 virtual environment (`venv`), FastAPI app in `app/main.py` with `GET /health` endpoint.
- Dependency locking via `pip-tools` with `requirements.in` and compiled `requirements.txt` (including `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `python-jose`, `passlib`).
- Root `README.md` with instructions for running frontend and backend locally without Docker.
- Root `.gitignore` configured to ignore `node_modules`, `venv`, `__pycache__`, `.env`, and build artifacts.
- Created and switched to `dev` branch off `main`.

### Removed
- Cleaned up orphaned root-level Next.js temporary files and empty database folders.

## Initial Documentation
- Created project brain documentation.
- No application code was modified during brain initialization.
