# Methodology

This explains how DALOY gets from rainfall to a case estimate, how we checked whether the estimates are any good, and where they fall short. The code lives in `app/backend/dataset/` (models) and `app/backend/prediction_engine.py` (everything around them). The numbers in section 4 come from `scripts/evaluate_models.py`, so you can rerun them yourself.

## 1. The question

Case reports for dengue and leptospirosis reach local health offices about two to three weeks late. Rainfall is measured by satellite within days. If rainfall carries enough information about cases, a city could estimate this month's caseload weeks before the reports arrive and prepare earlier.

So both models answer the same question: *given this month's rainfall, last month's rainfall and the time of year, how many cases should we expect this month?* It's an estimate of the present (a nowcast). We don't claim to forecast future months.

## 2. Data

Details on every column and licence are in [DATA.md](DATA.md). In short:

- **Leptospirosis, Manila.** Weekly case counts from 2001 to 2012 from the EIDC hydro-epidemiological leptospirosis dataset (De Stercke et al., 2023), matched with daily NASA POWER rainfall at a point in Manila (14.5995°N, 120.9842°E).
- **Dengue, Quezon City.** Weekly confirmed and probable cases from 2010 to 2025, with weekly satellite rainfall (`RF_NASA`, from NASA GPM IMERG), from the UPRI-NOAH dataset (Pelitro et al., 2026).

### Why monthly

We started with weekly data. It didn't work well: a few outbreak weeks with very high counts pulled every model toward them, and week-to-week noise swamped the rainfall signal. Monthly totals are smoother and closer to how city health offices plan anyway, so we aggregated both series to months.

- Leptospirosis weeks are assigned to the month they start in. Because months have either 4 or 5 case weeks, we keep that count (`n_weeks`) and model the *weekly rate* (cases ÷ `n_weeks`), then multiply back. Otherwise a 5-week month would look like a small outbreak.
- Dengue weeks are assigned to the month that contains most of their days, and cases and rainfall are summed. The source dataset isn't fully consistent about whether its week numbers are ISO weeks or plain 7-day blocks (its own README says so), so a few weeks near month boundaries could land in the neighbouring month.

## 3. Models

Both models use the same four inputs:

| Feature | Why |
|---|---|
| `log(1 + rain this month)` | the main signal; the log stops a single very wet month from dominating |
| `log(1 + rain last month)` | leptospirosis peaks about two weeks after heavy rain (Matsushita et al., 2018), so last month's rain matters for this month's cases |
| `sin(2πm/12)`, `cos(2πm/12)` | the time of year, written so that December and January are close together |

**Leptospirosis: gradient boosting with a Poisson loss.** scikit-learn's `HistGradientBoostingRegressor(loss="poisson", max_depth=2, learning_rate=0.05, max_iter=150, min_samples_leaf=5, random_state=42)`, trained on the weekly rate. We kept the trees very shallow and the learning rate low because there are only 143 usable months. Gradient boosting was worth it here because the rainfall effect isn't a straight line: moderate rain does little, very heavy rain (the kind that floods streets) does a lot.

**Dengue: Poisson regression.** A `StandardScaler` followed by `PoissonRegressor(alpha=0.1)`, trained on monthly case counts. Poisson regression is the standard choice for counts and its coefficients are easy to explain. The small L2 penalty keeps the coefficients stable.

> Note: the proposal describes the dengue model as using same-month rainfall only. The app uses all four features above. We tested both (section 4) and the four-feature version is better, so that's the one in the code.

### Around the model

- **Range.** The app shows a 95% range of ±1.96 × √(estimate), which is the spread you'd expect from Poisson counting noise alone. It does not include model error, so for dengue the real uncertainty is much wider than the range shown (see the MAE below).
- **Compared with a typical month.** The estimate is divided by the average for the same calendar month across the history. Below 0.8× is "below typical", 0.8–1.2× "typical", 1.2–1.6× "above typical", and above 1.6× "well above typical". These cut-offs are our own; they aren't DOH thresholds.
- **Most similar past month.** The app ranks every month in the history by a weighted distance on this month's rainfall, last month's rainfall (both scaled by the rainfall standard deviation) and the gap in calendar months, and shows the closest four. The match is on rainfall, not on cases, so a similar month can have had a very different outcome. That's partly the point: it shows how much else, beyond rain, drives cases.
- **Action plan.** Resource targets (households to sweep, test kits, IV beds, doxycycline courses) are scaled from the estimated cases using planning ratios we set ourselves, following the DOH 4S dengue strategy and post-flood doxycycline prophylaxis guidance. They are meant as a starting point for planning, not as quotas.
- **Flood-prone barangays and facilities** are a list we put together by hand from publicly reported flood areas and known referral hospitals. They are not yet computed from flood hazard maps.

