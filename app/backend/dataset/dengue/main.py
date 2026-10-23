import numpy as np
import pandas as pd
from sklearn.linear_model import PoissonRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
csv_path = BASE_DIR / "qc_dengue_monthly.csv"
temp_csv_path = BASE_DIR.parent.parent / "temp_uploads"


def dengue_model(curr_month_rain, prev_month_rain, month, experimental=False, city=None):
    if experimental and city:
        df = pd.read_csv(csv_path / f"{city}.csv")[["YR", "MN", "DC_QC", "RF_NASA"]].dropna()
    else:
        df = pd.read_csv(csv_path)[["YR", "MN", "DC_QC", "RF_NASA"]].dropna()
    df = df.sort_values(["YR", "MN"]).reset_index(drop=True)


    df["rain_prev_month"] = df["RF_NASA"].shift(1)
    period = df["YR"] * 12 + df["MN"]
    df.loc[period.diff() != 1, "rain_prev_month"] = np.nan

    df["log_rain"] = np.log1p(df["RF_NASA"])
    df["log_rain_prev"] = np.log1p(df["rain_prev_month"])
    df["month_sin"] = np.sin(2 * np.pi * df["MN"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["MN"] / 12)

    FEATURES = ["log_rain", "log_rain_prev", "month_sin", "month_cos"]  
    df = df.dropna(subset=FEATURES)

    X = df[FEATURES].to_numpy()    
    y = df["DC_QC"].to_numpy()  

    model = make_pipeline(StandardScaler(), PoissonRegressor(alpha=0.1, max_iter=1000))
    model.fit(X, y)
    numeric_month = datetime.strptime(month, "%B").month
    cases_pred = np.clip(model.predict([make_row(curr_month_rain, prev_month_rain, numeric_month)]), 0, None) 
    return cases_pred.round()


def make_row(rain_mm, prev_rain_mm, month):
    return [
        np.log1p(rain_mm),                   
        np.log1p(prev_rain_mm),               
        np.sin(2 * np.pi * month / 12),       
        np.cos(2 * np.pi * month / 12),       
    ]


if __name__ == "__main__":
    dengue_model(150, 60, "March")