# DATA MODEL

> Datasets, preparation, models and evaluation. **Source of truth: the METHODOLOGY section of the proposal doc's NEW PROPOSAL tab** (link in `docs/LINKS.md`). Synced on 2026-10-23, after the rest of the proposal was aligned with it. If the proposal methodology changes, update this file to match (see `AGENTS.md`).

## Summary

| | Leptospirosis | Dengue |
|---|---|---|
| Place | Manila | Quezon City (Metro Manila) |
| Case data | Weekly cases, 2001–2012 | Weekly cases, 2010–2025 |
| Weather | NASA POWER daily, Manila point (only precipitation used in the final model) | `RF_NASA` (NASA GPM IMERG) from the same dataset |
| Model resolution | Monthly | Monthly |
| Final model | `HistGradientBoostingRegressor`, Poisson loss | `PoissonRegressor`, same-month rainfall only |
| Validation | Leave-one-year-out CV | Leave-one-year-out CV |

## Data sources

### Leptospirosis

- **Cases:** weekly leptospirosis case counts for Manila, 2001–2012, from "Hydro-epidemiological data for Leptospirosis for areas in Brazil, Malaysia, Philippines, Argentina, China and Sri Lanka, 1978-2020" (De Stercke et al., 2023), NERC EDS Environmental Information Data Centre, listed on data.gov.uk. Each record gives the week start date and the number of cases. Licence: Open Government Licence v3.0.
  - The proposal currently cites this dataset under an older, shorter title ("...Brazil, Malaysia, Philippines, 1978-2020"). The title above is the current one from the DOI record.
- **Weather:** daily NASA POWER weather for Manila (14.5995°N, 120.9842°E). Variables pulled: mean, max and min temperature, relative humidity, corrected precipitation. **Only precipitation is used in the final model.**

### Dengue

- **Cases and rainfall:** UPRI-NOAH dengue-rainfall dataset, file `Dengue_Environmental Vars_Dataset.xlsx`, sheet **QC Data** (Quezon City, 2010–2025, 832 weekly records). The same dataset is on Zenodo as "Weekly Dengue Incidence Linked to Meteorological Variables at City, Regional, and Multi-Setting Scales" (Pelitro et al., 2026, v1.1.0).
- **Columns kept:** `YR` (year), `WN` (week number), `DC_QC` (weekly confirmed and probable dengue cases, from the Quezon City Epidemiology and Surveillance Division via PIDSR), `RF_NASA` (weekly rainfall).
  - The `QC` in `DC_QC` means Quezon City, not "quality-controlled" (compare `DC_DOH`, `DC_OPENDENGUE`). The team's original methodology text said "quality-controlled"; the NEW PROPOSAL tab was corrected on 2026-10-23.
- **Columns dropped:** ERA5-Land and PAGASA variables, quality flags.
- **Licences:** the GitHub repo states ODC-ODbL v1.0; the Zenodo record states CC BY 4.0. Cite it either way.

