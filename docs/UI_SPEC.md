# UI SPEC

> Migrated from the Google Docs **UI tab** on 2026-10-20. This file is now the source of truth; the Docs tab should be read-only.

Draft UI concept for a web app that predicts leptospirosis and dengue risk from meteorological data.

## Production stack: React + Three.js + FastAPI (`app/frontend/` & `app/backend/`)

Modernized on 2026-10-23 by Ivanne into a decoupled production tech stack:
- **Frontend (`app/frontend/`):** React 19, Vite, Tailwind CSS, Lucide icons, Three.js 3D Philippine archipelago map with monsoon rainfall particle dynamics and interactive outbreak beacons (Quezon City & Manila).
- **Backend (`app/backend/`):** FastAPI, Uvicorn, Pydantic, scientific computing engine (Poisson regression prediction, nearest-neighbor historical month similarity, LGU flood hazard query, and custom CSV validation).
- **Dual-mode architecture:** Automatic fallback ensures the frontend operates seamlessly offline or during backend restarts.

## Prototype implementation: `DALOY` (`app/daloy-ui/`)

Implemented on 2026-10-23 by Ivanne as a standalone, zero-dependency HTML/CSS/JS interactive prototype in `app/daloy-ui/` (`index.html`, `styles.css`, `app.js`):

- **Proposed app name:** **DALOY** (*"Trace the rain, target the outbreak"* — Tagalog for *flow/current*). Pending final team confirmation.
- **Navigation (3 top-level views):**
  1. **Case estimate (`#view-predict` — Finalized Feature 1):**
     - **Disease & city switcher:** Segmented toggle between **Dengue · Quezon City** (`2010–2025`, `PoissonRegressor(alpha=0.1)`) and **Leptospirosis · Manila** (`2001–2012`, `HistGradientBoostingRegressor(loss="poisson")`).
     - **Scenario inputs:** Calendar month selector (`Jan–Dec`), current-month total rainfall slider + numeric input (`0–1,200 mm`) + scenario quick-chips (*Dry month*, *Typical for month*, *Very wet (450 mm)*, *Typhoon month (650 mm)*). When Leptospirosis is active, unlocks **Rainfall last month (`mm`)** and **Case weeks in this month (`n_weeks` = 4 or 5)**. Includes a collapsible *"What the model actually uses"* formula drawer.
     - **Expected Monthly Cases card:** Displays predicted monthly cases (`Math.round(y_hat)`), an approximate 95% Poisson interval (`[y_hat ± 1.96 * sqrt(y_hat)]`), a horizontal comparison bar against the historical monthly average (other-years mean baseline), a relative status badge (`Near typical` / `Above typical` / `Well above typical`), and a plain-language **"Why this number"** box (+100 mm effect-size statement for Dengue; two-month cumulative rainfall + seasonal context for Leptospirosis).
     - **Most Similar Past Month card:** Ranks historical months by normalized Euclidean distance in feature space (`log(1 + rain)` + seasonal proximity for Dengue; current + previous month `log(1 + rain)` + circular month distance for Leptospirosis) and displays the #1 closest historical month/year, rainfall then, actual reported cases then, and the next 3 closest past months.
     - **Interactive SVG Scatter + Model Curve chart:** Plots historical monthly observations, highlights same-calendar-month points, draws the model response curve across `0–900 mm` rainfall, and pins both **Your input** and the **Most similar past month**.
     - **Flood-Vulnerable Areas within the City card:** Displays an interactive barangay flood-susceptibility map placeholder + ranked high-risk zones for Quezon City (Tatalon, Bagong Silangan, Roxas District, Doña Imelda, Batasan Hills) and Manila (Sampaloc, Tondo I/II, Ermita–Taft, Santa Ana, Paco) with an explicit `Data source pending` badge (awaiting UP NOAH / MGB shapefile integration).
     - **Suggested LGU & Hospital Actions card:** Pairs the estimate with disease-specific operational checklists (4S clean-up, NS1/ORS stock check, fast lanes for Dengue; doxycycline prophylaxis, flood-wading advisory, dialysis/ICU readiness for Leptospirosis), tagged `Pending team confirmation`.
  2. **Your city (`#view-upload` — Finalized Feature 2, `[Experimental]`):**
     - 4-step guided workflow (*1. Choose disease* → *2. Upload CSV* → *3. Check file* → *4. Results*).
     - Shows the exact required CSV schema from `docs/DATA_MODEL.md` (`YR,MN,DC_QC,RF_NASA,n_weeks` for Dengue; `month,lepto,rain_total_mm,n_weeks` for Leptospirosis) with a one-click copy button, downloadable CSV template, and built-in sample data loader.
     - Mode toggle between **Retrain on my city (LOYO-CV)** and **Apply DALOY's trained model**, with a clear scope warning that models trained on QC/Manila may not transfer without local retraining.
     - Live client-side CSV validator (checks exact column headers, blank cells, numeric non-negative counts/rainfall, valid months/dates, and $\ge 24$ months for LOYO-CV), 5-row data preview table, and instant Spearman $\rho$ correlation + scatter plot.
  3. **Method & data (`#view-method`):**
     - Visualizes the 4-step pipeline (*Collect → Aggregate → Model → Validate*), side-by-side model cards, Leave-One-Year-Out CV metric comparison table (`[TBD — awaiting final run]`), key limitations, next steps, and APA 7th references.

