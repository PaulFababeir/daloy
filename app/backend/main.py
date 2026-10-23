"""
DALOY FastAPI Backend
Serves rain-driven dengue (Quezon City) & leptospirosis (Manila) case estimations,
historical benchmarks, flood vulnerability indicators, and custom city CSV validation.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import math
import csv
import io

from prediction_engine import engine, MONTHS, MON3

app = FastAPI(
    title="DALOY API",
    description="Rain-driven dengue & leptospirosis outbreak estimation engine for Philippine LGUs",
    version="1.0.0"
)

# Allow CORS for development and demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    disease: str = Field(..., description="'dengue' or 'lepto'")
    month: int = Field(..., ge=1, le=12, description="Month 1-12")
    rain: float = Field(..., ge=0, description="Monthly rainfall in mm")
    prev_rain: Optional[float] = Field(None, ge=0, description="Previous month rainfall in mm")
    n_weeks: Optional[int] = Field(4, ge=4, le=5, description="Case weeks in month")


class PredictResponse(BaseModel):
    disease: str
    city: str
    month: int
    month_name: str
    rain: float
    prev_rain: Optional[float]
    n_weeks: int
    predicted_cases: int
    raw_estimate: float
    ci_lower: int
    ci_upper: int
    baseline_cases: float
    ratio_to_baseline: float
    pct_diff_baseline: int
    level_id: str
    level_label: str
    why_text: str
    effect_text: str
    similar_months: List[Dict[str, Any]]
    actions: List[Dict[str, str]]
    flood_zones: List[Dict[str, Any]]


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "DALOY API",
        "version": "1.0.0",
        "cities": ["Quezon City", "Manila"],
        "diseases": ["Dengue", "Leptospirosis"]
    }


@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    key = req.disease.lower()
    if key not in ("dengue", "lepto"):
        raise HTTPException(status_code=400, detail="Disease must be 'dengue' or 'lepto'")
    
    cfg = engine.config[key]
    n_weeks = req.n_weeks or 4
    prev = req.prev_rain if req.prev_rain is not None else req.rain

    raw_pred = engine.predict_raw(key, req.rain, prev, req.month, n_weeks)
    cases = max(0, round(raw_pred))
    
    # 95% Poisson Interval
    margin = 1.96 * math.sqrt(raw_pred) if raw_pred > 0 else 0
    ci_lo = max(0, round(raw_pred - margin))
    ci_hi = max(ci_lo, round(raw_pred + margin))

    # Baseline & Levels
    base = engine.baseline_for(key, req.month)
    ratio = raw_pred / base if base > 0 else 1.0
    level = engine.level_for(ratio)
    pct_diff = round((ratio - 1.0) * 100)

    # Contextual explanation strings
    t_rain = engine.typical_rain(key, req.month)
    m_name = MONTHS[req.month - 1]
    rain_cmp = "more" if req.rain > t_rain * 1.15 else "less" if req.rain < t_rain * 0.85 else "about the same"

    if key == "dengue":
        why_text = (
            f"{round(req.rain):,} mm is "
            f"{'about the usual' if rain_cmp == 'about the same' else rain_cmp + ' than the usual'} "
            f"{m_name} rainfall in {cfg['city']} (median {round(t_rain):,} mm). "
            "In the model, more rain in a month correlates with more dengue cases that month."
        )
        up_pred = engine.predict_raw(key, req.rain + 100, prev, req.month, n_weeks)
        eff_pct = round((up_pred / raw_pred - 1.0) * 100) if raw_pred > 0 else 0
        effect_text = (
            f"At this rainfall level, each extra 100 mm adds about {eff_pct}% more cases "
            f"(≈ {round(up_pred - raw_pred):,} cases)."
        )
    else:
        t_prev = engine.typical_rain(key, 12 if req.month == 1 else req.month - 1)
        why_text = (
            f"This month: {round(req.rain):,} mm (usual {round(t_rain):,} mm). "
            f"Last month: {round(prev):,} mm (usual {round(t_prev):,} mm). "
            "Leptospirosis follows heavy rain and flooding by about 2 weeks, so both months count, along with the season."
        )
        effect_text = f"Estimate = predicted weekly rate × {n_weeks} case weeks."

    # Nearest similar past months
    sims = engine.similar_months(key, req.rain, prev, req.month, k=4)
    actions = engine.get_actions(key, level['id'])
    flood_zones = engine.get_flood_zones(key)

    return PredictResponse(
        disease=cfg['disease'],
        city=cfg['city'],
        month=req.month,
        month_name=m_name,
        rain=req.rain,
        prev_rain=prev if key == "lepto" else None,
        n_weeks=n_weeks,
        predicted_cases=cases,
        raw_estimate=round(raw_pred, 2),
        ci_lower=ci_lo,
        ci_upper=ci_hi,
        baseline_cases=round(base, 1),
        ratio_to_baseline=round(ratio, 3),
        pct_diff_baseline=pct_diff,
        level_id=level['id'],
        level_label=level['label'],
        why_text=why_text,
        effect_text=effect_text,
        similar_months=sims,
        actions=actions,
        flood_zones=flood_zones
    )


@app.get("/api/history/{disease}")
def get_history(disease: str):
    key = disease.lower()
    if key not in ("dengue", "lepto"):
        raise HTTPException(status_code=400, detail="Disease must be 'dengue' or 'lepto'")
    return {
        "disease": engine.config[key]['disease'],
        "city": engine.config[key]['city'],
        "years": engine.config[key]['years'],
        "records": engine.history[key]
    }


@app.get("/api/flood-zones/{disease}")
def get_flood_zones(disease: str):
    key = disease.lower()
    if key not in ("dengue", "lepto"):
        raise HTTPException(status_code=400, detail="Disease must be 'dengue' or 'lepto'")
    return {
        "disease": engine.config[key]['disease'],
        "city": engine.config[key]['city'],
        "zones": engine.get_flood_zones(key)
    }


@app.post("/api/upload-csv")
async def upload_csv(
    disease: str = Form(...),
    file: UploadFile = File(...)
):
    key = disease.lower()
    if key not in ("dengue", "lepto"):
        raise HTTPException(status_code=400, detail="Disease must be 'dengue' or 'lepto'")
    
    contents = await file.read()
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = contents.decode("latin-1")
    
    reader = csv.reader(io.StringIO(text.strip()))
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    headers = [h.strip() for h in rows[0]]
    expected_cols = (
        ['YR', 'MN', 'DC_QC', 'RF_NASA', 'n_weeks']
        if key == 'dengue'
        else ['month', 'lepto', 'rain_total_mm', 'n_weeks']
    )
    
    missing = [c for c in expected_cols if c not in headers]
    if missing:
        return {
            "valid": False,
            "errors": [f"Missing expected columns: {', '.join(missing)}"],
            "expected_columns": expected_cols,
            "found_columns": headers
        }

    parsed_rows = []
    errors = []
    
    rain_idx = headers.index('RF_NASA' if key == 'dengue' else 'rain_total_mm')
    case_idx = headers.index('DC_QC' if key == 'dengue' else 'lepto')

    rain_vals = []
    case_vals = []

    for idx, r in enumerate(rows[1:], start=2):
        if not r or all(c.strip() == '' for c in r):
            continue
        try:
            rain_val = float(r[rain_idx].strip())
            case_val = float(r[case_idx].strip())
            if rain_val < 0 or case_val < 0:
                errors.append(f"Row {idx}: negative values detected.")
            rain_vals.append(rain_val)
            case_vals.append(case_val)
            parsed_rows.append(r)
        except (ValueError, IndexError):
            errors.append(f"Row {idx}: non-numeric data in rainfall or case count column.")

    if len(parsed_rows) < 24:
        errors.append(f"Need at least 24 monthly records for Leave-One-Year-Out CV (found {len(parsed_rows)}).")

    # Simple rank calculation for Spearman rho
    def rank_data(arr):
        indexed = sorted(range(len(arr)), key=lambda k: arr[k])
        ranks = [0] * len(arr)
        for rank, i in enumerate(indexed, 1):
            ranks[i] = rank
        return ranks

    rho = 0.0
    if len(rain_vals) >= 5:
        r_ranks = rank_data(rain_vals)
        c_ranks = rank_data(case_vals)
        n = len(rain_vals)
        d_sq = sum((r_ranks[i] - c_ranks[i]) ** 2 for i in range(n))
        rho = 1.0 - (6.0 * d_sq) / (n * (n * n - 1.0))
        rho = max(-1.0, min(1.0, round(rho, 3)))

    return {
        "valid": len(errors) == 0,
        "row_count": len(parsed_rows),
        "errors": errors[:5],
        "spearman_rho": rho,
        "summary": {
            "mean_rainfall": round(sum(rain_vals) / len(rain_vals), 1) if rain_vals else 0,
            "mean_cases": round(sum(case_vals) / len(case_vals), 1) if case_vals else 0,
            "total_cases": int(sum(case_vals)) if case_vals else 0
        },
        "preview": [dict(zip(headers, r)) for r in parsed_rows[:5]]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
