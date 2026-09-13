# 02 TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 1. Technology Stack Summary
- **Languages**: TypeScript (Frontend), Python 3.13 (Backend)
- **Frontend Framework**: React 18 (`react@^18.3.1`, `react-dom@^18.3.1`)
- **Frontend Build Tool & Bundler**: Vite (`vite@^5.4.14`, `@vitejs/plugin-react@^4.3.4`)
- **Frontend Styling**: Tailwind CSS (`tailwindcss@^3.4.17`, PostCSS, Autoprefixer)
- **Frontend Code Quality**: ESLint (`eslint@^8.57.0`, `@typescript-eslint`), Prettier (`prettier@^3.5.1`)
- **Backend Framework**: FastAPI (`fastapi>=0.115.0`)
- **Backend ASGI Server**: Uvicorn (`uvicorn[standard]>=0.34.0`)
- **Backend Virtual Environment**: Python `venv` (local, non-Docker)
- **Backend Dependency Management**: `pip-tools` (`requirements.in` compiling to `requirements.txt`)
- **Database Layer**: SQLAlchemy (`sqlalchemy>=2.0.38`), Alembic (`alembic>=1.14.1`), PostgreSQL driver (`psycopg2-binary>=2.9.10`)
- **Authentication & Cryptography**: Python-JOSE (`python-jose[cryptography]>=3.3.0`), Passlib (`passlib[bcrypt]>=1.7.4`)

---

## 2. Persistence & Storage
- **Database**: PostgreSQL (planned via SQLAlchemy ORM and Alembic migrations; driver installed)
- **Local Dev Storage**: In-memory state and client-side storage for local visualizations.

---

## 3. Communication & APIs
- **Protocol**: HTTP/REST
- **Data Exchange Format**: JSON
- **CORS Configuration**: Enabled for frontend origins (`http://localhost:5173`, `http://127.0.0.1:5173`)
- **Endpoints**:
  - `GET /health` — Service health and status check
  - `GET /` — Root metadata and documentation links

---

## 4. Architectural Exclusions
- **Docker**: Strictly excluded from local development setup.
- **Redis & Celery**: Strictly excluded.
