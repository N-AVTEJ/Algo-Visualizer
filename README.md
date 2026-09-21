<div align="center">

# ⚡ AlgoLens Pro
### Next-Generation Algorithm Visualizer & AI Learning Suite

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Pytest](https://img.shields.io/badge/Pytest_49_Passed-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![Vitest](https://img.shields.io/badge/Vitest_11_Passed-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Access](https://img.shields.io/badge/Access-Open%20Guest%20Mode-10B981?style=for-the-badge)](https://github.com/)

<p align="center">
  <b>AlgoLens Pro</b> is a modern, high-performance Design and Analysis of Algorithms (DAA) educational suite. It transforms abstract algorithmic concepts into intuitive visual experiences with frame-accurate step-by-step animations, live telemetry HUDs, an integrated Google Gemini RAG AI tutor, practice quizzes, and 1-click test autofill.
</p>

[Quick Start](#-quick-start-running-the-project) • [Key Features](#-key-features) • [Curriculum Modules](#-curriculum-modules-10-phases) • [Gemini AI Configuration](#-gemini-ai-assistant-configuration) • [Automated Tests](#-automated-test-suites)

</div>

---

## 🚀 Quick Start (Running the Project)

Open **two separate terminal windows** and run:

### Terminal 1: Frontend Web Application
```powershell
cd frontend
npm run dev
```

> 🌐 **Frontend URL**: [http://localhost:5173](http://localhost:5173)

---

### Terminal 2: Backend FastAPI Server
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> ⚙️ **Backend Root**: [http://127.0.0.1:8000](http://127.0.0.1:8000)  
> 📋 **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
> 🩺 **Health Check API**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🛠️ First-Time Installation & Setup

If you are setting up this repository for the first time:

### 1. Initialize Frontend
```powershell
cd frontend
npm install
```

### 2. Initialize Backend & Database
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Seed the curriculum modules and algorithm registry into the database
python -m app.db.seed
```

---

## ✨ Key Features

- **🎲 1-Click "Autofill" Test Data**: Never waste time manually typing inputs. Click the **🎲 Autofill** button inside any algorithm visualizer to instantly populate realistic, interesting sample inputs (arrays, targets, capacities, graphs).
- **🔓 Open Access (No Login Barrier)**: Enjoy 100% unrestricted access to all 10 modules, practice quizzes, and the AI Assistant with no sign-in or account required. Guest progress automatically persists in `localStorage`.
- **🤖 Gemini RAG AI Assistant**: Chat with an AI tutor powered by Google Gemini SDK and vector similarity search. Ask about algorithm derivations, Big-O complexities, and edge cases with cited references.
- **📊 Real-Time Telemetry HUD**: Live metrics counters displaying exact comparisons, assignments, matrix lookups, recursion depths, and theoretical Big-O bounds.
- **🧪 Interactive Practice Quizzes**: 20+ curriculum multiple-choice questions across all 10 modules with instant scoring, feedback, and in-depth explanations.
- **📺 Integrated YouTube Video Lectures**: Watch embedded expert video lectures alongside interactive visualizers.
- **💾 Export & Download Code**: 1-click Python source code export and clipboard copying.

---

## 📚 Curriculum Modules (10 Phases)

| # | Module | Key Algorithms | Features & Visualizations |
|:---:|:---|:---|:---|
| **1** | **Search & Asymptotics** | Linear Search, Binary Search | Coordinated dual comparison arena, step counters, logarithmic vs linear curves, Autofill |
| **2** | **Divide & Conquer** | Merge Sort, Quick Sort | Recursive Partition Tree visualizer, array bar state transitions, Autofill |
| **3** | **Backtracking I** | $N$-Queens Problem | Interactive $N \times N$ chessboard, conflict ray tracing, backtracking branch rollback |
| **4** | **Dynamic Programming I** | Floyd-Warshall APSP | 2D intermediate distance matrix, intermediate vertex iteration step $k$ |
| **5** | **Dynamic Programming II** | 0/1 Knapsack Problem | 2D table $dp[i][w]$ generation, backtracking optimal subset recovery, Autofill |
| **6** | **Greedy Strategy** | Job Sequencing with Deadlines | Timeline slot allocation, profit maximization, penalty minimization |
| **7** | **Disjoint Sets & MST** | Kruskal's MST | Union-Find DSU forest visualizer, edge weight sorted queue, cycle detection |
| **8** | **Branch & Bound** | 0/1 Knapsack Branch & Bound | State-space tree generation, upper bound estimation, branch pruning |
| **9** | **NP-Completeness** | Boolean 3-SAT Solver | Clause satisfaction checklist, truth table generator, complexity growth curve |
| **10** | **Backtracking II** | Graph $m$-Coloring | Chromatic node canvas, adjacency conflict detection, color palette assignment |

---

## 🤖 Gemini AI Assistant Configuration

The platform uses Google's Gemini SDK for its AI Assistant. Your API key is stored in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:Name%402006@localhost:5432/algolens
SECRET_KEY=136a6924fd0e02b54c3b7586a6877d8b39c773c7f5c095fe5828e6c72ff4a6d2
GEMINI_API_KEY=your_gemini_api_key_here
```

### Supported Gemini Models:
- **Chat**: `gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-flash-latest` (with automatic resilient fallback)
- **Embeddings**: `gemini-embedding-001` (3072 dimensions)

To get a free key, visit [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🧪 Automated Test Suites

The repository maintains automated test coverage across both frontend and backend layers:

### Backend Tests (49 Pytest Tests)
```powershell
cd Algo-Visualizer\backend
.\venv\Scripts\python.exe -m pytest -v
```
> Result: **`49 passed`** with 100% passing rate. Verifies all 10 algorithm trace generation endpoints, progress endpoints, and AI RAG pipelines.

### Frontend Component Tests (11 Vitest Tests)
```powershell
cd frontend
npm test
```
> Result: **`11 passed`** across 4 test suites. Verifies `AnimationPlayer`, `MetricsPanel`, `KnapsackStage`, and `CodeDisplay`.

### Frontend Production Build Validation
```powershell
cd frontend
npm run build
```
> Result: **`✓ built in ~10s`** with zero TypeScript or bundler errors.

---

## 📁 Repository Structure

```text
Algo-Visualizer/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                  # Backend API client interfaces
│   │   ├── components/           # Module visualizers, AnimationPlayer, CodeDisplay
│   │   ├── data/                 # Quizzes & presets
│   │   ├── pages/                # HomePage, ModulePage, AIAssistantPage, PracticePage
│   │   └── store/                # Zustand stores (modules & guest progress)
│   └── package.json
│
├── backend/                      # Python 3.13 FastAPI backend
│   ├── app/
│   │   ├── ai/                   # Gemini SDK integration & RAG pipeline
│   │   ├── api/routes/           # REST endpoints: /algorithms, /modules, /ai, /progress
│   │   ├── core/                 # Settings, dependencies, security
│   │   ├── db/                   # Database session, models, seed script
│   │   └── schemas/              # Pydantic schemas
│   ├── tests/                    # 49 unit and API integration tests
│   └── .env                      # Environment variables (GEMINI_API_KEY)
│
├── brain/                        # System architecture & PRD specifications
└── README.md                     # This documentation file
```

---

## 🎮 Playback & Keyboard Shortcuts

- **Spacebar / Play Button**: Toggle Play / Pause on animation timeline.
- **Left / Right Arrow Buttons**: Step backward / forward frame-by-frame.
- **Speed Slider**: Real-time animation speed control (100ms – 2000ms).
- **Reset Button**: Rewind algorithm back to initial step 0.
- **🎲 Autofill**: Instantly generate and apply valid test data with one click.
- **Export Code**: 1-click Python source code copy or download.

---

<div align="center">
  <sub>Built with ❤️ for Computer Science & DAA Learners worldwide.</sub>
</div>
