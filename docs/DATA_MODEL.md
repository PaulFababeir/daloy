# DATA MODEL

> Datasets, features, models and evaluation. Update when the design changes (see `AGENTS.md`).

## Data sources

| Need | Source | Notes |
|---|---|---|
| Dengue cases | HDX "Philippine Dengue Cases and Deaths" (DOH Epidemiology Bureau), which is **in the official catalogue** | CSV per year, 2016–2021, ~32.7k rows (loc, cases, deaths, date, Region). Province-level. **2021 covers January only.** Treat as reported cases, because the case definition is ambiguous. |
| City-level dengue | Zenodo "Weekly Dengue Incidence Linked to Meteorological Variables" (https://zenodo.org/records/21978184) | Quezon City weekly 2010–2025, with IMERG and ERA5-Land weather. Single deposit, not peer-reviewed. |
| Leptospirosis | Mendeley "Philippine Epidemiological Data" (https://data.mendeley.com/datasets/v98325dpxv/1) | National, weekly, from the DOH surveillance systems (EDCS/PIDSR), 2017 to Oct 2023, with gaps. Regional DOH PDFs and Freedom of Information (FOI) requests are fallbacks. |
| Weather | NASA POWER API | Daily T2M, T2M_MAX, T2M_MIN, RH2M and PRECTOTCORR. Pull at each province centroid and aggregate to weekly. ERA5, CHIRPS and IMERG are alternatives. |
| Longer history (optional) | OpenDengue v1.2; Project Tycho (PH 1955–2010) | |
| Boundaries / population / floods | HDX admin boundaries; PSA census; UP NOAH flood-hazard maps | Access to NOAH is unverified. |

⚠️ The external-data rule is unverified. Confirm it on the official FAQ and cite every source.

## Key evidence (for rationale and citations)

- **Leptospirosis lag:** Matsushita et al., PLOS NTD 2018. Weekly San Lazaro Hospital admissions in Manila, 2001–2012, analyzed with a distributed lag non-linear model (DLNM). Risk peaked **2 weeks after** heavy or torrential rain and was partly explained by floods. There was no association at a 4-week lag.
- **Dengue lags in Metro Manila (2009–2013)** (Carvajal et al., BMC Infect Dis 2018):
  - Lags with the strongest correlation: rainfall about 5 weeks, minimum temperature about 13 weeks, mean temperature about 17 weeks, maximum temperature about 18 weeks.
  - Random forest with lagged weather performed best.
  - Relative humidity was the most important weather variable.
- **Weather alone is weak:**
  - In the DengAI competition, the negative-binomial (NB) benchmark had a mean absolute error (MAE) of 25.81, against about 13 at the top of the leaderboard.
  - In Sri Lanka, a univariate SARIMA leptospirosis model beat a weather-driven model.
  - **So always include past case counts (autoregressive features) plus a seasonal baseline, and report honestly how much weather adds.**

## Outbreak labels

DOH-style thresholds, applied per province and per morbidity week:

- **Alert threshold** = moving average of the current year and the preceding 2 years for that morbidity week.
- **Epidemic threshold** = alert threshold + 2 standard deviations (SD).
- **Tiers:** Normal / Alert / Epidemic.
- **Leakage rule:** fit thresholds on past data only.

## Models

| Model | Priority |
|---|---|
| Seasonal naive / historical-week mean | Required baseline |
| Negative-binomial GLM with lagged weather and lagged cases | Required. This is the interpretable core model. |
| LightGBM, Poisson or Tweedie objective, with lag features (1–20 weeks plus rolling sums) | Required. This is the main model and feeds the SHAP explanations. |
| DLNM lag-response figure for leptospirosis | Nice to have |
| SARIMA/SARIMAX | Optional comparator |
| INLA, LSTM, TFT | Skip: too slow to build, or overfits small data |

## Features

- Lagged weather: 1–20 weeks, plus rolling sums.
- Lagged case counts (autoregressive).
- Seasonal baseline.
- Exact feature list: TBD.

## Evaluation

- **Backtesting:** rolling-origin. Train up to week *t*, forecast *t+1* to *t+4*.
- **Metrics for counts:** MAE, RMSE, Poisson deviance. Avoid MAPE, because counts are small or zero.
- **Metrics for alert tiers:** precision, recall, F1, false-alarm rate, and **lead time** (weeks between the alert and the threshold actually being crossed).
- **Leakage guard:** every feature must be available at forecast time.
- **COVID period:** flag or exclude 2020–2021 as distorted.
- **Reporting delay:** surveillance data arrives about 2–3 weeks late.

## Tech stack

- Python: pandas, geopandas, statsmodels, LightGBM, SHAP
- App: Streamlit
- Maps and charts: folium and/or plotly

## References (convert to APA 7th edition before submission)

- Matsushita et al. (2018), PLOS Neglected Tropical Diseases, 12(4), e0006331: rainfall–leptospirosis lag in Manila. https://doi.org/10.1371/journal.pntd.0006331
- Carvajal et al. (2018), BMC Infectious Diseases, 18(1), 183: dengue–weather machine learning models in Metro Manila. https://doi.org/10.1186/s12879-018-3066-0
- HDX Philippine Dengue Cases and Deaths: https://data.humdata.org/dataset/philippine-dengue-cases-and-deaths
- DrivenData DengAI benchmark: https://drivendata.co/blog/dengue-benchmark
- PJDSC catalogue: https://pjdsc26-website.vercel.app/catalogue
- Zenodo QC dengue + weather: https://zenodo.org/records/21978184
- Mendeley PH epidemiological data: https://data.mendeley.com/datasets/v98325dpxv/1
- NASA POWER API: https://power.larc.nasa.gov/
- Sri Lanka SARIMA leptospirosis study: citation TBD
- DOH 2025 leptospirosis figures and NKTI ward report: citation TBD