## 4. Validation

We used **leave-one-year-out cross-validation**. Each year is held out, the model is trained on all the other years, and the held-out months are predicted. The predictions from every fold are pooled and scored. Holding out whole years keeps a season's months together, so the model is never tested on a month whose neighbours it has already seen.

The baseline is the simplest reasonable guess: the average for that calendar month in the other years (for leptospirosis, the average weekly rate times `n_weeks`). A model is only useful if it beats that.

| Model | Months | MAE | RMSE | R² | Spearman ρ | RMSE on log(1+cases) |
|---|---|---|---|---|---|---|
| Leptospirosis, seasonal baseline | 143 | 16.95 | 43.70 | 0.099 | 0.834 | 0.815 |
| Leptospirosis, gradient boosting | 143 | **10.42** | **26.36** | **0.672** | **0.873** | **0.664** |
| Dengue, seasonal baseline | 191 | **254.2** | **371.6** | **0.264** | 0.517 | **0.900** |
| Dengue, Poisson, rain only (proposal) | 191 | 291.0 | 401.4 | 0.141 | 0.417 | 1.002 |
| Dengue, Poisson, rain + last month + season (app) | 191 | 264.6 | 380.5 | 0.228 | **0.530** | 0.916 |

What we take from this:

- **Leptospirosis:** rainfall clearly helps. The model's error is about 40% lower than the baseline and it explains about two thirds of the month-to-month variation. This lines up with the Manila hospital study by Matsushita et al. (2018), which found the same rain–leptospirosis link in the same city and years.
- **Dengue:** rainfall on its own does not beat knowing the month. The app model is close to the baseline and ranks months slightly better (ρ 0.53 vs 0.52), but its average error is a little worse. Rain alone is clearly worse. Dengue in Metro Manila also depends on humidity, temperature and the existing level of infection (Carvajal et al., 2018), and our model has none of those.

Leave-one-year-out training uses years both before and after the one being predicted. So these scores show how well rainfall *explains* cases, which is a slightly easier test than true forecasting.

## 5. Limitations

- Two cities only, and the leptospirosis data stops in 2012.
- Rainfall and season are the only inputs.
- Reported cases depend on testing and reporting, which changed over the years, most visibly in 2020–2021 during COVID-19.
- The range shown in the app ignores model error.
- For an uploaded city, the app refits the same model on the user's data. We can't vouch for the results; that's why the feature is marked experimental and needs at least 24 months of data.

## References

Carvajal, T. M., Viacrusis, K. M., Hernandez, L. F. T., Ho, H. T., Amalin, D. M., & Watanabe, K. (2018). Machine learning methods reveal the temporal pattern of dengue incidence using meteorological factors in metropolitan Manila, Philippines. *BMC Infectious Diseases, 18*(1), 183. https://doi.org/10.1186/s12879-018-3066-0

De Stercke, S., Buytaert, W., Mijic, A., Templeton, M., Zulkafli, Z., Ab Rahman, J., Tahir, W., Rahmat, F., Jayaramu, V., Salwa Ibrahim, S., Ismail, M., Juraiza Ishak, A., & Abdul Rahman, R. Z. (2023). *Hydro-epidemiological data for leptospirosis for areas in Brazil, Malaysia, Philippines, Argentina, China and Sri Lanka, 1978-2020* [Data set]. NERC EDS Environmental Information Data Centre. https://doi.org/10.5285/56f42170-3678-4586-b8c8-9b05f03125e1

Matsushita, N., Ng, C. F. S., Kim, Y., Suzuki, M., Saito, N., Ariyoshi, K., Salva, E. P., Dimaano, E. M., Villarama, J. B., Go, W. S., & Hashizume, M. (2018). The non-linear and lagged short-term relationship between rainfall and leptospirosis and the intermediate role of floods in the Philippines. *PLOS Neglected Tropical Diseases, 12*(4), e0006331. https://doi.org/10.1371/journal.pntd.0006331

Pelitro, K. J., Matavia, T. O., Soriano, K., Garcia, G. M., Manzano, J. F., Bilbao, K., Delos Angeles, A. J., Cruz, R., Lagmay, A. M., & Bandoy, D. D. (2026). *Weekly dengue incidence linked to meteorological variables at city, regional, and multi-setting scales* (Version 1.1.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.21978184
