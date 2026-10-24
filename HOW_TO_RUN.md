# How to run DALOY

You need **Python 3.10 or newer** and **Node.js 18 or newer** (with npm). We tested on Python 3.12 and Node 24.

The app has two parts that run side by side: a FastAPI backend on port 8000 and a React frontend on port 5173. Open two terminals in the repo root.

## 1. Backend

```bash
pip install -r app/backend/requirements.txt
python -m uvicorn main:app --app-dir app/backend --reload --port 8000
```

A virtual environment is a good idea but not required:

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS / Linux
```

Check that it's up at http://127.0.0.1:8000/api/health. The interactive API docs are at http://127.0.0.1:8000/docs.

## 2. Frontend

```bash
cd app/frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards every `/api` request to the backend on port 8000 (see `vite.config.ts`), so there's nothing to configure.

The top bar shows **Backend: Live** when the frontend can reach the API. If the backend isn't running, the frontend falls back to a simplified estimate computed in the browser and the badge changes to **Client Mode**. That's handy for a quick look, but the numbers come from the real models only in Live mode.

## 3. Reproducing the model results

```bash
python scripts/evaluate_models.py
```

This runs leave-one-year-out cross-validation on both models and prints the table in the README. It only needs the Python packages from step 1 and takes a few seconds.

## Building for production

```bash
cd app/frontend
npm run build
```

The static site ends up in `app/frontend/dist/`.

## If something goes wrong

**`uvicorn` is not recognized.** Run it through Python, as above: `python -m uvicorn ...`.

**Port 8000 is already in use.** Another backend is probably still running. Stop it, or start this one on another port (`--port 8001`) and change the proxy `target` in `app/frontend/vite.config.ts` to match.

**Port 5173 is taken.** Vite picks the next free port and prints it, so use the address it shows.

**The badge says Client Mode even though the backend is running.** Make sure the backend is on port 8000, then refresh the page.

**TypeScript or build errors after pulling.** Someone probably added a package. Run `npm install` again in `app/frontend`.
