<div align="center">

# ⚡ AlgoLens Pro
### Next-Generation Algorithm Visualizer & AI Learning Suite

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Pytest](https://img.shields.io/badge/Pytest_49_Passed-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![Vitest](https://img.shields.io/badge/Vitest_11_Passed-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)

<p align="center">
  <b>AlgoLens Pro</b> is a modern, high-performance Design and Analysis of Algorithms (DAA) educational platform. It bridges abstract algorithmic theory and intuitive visual mastery through frame-accurate step-by-step animations, real-time performance telemetry, interactive practice quizzes, and an integrated Google Gemini RAG AI tutor.
</p>

[Quick Start](#-quick-start-running-the-project) • [Configuring Gemini AI](#-configuring-gemini-ai-assistant) • [Autofill Feature](#-one-click-autofill) • [Curriculum Modules](#-curriculum-modules-10-phases) • [Testing](#-running-automated-tests)

</div>

---

## 🚀 Quick Start (Running the Project)

Run the frontend and backend in **two separate terminal windows**.

### 1. Terminal 1: Start Frontend (Port 5173)

From your project root:

```powershell
cd Algo-Visualizer\frontend
npm run dev
```

> **Note (First-time setup only):** Run `npm install` inside `Algo-Visualizer\frontend` before `npm run dev`.

The frontend web app will be live at:
**[http://localhost:5173](http://localhost:5173)**

---

### 2. Terminal 2: Start Backend (Port 8000)

From your project root:

```powershell
cd Algo-Visualizer
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Note (First-time setup only):**
> If you have not yet created the virtual environment or seeded the database:
> ```powershell
> cd Algo-Visualizer\backend
> python -m venv venv
> .\venv\Scripts\Activate.ps1
> pip install -r requirements.txt
> python -m app.db.seed
> ```

Backend APIs and documentation:
- **API Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🤖 Configuring Gemini AI Assistant

### How to resolve:
> `Error: The AI assistant is not configured on this server. Please ask the administrator to set the GEMINI_API_KEY.`

This error occurs when the `GEMINI_API_KEY` variable in `backend/.env` is empty. Follow these 3 simple steps:

1. **Get a free Google Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Click **Create API key** and copy it.

2. **Paste it into `backend/.env`**:
   - Open `Algo-Visualizer/backend/.env` in your editor.
   - Set line 3 with your key:
     ```env
     GEMINI_API_KEY=AIzaSyYourActualKeyHere
     ```

3. **Save the file**:
   - The FastAPI backend will automatically reload with the new key.
   - Refresh or ask any question in **AI Assistant** (`/ai-assistant`) and receive instant, source-backed algorithmic guidance!

---

## 🎲 One-Click Autofill

No need to manually type numbers, arrays, or matrices into input fields:
1. Navigate to any module visualizer (e.g., **Module 1: Search & Comparisons**, **Module 2: Merge Sort**, **Module 5: 0/1 Knapsack**).
2. Click the glowing **🎲 Autofill** button next to the input fields.
3. Realistic test inputs will be instantly populated and applied.
4. Click **Run / Execute** to watch the algorithmic execution unfold!

---

## 🔓 Open Access (No Login Required)

All features are 100% accessible to every user:
- **Zero Authentication Barriers**: No sign-in or registration needed.
- **Guest Progress Tracking**: Algorithm completion and quiz records automatically persist in your browser's `localStorage`.
- **Direct Navigation**: Jump straight to any algorithm visualizer, practice quiz arena, or AI tutor.

---

## 📚 Curriculum Modules (10 Phases)

| # | Module Name | Key Algorithms | Interactive Visualization Highlights |
|:---:|---|---|---|
| **1** | **Search & Asymptotics** | Linear Search, Binary Search | Coordinated dual arena, live comparisons HUD, logarithmic vs linear curves, Autofill |
| **2** | **Divide & Conquer** | Merge Sort, Quick Sort | Interactive recursion tree, pivot partitioning, array bar state transitions, Autofill |
| **3** | **Backtracking I** | $N$-Queens Problem | Interactive $N \times N$ chessboard, conflict ray tracing, backtracking branch rollback |
| **4** | **Dynamic Programming I** | Floyd-Warshall APSP | 2D intermediate distance matrix, intermediate vertex iteration step $k$ |
| **5** | **Dynamic Programming II** | 0/1 Knapsack Problem | 2D table $dp[i][w]$ generation, backtracking optimal subset recovery, Autofill |
| **6** | **Greedy Strategy** | Job Sequencing with Deadlines | Timeline slot allocation, profit maximization, penalty minimization |
| **7** | **Disjoint Sets & MST** | Kruskal's MST | Union-Find DSU forest visualizer, edge weight sorted queue, cycle detection |
| **8** | **Branch & Bound** | 0/1 Knapsack Branch & Bound | State-space tree generation, upper bound estimation, branch pruning |
| **9** | **NP-Completeness** | Boolean 3-SAT Solver | Clause satisfaction checklist, truth table generator, complexity growth curve |
| **10** | **Backtracking II** | Graph $m$-Coloring | Chromatic node canvas, adjacency conflict detection, color palette assignment |

---

## 🧪 Running Automated Tests

AlgoLens Pro features comprehensive automated test suites for both backend and frontend.

### Backend Tests (49 Pytest Tests)
```powershell
cd Algo-Visualizer\backend
.\venv\Scripts\python.exe -m pytest -v
```
- ✅ 49/49 passing unit and integration tests.
- Verifies algorithmic trace generation, progress persistence, and AI RAG pipelines.

### Frontend Tests (11 Vitest Tests)
```bash
cd Algo-Visualizer\frontend
npm test
```
- ✅ 11/11 passing React component tests.
- Verifies `AnimationPlayer`, `MetricsPanel`, `KnapsackStage`, and `CodeDisplay`.

### Frontend Build Validation
```bash
cd Algo-Visualizer\frontend
npm run build
```
- ✅ TypeScript strict typecheck & Vite production bundle compilation.

---

## 📂 Project Structure

```text
Algo-Visualizer/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                  # Backend API client & Axios/Fetch wrappers
│   │   ├── components/           # Module visualizers, AnimationPlayer, CodeDisplay
│   │   ├── data/                 # Quizzes & algorithm curriculum metadata
│   │   ├── pages/                # HomePage, ModulePage, AIAssistantPage, PracticePage
│   │   └── store/                # Zustand state stores (modules & progress)
│   └── package.json
│
├── backend/                      # Python 3.13 FastAPI backend
│   ├── app/
│   │   ├── ai/                   # Gemini SDK integration & RAG knowledge retrieval
│   │   ├── api/routes/           # Endpoints: /algorithms, /modules, /ai, /progress
│   │   ├── core/                 # Settings, dependencies, security
│   │   ├── db/                   # Database session, models, seed script
│   │   └── schemas/              # Pydantic request/response schemas
│   ├── tests/                    # 49 unit and API integration tests
│   └── .env                      # Environment variables (GEMINI_API_KEY)
│
├── brain/                        # System architecture & PRD documentation
└── README.md                     # This document
```

---

## 📝 Key Keyboard & Playback Controls

- **Spacebar / Play Button**: Play / Pause step execution.
- **Left / Right Arrow**: Step backward / forward one frame.
- **Speed Slider**: Real-time animation speed control (100ms - 2000ms).
- **Reset Button**: Rewind algorithm to initial step.
- **Copy / Download Code**: 1-click Python implementation export.
