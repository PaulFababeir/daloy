# UI SPEC

> Migrated from the Google Docs **UI tab** on 2026-10-20. This file is now the source of truth; the Docs tab should be read-only.

Draft UI concept for a web app that predicts leptospirosis and dengue risk from meteorological data.

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
