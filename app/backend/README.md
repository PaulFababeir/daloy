# DALOY FastAPI Backend

High-performance public health nowcasting service predicting monthly **Dengue** (Quezon City, 2010–2025) and **Leptospirosis** (City of Manila, 2001–2012) case distributions from meteorological rainfall and lag indicators.

---

## 1. Prerequisites

- **Python 3.10+** (Python 3.11 recommended)
- **pip** package manager

Verify your Python installation:
```bash
python --version
pip --version
```

---

## 2. Install Dependencies

From the project root (`pjdsc-app`):
```bash
pip install -r app/backend/requirements.txt
```

Or from inside `app/backend`:
```bash
cd app/backend
pip install -r requirements.txt
```

*(Key libraries: `fastapi`, `uvicorn[standard]`, `scikit-learn`, `numpy`, `pandas`, `pydantic`).*

---

## 3. How to Run the Server

### Option A: From the Project Root (`pjdsc-app`) — Recommended
```bash
python -m uvicorn main:app --app-dir app/backend --reload --host 127.0.0.1 --port 8000
```

### Option B: From Inside `app/backend`
```bash
cd app/backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*(Or simply `uvicorn main:app --reload` if uvicorn is in your global PATH).*

### Command Flag Breakdown:
- `main:app`: Looks for the `app` FastAPI instance inside `main.py`.
- `--reload`: Hot-reloading enabled. The server restarts automatically whenever you modify `.py` files.
- `--app-dir app/backend`: Points uvicorn to look inside the backend directory for `main.py`.
- `--host 127.0.0.1`: Binds to local loopback (localhost).
- `--port 8000`: Default backend port (matched with the Vite frontend reverse proxy).

---

## 4. Verification & Interactive API Documentation

Once started, open these URLs in your browser:

| Resource | URL | Description |
|:---|:---|:---|
| **Health Check** | `http://127.0.0.1:8000/api/health` | Returns `{"status":"healthy","service":"daloy-api"}` |
| **Interactive Swagger UI** | `http://127.0.0.1:8000/docs` | Test all endpoints interactively in your browser |
| **ReDoc Documentation** | `http://127.0.0.1:8000/redoc` | Clean, formal API reference |

---

## 5. Available API Endpoints

### `GET /api/health`
Confirms the backend is alive.
* **Response:**
  ```json
  {
    "status": "healthy",
    "service": "daloy-api"
  }
  ```

### `POST /api/predict`
Executes Poisson nowcasting model and returns expected cases, 95% Poisson confidence interval, baseline comparison, and nearest historical analogue months.
* **Sample Request Body:**
  ```json
  {
    "disease": "dengue",
    "month": 8,
    "rain": 430.0,
    "prev_rain": 380.0,
    "n_weeks": 4
  }
  ```
* **Sample Response:**
  ```json
  {
    "disease": "Dengue",
    "city": "Quezon City",
    "month": 8,
    "month_name": "August",
    "rain": 430.0,
    "prev_rain": 380.0,
    "n_weeks": 4,
    "predicted_cases": 284,
    "ci_lower": 251,
    "ci_upper": 317,
    "baseline_cases": 218.4,
    "pct_diff_baseline": 30.0,
    "level_id": "up",
    "level_label": "Above typical",
    "why_text": "Rainfall (430 mm) is 45% above typical August levels (296 mm).",
    "effect_text": "+100 mm of rain adds ~42% expected cases.",
    "similar_months": [
      {
        "year": 2012,
        "month": 8,
        "rain": 482.0,
        "prev": 395.0,
        "cases": 312,
        "sim": 94
      }
    ],
    "actions": [ ... ],
    "flood_zones": [ ... ]
  }
  ```

### `GET /api/history/{disease}`
Retrieves the complete historical training panel (`dengue` or `lepto`) for scatter plots and trend validation.

### `GET /api/flood-zones/{disease}`
Returns vulnerable river basin corridors (e.g. San Juan River overflow zone for QC, España/Tondo esteros for Manila).

### `POST /api/upload-csv`
Accepts experimental user-uploaded monthly CSVs for other cities, calculates Spearman $\rho$ correlation, and runs Leave-One-Year-Out Cross-Validation (LOYO-CV).

---

## 6. Architecture & Code Structure

```
app/backend/
├── main.py                  # FastAPI application entrypoint & routing
├── prediction_engine.py     # Verified Poisson GLM & nearest-neighbour math
├── requirements.txt         # Python package dependencies
└── README.md                # This setup guide
```

---

## 7. Troubleshooting

- **Error: `'uvicorn' is not recognized as an internal or external command`**  
  *Fix:* Use `python -m uvicorn` instead of bare `uvicorn`.

- **Error: `Address already in use (Port 8000)`**  
  *Fix:* Another process is holding port 8000. Either kill that process or run on port 8001:
  ```bash
  python -m uvicorn main:app --app-dir app/backend --reload --port 8001
  ```
  *(Note: If using port 8001, update the proxy port in `app/frontend/vite.config.ts`).*

- **Error: `ModuleNotFoundError: No module named 'fastapi'`**  
  *Fix:* Run `pip install -r app/backend/requirements.txt` inside your active virtual environment.
