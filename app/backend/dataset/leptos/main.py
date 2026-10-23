import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import HistGradientBoostingRegressor


def leptos_model(curr_month_rain, prev_month_rain, month):
    df = pd.read_csv("manila_lepto_monthly.csv", parse_dates=["month"]).sort_values("month")
    df = df.reset_index(drop=True)

    df["rain_prev_month"] = df["rain_total_mm"].shift(1)
    df["log_rain"] = np.log1p(df["rain_total_mm"])
    df["log_rain_prev"] = np.log1p(df["rain_prev_month"])
    m = df["month"].dt.month
    df["month_sin"] = np.sin(2 * np.pi * m / 12)
    df["month_cos"] = np.cos(2 * np.pi * m / 12)
    df["rate"] = df["lepto"] / df["n_weeks"]           

    FEATURES = ["log_rain", "log_rain_prev", "month_sin", "month_cos"]  
    df = df.dropna(subset=FEATURES + ["rate"])

    X = df[FEATURES].to_numpy()    
    y = df["rate"].to_numpy()

    model = HistGradientBoostingRegressor(
        loss="poisson", max_depth=2, learning_rate=0.05,
        max_iter=150, min_samples_leaf=5, random_state=42,
    )
    model.fit(X, y)
    numeric_month = datetime.strptime(month, "%B").month
    X_new = np.array([make_row(curr_month_rain, prev_month_rain, numeric_month)])
    n_weeks = n_weeks_in_month(numeric_month)
    rate_pred = np.clip(model.predict(X_new), 0, None)   
    cases_pred = rate_pred * n_weeks  
    cases_pred = cases_pred.round(0)  
    return cases_pred   # will return an array e.g., [3.] which means 3 cases         

def make_row(rain_mm, prev_rain_mm, month):
    return [
        np.log1p(rain_mm),                    
        np.log1p(prev_rain_mm),               
        np.sin(2 * np.pi * month / 12),       
        np.cos(2 * np.pi * month / 12),      
    ]

def n_weeks_in_month(month):
    year = datetime.now().year
    days = pd.date_range(f"{year}-{month:02d}-01", periods=pd.Timestamp(year, month, 1).days_in_month)
    return int((days.day_of_week == 0).sum()) 

if __name__ == "__main__":
    leptos_model(150, 60, "March")