# DALOY backend

A small FastAPI app that runs the two models, answers prediction requests, and serves the history, flood zones and facilities the frontend draws.

## Running it

From the repo root:

```bash
pip install -r app/backend/requirements.txt
python -m uvicorn main:app --app-dir app/backend --reload --port 8000
```

Or from inside `app/backend`: `python -m uvicorn main:app --reload --port 8000`.

Swagger docs are at http://127.0.0.1:8000/docs once it's running.

## Layout

```
main.py                  API endpoints and request/response models
prediction_engine.py     history, typical-month baseline, similar months,
                         risk level, action plans, flood zones, facilities
dataset/
  dengue/main.py           dengue model (Poisson regression)
  dengue/qc_dengue_monthly.csv
  leptos/main.py           leptospirosis model (gradient boosting, Poisson loss)
  leptos/manila_lepto_monthly.csv
  util/helper.py           shared feature helpers
temp_uploads/            CSVs uploaded through the experimental feature (git-ignored)
```

The models are refit from the CSVs each time they're called. With fewer than 200 rows that takes a fraction of a second, and it means an uploaded city's data is used the same way as ours. If a model call fails for any reason, `prediction_engine.py` falls back to a fixed-coefficient approximation so the app keeps responding.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | health check |
| POST | `/api/predict` | the main call the frontend makes: estimate, range, baseline comparison, similar months, action plan and flood zones |
| GET/POST | `/api/predict/dengue`, `/api/predict/leptos` | just the model output; set `experimental: true` and `city` to use an uploaded CSV |
| GET | `/api/history/{disease}` | the monthly training data (`dengue` or `lepto`) |
| GET | `/api/flood-zones/{disease}` | flood-prone barangays for that city |
| GET | `/api/facilities/{disease}` | hospitals and health centers for that city |
| POST | `/api/upload-csv` | checks an uploaded CSV, returns errors, summary stats and the rainfall–cases Spearman correlation, and saves it to `temp_uploads/` |

### Example

```bash
curl -X POST http://127.0.0.1:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"disease": "dengue", "month": 8, "rain": 430, "prev_rain": 380}'
```

Part of the response:

```json
{
  "disease": "Dengue",
  "city": "Quezon City",
  "month_name": "August",
  "predicted_cases": 750,
  "ci_lower": 696,
  "ci_upper": 804,
  "baseline_cases": 1009.0,
  "pct_diff_baseline": -26,
  "level_label": "Below typical",
  "similar_months": [
    { "year": 2017, "month": 8, "rain": 421.7, "cases": 1618, "sim": 93 }
  ]
}
```

`disease` is `dengue` or `lepto`, `month` is 1–12, rainfall is in mm. `prev_rain` defaults to `rain` if you leave it out. The range (`ci_lower`, `ci_upper`) only covers Poisson counting noise; see `docs/METHODOLOGY.md`.

## Common problems

- **`No module named 'fastapi'`**: the requirements aren't installed in the Python you're running. Activate your virtual environment and run the `pip install` line again.
- **Port 8000 in use**: start on another port and update the proxy in `app/frontend/vite.config.ts`.