## Finalized features (team meeting, 2026-10-23)

**These override anything later in this file that conflicts with them.** The sections after this one are the earlier draft concept.

### 1. Case prediction: dengue (Quezon City) and leptospirosis (Manila)

- **Predicted cases:** show the model's predicted monthly cases for the user's input. The exact input fields are TBD. The models need monthly rainfall (both diseases), plus the previous month's rainfall and the calendar month for leptospirosis.
- **Most similar past month:** from the city's history in the dataset, show the month and year most similar to the input, with what actually happened then. The similarity method is TBD (see `DATA_MODEL.md` → "App features: data needs").
- **Flood-vulnerable areas:** show which areas of the city are vulnerable, based on flood history. The data source and area unit (e.g. barangay) are TBD.

### 2. Experimental: upload data for another city

- A user can upload a dataset for a city outside our scope, which is only Quezon City and Manila.
- Format: **CSV**, one file per disease, with the exact columns in `DATA_MODEL.md` → "User-uploaded CSV format".
- Label the feature as **experimental** in the UI.
- What the app does with the upload (retrain the model on it, or apply our trained models to it): TBD. The proposal's Scope says the models may not transfer to other cities without retraining.

### Not in the finalized list (confirm whether to keep)

Action cards, the rainfall what-if slider (it may be the same thing as the "input" above), the alerts screen, and export/reports. These come from the earlier draft and the proposal's Executive Summary, which mentions the slider and suggested actions.

## Overall concept

A **weather app for disease risk**. The UI should answer three questions fast:

1. *Where is risk rising?*
2. *How soon?*
3. *What should we do?*

## Users

- Likely users: local health officers, epidemiologists, and disaster-response planners.
- Field workers will check it on phones.
- Public vs. professional audience: TBD (see open questions).

## Core layout

### 1. Map-first home screen

- **Map:** a choropleth map shaded by predicted risk level. Unit: municipality, district, or barangay, depending on data granularity (see the conflicts section below).
- **Disease toggle** at the top: **Dengue** / **Leptospirosis** / **Both**.
- **Time slider** to scrub through forecast horizons (this week, +2 weeks, +4 weeks).

### 2. Risk summary strip

Above or beside the map, a few cards:

- Highest-risk areas
- Number of areas at "High" or above
- Biggest week-over-week change

**Risk scale:** a simple, consistent 4-level scale (**Low / Moderate / High / Critical**) shown with color plus labels, so it isn't color-only.

### 3. Area detail panel

Clicking a region opens a side panel with:

- **Forecast chart:** predicted cases or risk score over time, with a confidence band
- **Meteorological drivers:** rainfall, temperature, humidity, flood indicators
- **Plain-language explanation**, e.g. "Risk is rising due to 3 weeks of above-average rainfall"
- **Recent actual case counts** overlaid on predictions, if available

