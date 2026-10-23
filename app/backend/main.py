"""
DALOY FastAPI Backend
Serves rain-driven dengue (Quezon City) & leptospirosis (Manila) case estimations,
historical benchmarks, flood vulnerability indicators, and custom city CSV validation.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from dataset.leptos.main import leptos_model
from dataset.dengue.main import dengue_model
import pandas as pd
import math
import csv
from io import BytesIO
from pathlib import Path
import uuid
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


class PredictFeatures(BaseModel):
    curr_month_rainfall: float
    prev_month_rainfall: float
    month: str
    experimental: bool = False
    city: str | None = None


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
    history_points: Optional[List[Dict[str, Any]]] = None


UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    contents = await file.read()

    df = pd.read_csv(BytesIO(contents))

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": df.columns.tolist()
    }

@app.api_route("/api/predict/leptos", methods=["GET", "POST"])
def predict_leptos(features: PredictFeatures):
    if features.experimental and features.city:
        cases = leptos_model(features.curr_month_rainfall, features.prev_month_rainfall, features.month, features.experimental, features.city)
    else:
        cases = leptos_model(features.curr_month_rainfall, features.prev_month_rainfall, features.month)
    
    return {"cases": cases.tolist()}


@app.api_route("/api/predict/dengue", methods=["GET", "POST"])
def predict_dengue(features: PredictFeatures):
    if features.experimental and features.city:
        cases = dengue_model(features.curr_month_rainfall, features.prev_month_rainfall, features.month, features.experimental, features.city)
    else:
        cases = dengue_model(features.curr_month_rainfall, features.prev_month_rainfall, features.month)
    return {"cases": cases.tolist()}


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
    t_prev = engine.typical_rain(key, 12 if req.month == 1 else req.month - 1)
    m_name = MONTHS[req.month - 1]
    rain_cmp = "more" if req.rain > t_rain * 1.15 else "less" if req.rain < t_rain * 0.85 else "about the same"

    if key == "dengue":
        why_text = (
            f"This month: {round(req.rain):,} mm ({'about the usual' if rain_cmp == 'about the same' else rain_cmp + ' than the usual'} "
            f"{m_name} median of {round(t_rain):,} mm in {cfg['city']}). "
            f"Last month: {round(prev):,} mm (median {round(t_prev):,} mm). "
            "Both months' rainfall and seasonal cycle drive Aedes larval habitat proliferation."
        )
        up_pred = engine.predict_raw(key, req.rain + 100, prev, req.month, n_weeks)
        eff_pct = round((up_pred / raw_pred - 1.0) * 100) if raw_pred > 0 else 0
        effect_text = (
            f"At this rainfall level, each extra 100 mm adds about {eff_pct}% more cases "
            f"(≈ {round(up_pred - raw_pred):,} cases)."
        )
    else:
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
        prev_rain=prev,
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
        flood_zones=flood_zones,
        history_points=engine.history[key]
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
    file: UploadFile = File(...),
    city: str = Form(...),
):
    key = disease.lower()

    if key not in ("dengue", "lepto"):
        raise HTTPException(
            status_code=400,
            detail="Disease must be 'dengue' or 'lepto'"
        )

    # Read uploaded file into bytes
    contents = await file.read()
    

    # Convert CSV contents into a pandas DataFrame
    try:
        try:
            df = pd.read_csv(BytesIO(contents), encoding="utf-8-sig")
        except UnicodeDecodeError:
            df = pd.read_csv(BytesIO(contents), encoding="latin-1")

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )
    except pd.errors.ParserError:
        raise HTTPException(
            status_code=400,
            detail="Unable to parse CSV file."
        )

    # Clean column names
    df.columns = df.columns.str.strip()

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file contains no data rows."
        )

    # Validate expected columns
    expected_cols = (
        ['YR', 'MN', 'DC_QC', 'RF_NASA', 'n_weeks']
        if key == 'dengue'
        else ['month', 'lepto', 'rain_total_mm', 'n_weeks']
    )

    missing = [c for c in expected_cols if c not in df.columns]

    if missing:
        return {
            "valid": False,
            "errors": [
                f"Missing expected columns: {', '.join(missing)}"
            ],
            "expected_columns": expected_cols,
            "found_columns": df.columns.tolist()
        }

    # Identify the relevant columns
    rain_col = 'RF_NASA' if key == 'dengue' else 'rain_total_mm'
    case_col = 'DC_QC' if key == 'dengue' else 'lepto'

    # Convert rainfall and case columns to numeric values
    df[rain_col] = pd.to_numeric(df[rain_col], errors="coerce")
    df[case_col] = pd.to_numeric(df[case_col], errors="coerce")

    # Ignore completely empty rows
    df = df.dropna(how="all")

    # Validate numeric values
    errors = []

    invalid_rows = df[df[[rain_col, case_col]].isna().any(axis=1)]

    for idx in invalid_rows.index:
        errors.append(
            f"Row {idx + 2}: non-numeric data in rainfall or case count column."
        )

    # Keep only rows with valid numeric rainfall and case values
    parsed_df = df.dropna(subset=[rain_col, case_col]).copy()

    # Check for negative values
    negative_rows = parsed_df[
        (parsed_df[rain_col] < 0) |
        (parsed_df[case_col] < 0)
    ]

    for idx in negative_rows.index:
        errors.append(f"Row {idx + 2}: negative values detected.")

    # Check minimum number of records
    if len(parsed_df) < 24:
        errors.append(
            f"Need at least 24 monthly records for Leave-One-Year-Out CV "
            f"(found {len(parsed_df)})."
        )

    
    temp_filename = f"{city}.csv"
    temp_path = UPLOAD_DIR / temp_filename
    
    with open(temp_path, "wb") as f:
        f.write(contents)
        
    # Calculate Spearman correlation using pandas
    rho = 0.0

    if len(parsed_df) >= 5:
        correlation = parsed_df[rain_col].corr(
            parsed_df[case_col],
            method="spearman"
        )

        if pd.notna(correlation):
            rho = round(float(correlation), 3)

    # Generate summary statistics
    rain_vals = parsed_df[rain_col]
    case_vals = parsed_df[case_col]

    return {
        "valid": len(errors) == 0,
        "row_count": len(parsed_df),
        "errors": errors[:5],
        "spearman_rho": rho,
        "summary": {
            "mean_rainfall": round(float(rain_vals.mean()), 1)
                if len(rain_vals) else 0,
            "mean_cases": round(float(case_vals.mean()), 1)
                if len(case_vals) else 0,
            "total_cases": int(case_vals.sum())
                if len(case_vals) else 0
        },
        "preview": parsed_df.head(5).to_dict(orient="records")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
