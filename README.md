# AlgoLens Pro

AlgoLens Pro is a modern, high-performance algorithm visualizer monorepo. It features an interactive, animated React frontend coupled with a high-throughput FastAPI backend for telemetry, persistence, and algorithmic state generation.

---

## Repository Structure

```text
Algo-Visualizer/
├── frontend/             # Vite + React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/          # Backend API client interfaces
│   │   ├── components/   # UI & visualization components
│   │   ├── pages/        # View / route components
│   │   ├── store/        # State management stores
│   │   └── types/        # TypeScript models & definitions
│   └── package.json
│
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   └── main.py       # FastAPI application with health check (GET /health)
│   ├── requirements.in   # Abstract dependency definitions
│   └── requirements.txt  # Pinned dependency lockfile
│
├── brain/                # Project brain documentation & single source of truth
└── README.md             # Project documentation and local running guide
```

---

## Getting Started (Local Development without Docker)

Follow these instructions to run both services simultaneously in separate terminals.

### Prerequisites

- **Node.js**: v18+ (tested on Node v20/v24) & `npm`
- **Python**: 3.10+ (tested on Python 3.13) & `venv`

---

### 1. Running the Frontend

In your first terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the Vite development server
npm run dev
```

The frontend application will be live at:
**[http://localhost:5173](http://localhost:5173)**

Available frontend commands:
- `npm run dev` — Start Vite development server with Hot Module Replacement (HMR).
- `npm run build` — Typecheck and build the production bundle.
- `npm run lint` — Lint code using ESLint.
- `npm run format` — Format source code with Prettier.

---

### 2. Running the Backend

In your second terminal window:

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment (first time only)
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.\venv\Scripts\activate.bat
# On macOS / Linux:
source venv/bin/activate

# Upgrade pip and install dependencies
pip install -r requirements.txt

# Start the FastAPI server with auto-reload
uvicorn app.main:app --reload
```

The backend API will be live at:
- Root API: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
- Health Check: **[http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)**
- Interactive Swagger UI: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
- ReDoc Documentation: **[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)**

---

### Managing Dependencies with `pip-tools`

Backend dependencies are declared in `backend/requirements.in`. To recompile or update locked dependencies in `requirements.txt`:

```bash
cd backend
pip install pip-tools
pip-compile requirements.in
pip-sync requirements.txt
```

---

## Architectural Rules

- No Docker, Redis, or Celery are used in this setup.
- All specifications and tasks are governed under the `brain/` directory.
 