## Different emphasis for each disease

- **Dengue** is driven by temperature, humidity and rainfall with a lag (mosquito breeding takes time). Show lagged weather effects and a longer forecast horizon.
- **Leptospirosis** spikes after heavy rain and flooding. Emphasize rainfall intensity, flood events and shorter lead times (1 to 3 weeks).

The disease toggle swaps which drivers are highlighted, which makes this distinction clear.

## Secondary screens

| Screen | Purpose |
|---|---|
| Trends & history | Compare past seasons, with the model's past predictions against actual cases |
| Weather inputs | Transparent view of the meteorological data feeding the model (source, last updated) |
| Alerts | Threshold-based notifications ("Notify me when any area hits High") |
| Model & methodology | Accuracy metrics, limitations and data sources. This matters a lot for trust in a health tool. |
| Export/reports | Downloadable PDF or CSV for advisories and meetings |

## Design principles

- **Show uncertainty.** Always display confidence ranges. A forecast presented as certain will lose credibility the first time it's wrong.
- **Explainability over flash.** Officers need to justify action, so every risk level needs a "why."
- **Actionable framing.** Pair risk levels with suggested actions (clean-up drives, clinic readiness, public advisories).
- **Calm, clinical visual style.** A clean light theme with a sequential color ramp, plus dark mode for control-room use. Avoid alarm-red everywhere so "Critical" actually stands out.
- **Mobile-friendly.** The map and cards collapse into a stacked layout on phones.

## Rough wireframe

```
┌───────────────────────────────────────────────┐
│ Logo   [Dengue | Leptospirosis | Both]  Alerts│
├───────────────┬───────────────────────────────┤
│ Summary cards │                               │
│ • Top areas   │         RISK MAP              │
│ • # High risk │                               │
│ • Weekly Δ    │   [ time slider: +1 +2 +4 ]   │
├───────────────┴───────────────────────────────┤
│  Area detail: forecast chart | weather drivers│
└───────────────────────────────────────────────┘
```

## Conflicts with `docs/DATA_MODEL.md` (team to resolve)

Updated 2026-10-23 after the proposal methodology changed (see `DATA_MODEL.md`). Not decided yet.

- **Map unit:** ~~open~~ **Resolved by the 2026-10-23 meeting:** the map shows **flood-vulnerable areas within each city**, not predicted risk per area. The models still give one number per city per month, so don't shade areas by predicted cases.
- **Time resolution and horizon:** the models are **monthly**, not weekly. The "+1 / +2 / +4 weeks" slider doesn't apply. Both models use the current month's rainfall, so both are nowcasts (leptospirosis also uses last month's rainfall). Their lead comes from beating the 2–3 week reporting delay. Replace the time slider with a **month selector** plus a **rainfall what-if slider**.
- **Drivers panel:** rainfall is the only weather input in both final models. Temperature, humidity and flood indicators should not be shown as model drivers.
- **Risk scale:** the models output expected case counts. The UI's 4 levels (Low / Moderate / High / Critical) or the DOH-style 3 tiers (Normal / Alert / Epidemic) would need thresholds defined on monthly counts. Pick one, or show counts against the baseline instead.
- **"Why" explanations:** SHAP is not in the current methodology. Use the dengue effect size (change in cases per 100 mm of rain), the current/previous-month rainfall and season for leptospirosis, and the **most similar past month** (finalized feature) as the plain-language "why".

## Open questions

- Who are the intended users: the public or health professionals?
- ~~What geographic level is the case data at?~~ Answered: city level (Manila, Quezon City), monthly. See `DATA_MODEL.md`.
- Do we want separate public-facing and professional views, or just one? (2025 runner-up link.od had both; see `docs/FINALISTS_INSIGHTS.md`.)
- What exactly does the user enter for a prediction (rainfall only, or rainfall + month)?
- How is "most similar past month" defined?
- Which flood data, and at what area unit?
- For an uploaded city: retrain on the upload, or apply our models?
- Keep action cards and the what-if slider?
