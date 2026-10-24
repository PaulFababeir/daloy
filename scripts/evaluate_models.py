"""Leave-one-year-out (LOYO) evaluation of the two DALOY models.

Each year is held out in turn, the model is trained on every other year,
and the held-out months are predicted. Predictions from all folds are pooled
and scored against a seasonal baseline (the same calendar month averaged
over the other years).

Run from the repo root:
    python scripts/evaluate_models.py
"""

from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import PoissonRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

DATA = Path(__file__).resolve().parents[1] / "app" / "backend" / "dataset"


def seasonal_features(month, rain, prev_rain):
    return np.column_stack([
        np.log1p(rain),
        np.log1p(prev_rain),
        np.sin(2 * np.pi * month / 12),
        np.cos(2 * np.pi * month / 12),
    ])


def load_dengue():
    df = pd.read_csv(DATA / "dengue" / "qc_dengue_monthly.csv").sort_values(["YR", "MN"])
    df["prev_rain"] = df["RF_NASA"].shift(1)
    # only use last month's rain when the two rows really are consecutive months
    period = df["YR"] * 12 + df["MN"]
    df.loc[period.diff() != 1, "prev_rain"] = np.nan
    df = df.dropna(subset=["prev_rain"]).reset_index(drop=True)
    return df.rename(columns={"YR": "year", "MN": "month", "DC_QC": "cases", "RF_NASA": "rain"})


def load_lepto():
    df = pd.read_csv(DATA / "leptos" / "manila_lepto_monthly.csv", parse_dates=["month"]).sort_values("month")
    df["prev_rain"] = df["rain_total_mm"].shift(1)
    df = df.dropna(subset=["prev_rain"]).reset_index(drop=True)
    df["year"] = df["month"].dt.year
    df["month"] = df["month"].dt.month
    return df.rename(columns={"lepto": "cases", "rain_total_mm": "rain"})


# --- models (same settings as app/backend/dataset/*/main.py) -----------------

def dengue_app_model(train, test):
    model = make_pipeline(StandardScaler(), PoissonRegressor(alpha=0.1, max_iter=1000))
    model.fit(seasonal_features(train.month, train.rain, train.prev_rain), train.cases)
    return model.predict(seasonal_features(test.month, test.rain, test.prev_rain))


def dengue_rain_only(train, test):
    # the simpler spec written in the proposal: same-month rainfall only
    x_train = np.log1p(train[["rain"]].to_numpy())
    x_test = np.log1p(test[["rain"]].to_numpy())
    model = make_pipeline(StandardScaler(), PoissonRegressor(alpha=0.1, max_iter=1000))
    model.fit(x_train, train.cases)
    return model.predict(x_test)


def lepto_app_model(train, test):
    model = HistGradientBoostingRegressor(
        loss="poisson", max_depth=2, learning_rate=0.05,
        max_iter=150, min_samples_leaf=5, random_state=42,
    )
    # trained on the weekly rate so 4- and 5-week months are comparable
    model.fit(seasonal_features(train.month, train.rain, train.prev_rain), train.cases / train.n_weeks)
    return model.predict(seasonal_features(test.month, test.rain, test.prev_rain)) * test.n_weeks


def seasonal_baseline(train, test, per_week=False):
    if per_week:
        rate = (train.cases / train.n_weeks).groupby(train.month).mean()
        return test.month.map(rate).fillna(rate.mean()).to_numpy() * test.n_weeks.to_numpy()
    mean = train.cases.groupby(train.month).mean()
    return test.month.map(mean).fillna(train.cases.mean()).to_numpy()


# --- evaluation --------------------------------------------------------------

def loyo_predictions(df, predict):
    preds = pd.Series(np.nan, index=df.index)
    for year in sorted(df.year.unique()):
        test = df.year == year
        preds[test] = np.clip(predict(df[~test], df[test]), 0, None)
    return preds


def scores(y, pred):
    return {
        "MAE": mean_absolute_error(y, pred),
        "RMSE": mean_squared_error(y, pred) ** 0.5,
        "R2": r2_score(y, pred),
        "Spearman": spearmanr(y, pred).statistic,
        "RMSE_log": mean_squared_error(np.log1p(y), np.log1p(pred)) ** 0.5,
    }


def report(title, df, candidates):
    print(f"\n{title}  ({len(df)} months, {df.year.nunique()} folds)")
    rows = {name: scores(df.cases, loyo_predictions(df, fn)) for name, fn in candidates.items()}
    table = pd.DataFrame(rows).T
    print(table.round(3).to_string())
    return table


if __name__ == "__main__":
    dengue = load_dengue()
    lepto = load_lepto()

    report("Dengue - Quezon City", dengue, {
        "baseline (same month, other years)": seasonal_baseline,
        "Poisson, rain only (proposal)": dengue_rain_only,
        "Poisson, rain + prev rain + season (app)": dengue_app_model,
    })
    report("Leptospirosis - Manila", lepto, {
        "baseline (same month, other years)": lambda tr, te: seasonal_baseline(tr, te, per_week=True),
        "Gradient boosting, Poisson loss (app)": lepto_app_model,
    })