Facts from the dataset README (used to fill the proposal's placeholders on 2026-10-23):

- **`RF_NASA` is already a weekly total** (mm/week, from one 0.1° × 0.1° IMERG cell at the QC centroid). It is not a daily mean, so no conversion is needed.
- **The end year is 2025.**
- **Week numbering is ambiguous in the source itself.** The Dataset Summary says the series use continuous 7-day blocks, with rare 53rd blocks folded into week 52. The Data Dictionary calls `WN` an ISO epidemiological week. The dataset README says this "is not fully reconciled". The team must pick one convention and state it. **The proposal still has the `[ISO / epidemiological]` placeholder.**

### Not used in the current methodology

These were in the earlier plan. They were removed from the proposal's References on 2026-10-23:

- HDX "Philippine Dengue Cases and Deaths" (province level, 2016–2021): the dataset in the official catalogue.
- Mendeley "Philippine Epidemiological Data" (national leptospirosis cases).

### Available for scaling up (not yet used)

- **Regional Data sheet** in the same UPRI-NOAH workbook: weekly dengue cases for all 17 regions (`DC_DOH`, from the DOH Epidemiology Bureau via FOI), 2016–2025 excluding 2020–2021, with CHIRPS rainfall (`RF_HDX`, mm/week). This could support a 17-region map using the same method.
- **Quezon City barangay file** (`QC_YearlyData-Barangay(CSV).csv`): yearly dengue cases for 142 barangays, with a barangay shapefile. This could support a hotspot map.
- **Project CCHAIN** (PJDSC 2025 catalogue): linked health, climate, environment and socioeconomic data at barangay level for 12 cities, 2003–2022. Which diseases it covers is not yet verified.

## Data preparation

Both datasets are aggregated to **monthly** resolution, so rainfall and cases in the same calendar month can be modeled directly without week-level lags. Preliminary weekly analyses were dominated by a few outbreak weeks and fit poorly.

- **Leptospirosis:** each week's cases are assigned to the month the week begins in, then summed by month. `n_weeks` records the number of case weeks in each month (4 or 5). Monthly rainfall is the sum of daily NASA POWER precipitation over the calendar month.
- **Dengue:** each week's start date is rebuilt from `YR` and `WN` (convention TBD, see above). Each week is assigned to the month containing most of its days. Monthly cases and monthly rainfall are the sums of the weekly values.

## Models

### Leptospirosis: gradient boosting with Poisson loss

- **Predictors:** `log(1 + rain)` for the current month, `log(1 + rain)` for the previous month, and calendar month as `sin(2πm/12)` and `cos(2πm/12)`.
- **Target:** weekly case rate (cases ÷ `n_weeks`). Predictions are multiplied back by `n_weeks`; negative values are set to 0.
- **Model:** scikit-learn `HistGradientBoostingRegressor(loss="poisson", max_depth=2, learning_rate=0.05, max_iter=150, min_samples_leaf=5, random_state=42)`.
- **Rows:** 143 months (Feb 2001 to Dec 2012). The first month has no previous-month rainfall.

### Dengue: Poisson regression

- **Predictor:** same-month rainfall (`RF_NASA`), transformed as `log(1 + rain)` and standardized (z).
- **Target:** monthly dengue cases (`DC_QC`).
- **Model:** `log(E[cases]) = β₀ + β₁z`, fitted with scikit-learn `PoissonRegressor(alpha=0.1)` (L2 penalty).
- **Effect size:** a separate unpenalized Poisson model with rainfall in units of 100 mm, so `exp(β)` is the change in cases per extra 100 mm of rain.

### Model selection

Candidates tested for each disease: Poisson regression, gradient boosting and random forest. For leptospirosis, three feature sets were also compared: current-month rainfall only; plus previous-month rainfall; plus seasonality. The models above performed best.

## Validation and evaluation

- **Leave-one-year-out cross-validation:** each year is predicted by a model trained on all other years; predictions are pooled for evaluation. Year defines the folds only and is never a predictor.
- **Metrics:** MAE, RMSE, R², Spearman rank correlation, and RMSE on `log(1 + cases)` (less dominated by outbreak months).
- **Baseline:** the average of the other years. For leptospirosis this is the mean weekly rate × `n_weeks`.
- **Results:** TBD. Add the CV numbers for each model and baseline here once they're final.

## App features: data needs

Features were finalized at the 2026-10-23 team meeting (full list in `docs/UI_SPEC.md`).

| Feature | Data it needs | Status |
|---|---|---|
| Predicted cases | Dengue: the month's rainfall (mm). Leptospirosis: current-month rainfall, previous-month rainfall, calendar month, and `n_weeks` (to turn the predicted weekly rate back into monthly cases). | Inputs follow the models above. The UI input fields are TBD. |
| Most similar past month | The city's monthly history: the training panels above. | **Method TBD.** One option: nearest neighbour on the model inputs (rainfall, plus month for leptospirosis), showing that month's actual cases. Whatever is chosen, it should be explainable in one sentence. |
| Flood-vulnerable areas | Flood data for areas within Quezon City and Manila, plus area boundaries. | **Source TBD.** Candidates: UP NOAH flood-hazard maps (2025 runner-up link.od used NOAH flood shapefiles), LiPAD flood-hazard maps, Open Hazards PH. A Quezon City barangay shapefile is in the UPRI-NOAH repo. Note: hazard maps model flood *scenarios* (e.g. 25-year return period); "flood history" in the strict sense needs records of past flood events. Pick one and say which. |
| Upload another city (experimental) | A CSV in the formats below. | **Behaviour TBD:** retrain the same model on the upload (with leave-one-year-out CV) or apply our trained models. |

### User-uploaded CSV format (experimental feature)

One CSV per disease. Column names must match exactly. The formats mirror the monthly training panels.

**Leptospirosis:** `month,lepto,rain_total_mm,n_weeks`

| Column | Meaning | Example |
|---|---|---|
| `month` | First day of the month, `YYYY-MM-DD` | `2001-01-01` |
| `lepto` | Leptospirosis cases in the month | `6` |
| `rain_total_mm` | Total rainfall in the month, mm | `79.67` |
| `n_weeks` | Number of case weeks assigned to the month (4 or 5) | `5` |

```csv
month,lepto,rain_total_mm,n_weeks
2001-01-01,6,79.67,5
```

**Dengue:** `YR,MN,DC_QC,RF_NASA,n_weeks`

| Column | Meaning | Example |
|---|---|---|
| `YR` | Year | `2010` |
| `MN` | Month number, 1–12 | `1` |
| `DC_QC` | Dengue cases in the month (the name comes from the Quezon City dataset; keep it for any city) | `110` |
| `RF_NASA` | Total rainfall in the month, mm | `39.53` |
| `n_weeks` | Number of case weeks assigned to the month | `4` |

```csv
YR,MN,DC_QC,RF_NASA,n_weeks
2010,1,110,39.53,4
```

Notes:

- The two formats differ (a date column for leptospirosis; year + month number for dengue). This is as agreed at the meeting.
- The dengue model in the methodology doesn't use `n_weeks`; it is in the format anyway.
- Validation rules for uploads (required columns, no missing values, minimum number of years): TBD. Leave-one-year-out CV needs at least 2 full years, and more for a meaningful result.

## Open methodology questions (team to decide)

- **Lead time.** Both models use **current-month** rainfall, so they estimate this month's cases from this month's rain. That is a nowcast, not a forecast. It can still warn earlier than surveillance, because rainfall is available within days while case reports arrive about 2–3 weeks late. The proposal and slides should describe it that way. For real lead time, a model would need only past rainfall (e.g. previous month only) or rainfall forecasts as input.
- **Overdispersion.** Monthly dengue counts usually have variance well above the mean. A Poisson model then understates uncertainty. Check the dispersion; if it is high, report it or compare a negative-binomial model.
- **Week numbering** for `WN` (see Data sources).
- **Risk tiers.** The models predict case counts only, and the proposal no longer mentions tiers. If the app shows a risk level, define it on the monthly predictions and add it to the proposal (one option from the earlier plan: DOH-style thresholds, alert = moving average of the current and preceding 2 years for that period; epidemic = alert + 2 SD).

## Key evidence (for rationale and citations)

- **Leptospirosis lag:** Matsushita et al. (2018). Weekly San Lazaro Hospital admissions in Manila, 2001–2012, analyzed with a distributed lag non-linear model. Risk peaked **2 weeks after** heavy or torrential rain and was partly explained by floods.
- **Dengue and weather in Metro Manila (2009–2013):** Carvajal et al. (2018). Random forest with lagged weather predicted best; relative humidity was the most important weather variable. The repo previously listed specific lag weeks (rainfall ~5, Tmin ~13, Tmean ~17, Tmax ~18 weeks); those are not in the paper's abstract and are still unverified.
- **Weather alone is weak:** in the DengAI competition, the negative-binomial benchmark had MAE 25.81 against about 13 at the top of the leaderboard. Report honestly how much rainfall adds over the baseline.

## Tech stack

- Python: pandas, scikit-learn (`PoissonRegressor`, `HistGradientBoostingRegressor`)
- App: Streamlit (planned)
- Maps and charts: folium and/or plotly (planned)

## References (APA 7th edition, same as the proposal's list)

- Carvajal, T. M., Viacrusis, K. M., Hernandez, L. F. T., Ho, H. T., Amalin, D. M., & Watanabe, K. (2018). Machine learning methods reveal the temporal pattern of dengue incidence using meteorological factors in metropolitan Manila, Philippines. *BMC Infectious Diseases, 18*(1), 183. https://doi.org/10.1186/s12879-018-3066-0
- De Stercke, S., Buytaert, W., Mijic, A., Templeton, M., Zulkafli, Z., Ab Rahman, J., Tahir, W., Rahmat, F., Jayaramu, V., Salwa Ibrahim, S., Ismail, M., Juraiza Ishak, A., & Abdul Rahman, R. Z. (2023). *Hydro-epidemiological data for leptospirosis for areas in Brazil, Malaysia, Philippines, Argentina, China and Sri Lanka, 1978-2020* [Data set]. NERC EDS Environmental Information Data Centre. https://doi.org/10.5285/56f42170-3678-4586-b8c8-9b05f03125e1
- Matsushita, N., Ng, C. F. S., Kim, Y., Suzuki, M., Saito, N., Ariyoshi, K., Salva, E. P., Dimaano, E. M., Villarama, J. B., Go, W. S., & Hashizume, M. (2018). The non-linear and lagged short-term relationship between rainfall and leptospirosis and the intermediate role of floods in the Philippines. *PLOS Neglected Tropical Diseases, 12*(4), e0006331. https://doi.org/10.1371/journal.pntd.0006331
- NASA Langley Research Center. (n.d.). *Prediction Of Worldwide Energy Resources (POWER)* [Data set]. https://power.larc.nasa.gov/
- Pelitro, K. J., Matavia, T. O., Soriano, K., Garcia, G. M., Manzano, J. F., Bilbao, K., Delos Angeles, A. J., Cruz, R., Lagmay, A. M., & Bandoy, D. D. (2026). *Weekly dengue incidence linked to meteorological variables at city, regional, and multi-setting scales* (Version 1.1.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.21978184
- Still TBD: DOH 2025 leptospirosis figures (4,859 cases as of Sept 6, 2025); NKTI leptospirosis ward (Aug 2025); scikit-learn citation if the team wants one.
