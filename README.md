# DALOY

*Trace the rain, target the outbreak.*

DALOY estimates how many dengue cases Quezon City and how many leptospirosis cases Manila can expect in a month, using that month's rainfall. It then turns the estimate into a short action plan for the city health office: what to stock, which barangays to prioritize, and which hospitals to alert.

Our entry to the Philippine Junior Data Science Challenge 2026 (theme: *Trace the Pattern, Target the Cure: Advancing Public Health Through Data Science*).

## Why we built it

Dengue and leptospirosis both climb during the rainy season, but the case numbers that local governments act on arrive late. Surveillance reports take about two to three weeks to come in, so by the time a spike shows up in the data, hospitals are often already filling. In 2025 the DOH counted 4,859 leptospirosis cases between the start of the rainy season and early September (Sigales, 2025), and NKTI had to turn its gym into a ward to keep up (GMA Integrated News, 2025).

Rainfall, on the other hand, is available from satellites within days. Leptospirosis in Manila is known to peak about two weeks after heavy rain (Matsushita et al., 2018). So the question we asked was simple: if you know how much it rained this month, how well can you estimate this month's cases before the reports come in?

DALOY is a **nowcast**, not a forecast. It estimates the current month, not the months ahead.

## What the app does

- **Case estimate.** Pick a disease, a month and a rainfall amount (plus last month's rainfall), and the model returns the expected number of cases with a range and a comparison to a typical year.
- **Most similar past month.** It finds the month in the city's history with the closest rainfall pattern and shows what actually happened then.
- **Flood-prone barangays and facilities.** A 3D map of Metro Manila highlights barangays with a history of flooding and the hospitals and health centers that would take the load.
- **Action plan and summary.** The estimate is converted into concrete targets (vector control sweeps, test kits, IV beds, doxycycline courses), with a printable one-page summary.
- **Try your own city (experimental).** Upload a CSV for a city we don't cover, and the app refits the same model on your data. See [docs/DATA.md](docs/DATA.md) for the format.

## Results

We checked both models with leave-one-year-out cross-validation: each year is held out in turn and predicted by a model trained on the rest. The baseline is simply the average for that calendar month in the other years. You can reproduce these numbers with `python scripts/evaluate_models.py`.

| Model | MAE | RMSE | R² | Spearman ρ |
|---|---|---|---|---|
| Leptospirosis (Manila), seasonal baseline | 17.0 | 43.7 | 0.10 | 0.83 |
| **Leptospirosis (Manila), gradient boosting** | **10.4** | **26.4** | **0.67** | **0.87** |
| Dengue (Quezon City), seasonal baseline | 254 | 372 | 0.26 | 0.52 |
| Dengue (Quezon City), Poisson regression | 265 | 380 | 0.23 | 0.53 |

The leptospirosis model works well. It cuts the average error by about 40% compared with the seasonal baseline, which fits what we expected: leptospirosis follows floodwater closely, and floodwater follows rain.

Dengue is a different story, and we'd rather say it plainly. Rainfall barely improves on knowing what month it is. Dengue depends on mosquito breeding cycles, temperature, humidity and how many people were already infected, so monthly rainfall alone isn't enough. That matches earlier work in Metro Manila (Carvajal et al., 2018). We kept the dengue model in the app because it ranks months about as well as the baseline and gives a sensible estimate, but it shouldn't be read as more than that. More on this in [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

## Getting started

You'll need Python 3.10+ and Node.js 18+.

```bash
# backend (from the repo root)
pip install -r app/backend/requirements.txt
python -m uvicorn main:app --app-dir app/backend --reload --port 8000

# frontend (in a second terminal)
cd app/frontend
npm install
npm run dev
```

Then open http://localhost:5173. The frontend still runs if the backend is off; it switches to a simplified in-browser estimate and says so in the top bar. More detail and troubleshooting in [HOW_TO_RUN.md](HOW_TO_RUN.md).

## Repository layout

```
app/
  backend/            FastAPI server and the two models
    dataset/dengue/     Quezon City monthly data + dengue model
    dataset/leptos/     Manila monthly data + leptospirosis model
    prediction_engine.py  history, similar months, action plans, flood zones
    main.py             API endpoints
  frontend/           React + Vite + Three.js web app
docs/
  METHODOLOGY.md      data preparation, models, validation, limitations
  DATA.md             sources, columns, upload format, licences
  BRAND_KIT.md        colours, type and logo
sample_datasets/      CSVs for trying the upload feature
scripts/
  evaluate_models.py  reproduces the cross-validation results above
```

## Challenges and what we did about them

- **Weekly data was too noisy.** Our first models worked at the weekly level and a handful of outbreak weeks dominated everything. Moving to monthly totals made the patterns much more stable.
- **Leptospirosis data is old and local.** The open weekly series we could use covers Manila from 2001 to 2012. We kept the model to Manila and say so in the app instead of stretching it to other cities.
- **Reporting delays.** Because case data lags, we only use inputs that are available at the time of the estimate: this month's and last month's rainfall, plus the calendar month.
- **Dengue isn't well explained by rain.** See Results. We report it honestly rather than tune until the numbers look better.

## Where this could go next

- Add temperature, humidity and last month's case count to the dengue model. These are the obvious next features, and the dataset we use already includes temperature and humidity.
- Use rainfall *forecasts* from PAGASA as input, which would turn the nowcast into a real early warning.
- Replace our hand-picked flood-prone barangays with UP NOAH flood hazard layers.
- Scale dengue to all 17 regions using the regional sheet of the same UPRI-NOAH dataset.
- Send the summary report to city health offices automatically when an estimate goes above typical.

## Sources

Carvajal, T. M., Viacrusis, K. M., Hernandez, L. F. T., Ho, H. T., Amalin, D. M., & Watanabe, K. (2018). Machine learning methods reveal the temporal pattern of dengue incidence using meteorological factors in metropolitan Manila, Philippines. *BMC Infectious Diseases, 18*(1), 183. https://doi.org/10.1186/s12879-018-3066-0

De Stercke, S., Buytaert, W., Mijic, A., Templeton, M., Zulkafli, Z., Ab Rahman, J., Tahir, W., Rahmat, F., Jayaramu, V., Salwa Ibrahim, S., Ismail, M., Juraiza Ishak, A., & Abdul Rahman, R. Z. (2023). *Hydro-epidemiological data for leptospirosis for areas in Brazil, Malaysia, Philippines, Argentina, China and Sri Lanka, 1978-2020* [Data set]. NERC EDS Environmental Information Data Centre. https://doi.org/10.5285/56f42170-3678-4586-b8c8-9b05f03125e1

GMA Integrated News. (2025, August 8). NKTI turns gym into ward amid influx of leptospirosis cases. *GMA News Online*. https://www.gmanetwork.com/news/topstories/nation/955198/nkti-turns-gym-into-ward-amid-influx-of-leptospirosis-cases/story/

Matsushita, N., Ng, C. F. S., Kim, Y., Suzuki, M., Saito, N., Ariyoshi, K., Salva, E. P., Dimaano, E. M., Villarama, J. B., Go, W. S., & Hashizume, M. (2018). The non-linear and lagged short-term relationship between rainfall and leptospirosis and the intermediate role of floods in the Philippines. *PLOS Neglected Tropical Diseases, 12*(4), e0006331. https://doi.org/10.1371/journal.pntd.0006331

NASA Langley Research Center. (n.d.). *Prediction Of Worldwide Energy Resources (POWER)* [Data set]. https://power.larc.nasa.gov/

Pelitro, K. J., Matavia, T. O., Soriano, K., Garcia, G. M., Manzano, J. F., Bilbao, K., Delos Angeles, A. J., Cruz, R., Lagmay, A. M., & Bandoy, D. D. (2026). *Weekly dengue incidence linked to meteorological variables at city, regional, and multi-setting scales* (Version 1.1.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.21978184

Sigales, J. (2025, September 6). Leptospirosis cases rise to 4,859 since start of rainy season – DOH. *Inquirer.net*. https://newsinfo.inquirer.net/2105553/leptospirosis-cases-rise-to-4859-since-start-of-rainy-season-doh
