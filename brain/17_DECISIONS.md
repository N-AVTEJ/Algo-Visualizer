# 17 DECISIONS

This log records significant architectural, technical, and product decisions made during the project lifecycle.

---

### Decision: DEC-001
- **Date**: 2026-09-13
- **Decision**: Initialize the Project Brain (`brain/`) as the single source of truth for specifications, architecture, decisions, and tasks.
- **Reason**: Establish disciplined engineering practices, prevent hallucinated assumptions or architectural drift, and maintain alignment between code and documentation.
- **Alternatives Considered**: Direct ad-hoc coding without a specification layer.
- **Consequences**: Every architectural or product evolution must be documented in `brain/`, keeping microtasks and specifications synchronized with code changes.

---

### Decision: DEC-002
- **Date**: 2026-09-13
- **Decision**: Adopt a dual-package monorepo (`frontend/` + `backend/`) using Vite + React 18 + TypeScript + Tailwind CSS for frontend and Python venv + FastAPI for backend, with no Docker, Redis, or Celery.
- **Reason**: Allows seamless, low-overhead local development without container virtualization or daemon dependencies while maintaining modular separation of concerns.
- **Alternatives Considered**: Next.js full-stack framework; Docker Compose with containerized services.
- **Consequences**: Developers run frontend with `npm run dev` and backend with `uvicorn app.main:app --reload` natively. Dependency management for Python is locked via `pip-tools`.
