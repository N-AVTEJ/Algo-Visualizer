# 15 MICROTASKS

This file tracks the atomic engineering tasks for the AlgoLens Pro project.

---

### Task ID: TASK-001
- **Description**: Brain Initialization & Baseline Repository Inspection.
- **Relevant Files**: `brain/*`
- **Dependencies**: None
- **Acceptance Criteria**: All 18 documentation brain files created and populated based strictly on verified repository facts.
- **Verification Method**: Check directory structure of `brain/` and confirm files exist without fabricated data.
- **Status**: Complete

---

### Task ID: TASK-002
- **Description**: Monorepo Scaffolding (Frontend + Backend) for AlgoLens Pro.
- **Relevant Files**: `frontend/*`, `backend/*`, `README.md`, `.gitignore`
- **Dependencies**: TASK-001
- **Acceptance Criteria**:
  - `frontend/` initialized with Vite + React 18 + TypeScript + Tailwind CSS + ESLint + Prettier.
  - Clean folder structure: `src/components`, `src/pages`, `src/store`, `src/api`, `src/types`.
  - `backend/` initialized with Python `venv`, FastAPI app in `app/main.py` with `GET /health`.
  - `requirements.in` and `requirements.txt` with locked dependencies using `pip-tools`.
  - Root `README.md` explaining local execution without Docker.
  - Git initialized with `.gitignore` covering `node_modules`, `venv`, `__pycache__`, `.env`.
  - Dev branch set up off main.
  - Excluded Redis, Celery, Docker.
- **Verification Method**:
  - `npm run lint` and `npm run build` succeed in `frontend/`.
  - Backend runs live on Uvicorn and returns 200 on `GET /health`.
  - `git branch` displays `dev` active.
- **Status**: Complete

---

### Task ID: TASK-003
- **Description**: Visualizer Core Canvas & Playback State Engine.
- **Relevant Files**: `frontend/src/components/*`, `frontend/src/store/*`
- **Dependencies**: TASK-002
- **Acceptance Criteria**: Interactive animation canvas with Play, Pause, Step Forward, Step Back, and Speed slider.
- **Verification Method**: Browser interaction test.
- **Status**: Pending

---

### Task ID: TASK-004
- **Description**: Sorting Algorithm Module Implementation.
- **Relevant Files**: `frontend/src/components/*`, `backend/app/*`
- **Dependencies**: TASK-003
- **Acceptance Criteria**: Frame-by-frame visual rendering for Bubble Sort, Quick Sort, and Merge Sort.
- **Verification Method**: Unit tests verifying state generator steps; browser visual testing.
- **Status**: Pending
