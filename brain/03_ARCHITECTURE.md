# 03 ARCHITECTURE

## 1. System Overview
AlgoLens Pro is designed as a modular monorepo containing two decoupled packages:
1. `frontend/`: Interactive client application built with React 18, Vite, TypeScript, and Tailwind CSS.
2. `backend/`: High-performance Python API service powered by FastAPI, managed under a virtual environment (`venv`).

---

## 2. Monorepo Directory Responsibilities
```text
Algo-Visualizer/
├── frontend/
│   ├── src/
│   │   ├── api/          # Network clients and backend communication hooks
│   │   ├── components/   # UI components (visualizer canvas, controls, telemetry)
│   │   ├── pages/        # Route views
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript models, state enums, API types
│   │   ├── App.tsx       # Root React application component
│   │   └── main.tsx      # React DOM client entrypoint
│   ├── tailwind.config.js# Tailwind theme and content configuration
│   ├── .eslintrc.cjs     # ESLint configuration
│   └── package.json      # Frontend dependency manifest
│
├── backend/
│   ├── app/
│   │   ├── main.py       # FastAPI application, CORS middleware, health endpoints
│   │   └── __init__.py
│   ├── venv/             # Local Python virtual environment
│   ├── requirements.in   # Unpinned dependency definitions
│   └── requirements.txt  # Pinned dependency lockfile
│
├── brain/                # Project brain and source of truth
├── .gitignore            # Monorepo git ignore rules
└── README.md             # Local execution instructions
```

---

## 3. Frontend Architecture
- **Rendering & Animation**: React 18 component tree with requestAnimationFrame-driven or state-stepped canvas updates.
- **Styling**: Tailwind CSS utility classes with consistent brand tokens.
- **State Management**: Local state and modular stores in `src/store/` for step timeline and visualization status (playing, paused, speed).

---

## 4. Backend Architecture
- **Framework**: FastAPI application with asynchronous route handlers.
- **Middleware**: Fast CORS middleware allowing local development across frontend ports.
- **Entrypoint**: `app/main.py` executing under Uvicorn ASGI server.
- **Database Readiness**: SQLAlchemy and Alembic installed for future data modeling and migrations.

---

## 5. API Flow
1. User interacts with visualizer controls in `frontend/`.
2. Frontend optionally requests algorithm step generation or health validation from `backend/` (`http://localhost:8000/health`).
3. Backend processes request asynchronously and returns typed JSON responses.
