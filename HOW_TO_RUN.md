# DALOY — Quickstart Run Guide
**Philippine Junior Data Science Challenge 2026 (PJDSC 2026)**  
*Trace the rain, target the outbreak.*

This document provides exact step-by-step instructions to run the **FastAPI Python Backend** and the **React + Vite Frontend**.

---

## Prerequisites

| Technology | Minimum Version | Check Command |
|:---|:---|:---|
| **Python** | 3.10+ (3.11 recommended) | `python --version` |
| **Node.js** | 18+ (20+ recommended) | `node --version` |
| **npm** | 9+ | `npm --version` |

---

## 1. Quickstart (Two Terminals)

To run the entire DALOY application with hot-reloading:

### Terminal 1: Backend (FastAPI on Port 8000)
From the project root (`pjdsc-app`):

```bash
# 1. Install Python packages (first time only)
pip install -r app/backend/requirements.txt

# 2. Run the FastAPI server
python -m uvicorn main:app --app-dir app/backend --reload --host 127.0.0.1 --port 8000
```
> **Backend Verification:**
> - Swagger Interactive API Docs: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
> - Health Check: [`http://127.0.0.1:8000/api/health`](http://127.0.0.1:8000/api/health)

---

### Terminal 2: Frontend (React + Vite on Port 5173)
From the project root (`pjdsc-app`):

```bash
# 1. Navigate to frontend & install node dependencies (first time only)
cd app/frontend
npm install

# 2. Start the Vite development server
npm run dev
```
> **App Verification:**
> - Open [`http://localhost:5173/`](http://localhost:5173/) in your web browser.
> - The top navbar will display **`Backend: Live`** (Emerald green pill).

---

## 2. Command Reference Summary

| Task | Command | Directory |
|:---|:---|:---|
| **Run Backend with Hot-Reload** | `python -m uvicorn main:app --app-dir app/backend --reload --port 8000` | `pjdsc-app/` |
| **Run Backend from Subfolder** | `python -m uvicorn main:app --reload --port 8000` | `pjdsc-app/app/backend` |
| **Install Backend Deps** | `pip install -r app/backend/requirements.txt` | `pjdsc-app/` |
| **Run Frontend Dev Server** | `npm run dev` | `pjdsc-app/app/frontend` |
| **Build Frontend for Prod** | `npm run build` | `pjdsc-app/app/frontend` |

---

## 3. Fallback Mode (Frontend without Backend)

The React frontend includes an embedded **client-side mathematical fallback engine**. 
If the FastAPI backend is not running, the application will continue to work seamlessly:
- Calculations, Poisson curves, rainfall sliders, and similar past months will run locally in the browser.
- The top-bar status pill will show **`Client Mode (Offline Math)`**.
- Once you start the backend, it will automatically connect on the next interaction.

---

## 4. Common Troubleshooting

### "uvicorn is not recognized as an internal or external command"
Always prefix with `python -m`:
```bash
python -m uvicorn main:app --app-dir app/backend --reload --port 8000
```

### "Port 8000 already in use"
Another instance of the backend is already running. Check running processes or specify a different port:
```bash
python -m uvicorn main:app --app-dir app/backend --reload --port 8001
```
*(If changing the port, update `target: 'http://127.0.0.1:8001'` in `app/frontend/vite.config.ts`).*

### "Vite build fails / TypeScript errors"
Ensure all packages are up to date:
```bash
cd app/frontend
npm install
npm run build
```
