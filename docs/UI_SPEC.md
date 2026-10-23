# UI SPEC

> Migrated from the Google Docs **UI tab** on 2026-10-20. This file is now the source of truth; the Docs tab should be read-only.

Draft UI concept for a web app that predicts leptospirosis and dengue risk from meteorological data.

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

- **Map unit:** the models cover **two cities only** (Manila for leptospirosis, Quezon City for dengue), so a choropleth of many areas has nothing to shade yet. Options: drop the map for the MVP and lead with charts; show a simple two-city map; or build the 17-region dengue map from the UPRI-NOAH Regional sheet (stretch).
- **Time resolution and horizon:** the models are **monthly**, not weekly. The "+1 / +2 / +4 weeks" slider doesn't apply. Both models use the current month's rainfall, so both are nowcasts (leptospirosis also uses last month's rainfall). Their lead comes from beating the 2–3 week reporting delay. Replace the time slider with a **month selector** plus a **rainfall what-if slider**.
- **Drivers panel:** rainfall is the only weather input in both final models. Temperature, humidity and flood indicators should not be shown as model drivers.
- **Risk scale:** the models output expected case counts. The UI's 4 levels (Low / Moderate / High / Critical) or the DOH-style 3 tiers (Normal / Alert / Epidemic) would need thresholds defined on monthly counts. Pick one, or show counts against the baseline instead.
- **"Why" explanations:** SHAP is not in the current methodology. Use the dengue effect size (change in cases per 100 mm of rain) and, for leptospirosis, the current/previous-month rainfall and season as the plain-language "why".

## Open questions

- Who are the intended users: the public or health professionals?
- ~~What geographic level is the case data at?~~ Answered: city level (Manila, Quezon City), monthly. See `DATA_MODEL.md`.
- Do we want separate public-facing and professional views, or just one? (2025 runner-up link.od had both; see `docs/FINALISTS_INSIGHTS.md`.)
