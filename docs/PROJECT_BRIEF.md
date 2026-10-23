# PROJECT BRIEF

> Rarely changes. Don't rewrite without team agreement (see `AGENTS.md`).

## Competition context

- **Event:** Philippine Junior Data Science Challenge 2026 (PJDSC 2026), organized by the UP Data Science Society (UP DSSoc).
- **Challenge:** "Make Health Data Count." The three goals:
  1. Improve disease prevention.
  2. Stop outbreaks early.
  3. Strengthen healthcare reach in communities.
- **Theme:** "Trace the Pattern, Target the Cure: Advancing Public Health Through Data Science."
- **Official dataset catalogue:** https://pjdsc26-website.vercel.app/catalogue
- **Deadline:** Oct 24, 2026 (confirmed). Team target: finish by Oct 23, 2026.
- **Judging criteria** (⚠️ UNVERIFIED, secondhand):
  - Project rationale & design
  - Execution & impact
  - Code repository: structure, documentation, reproducibility, dependency and data management
  - Demo video
  - Technical rigor & innovation
  - Sources: reliable, up to date, APA 7th edition
- **Accepted deliverables:** web app, mobile app, dashboard, or another usable product.
- **External data:** the catalogue links out to data.gov.ph, WHO GHO, HDX, UNICEF and the UP DSSoc PJDSC-Datasets GitHub, which suggests outside data is allowed. ⚠️ Confirm the rule on the FAQ and **cite every source**.

## Concept

**Name:** `<project-name>` (TBD, not yet decided). Working tagline: "Trace the rain, target the outbreak."

**Pivot:** the team moved away from an earlier idea (diabetes/heart disease risk prediction with facility suggestions) to **estimating dengue and leptospirosis risk from rainfall**.

**Source of truth:** the proposal doc's NEW PROPOSAL tab (link in `docs/LINKS.md`). Its METHODOLOGY section was rewritten by the team on or before 2026-10-23 and is what this brief now follows. The tab's Executive Summary, Objectives, Scope and Appendices still describe the earlier plan; see "Proposal sections that are out of date" below.

### Pitch

Philippine dengue and leptospirosis surges follow the rain. Leptospirosis peaks about 2 weeks after heavy rainfall (Matsushita et al., 2018), and dengue rises with wet-season weather. Local government units (LGUs) usually act only after cases cross thresholds, and surveillance reports arrive about 2–3 weeks late.

`<project-name>` links rainfall to expected cases so LGUs can act before the surveillance numbers arrive:

- **Leptospirosis (Manila):** monthly cases estimated from this month's and last month's rainfall plus seasonality.
- **Dengue (Quezon City):** monthly cases estimated from this month's rainfall, with an interpretable effect size (change in cases per extra 100 mm of rain).

Each estimate comes with suggested actions (pre-positioning doxycycline and IV fluids, hospital readiness, clean-up drives).

### Scope

- **Places:** Manila (leptospirosis) and Quezon City (dengue). The earlier province-level plan is superseded.
- **Resolution:** monthly. Weekly models were tried and fit poorly.
- **Models:** gradient boosting with Poisson loss (leptospirosis) and Poisson regression (dengue), validated with leave-one-year-out cross-validation. Full detail in `docs/DATA_MODEL.md`.
- **Data:** leptospirosis cases from the EIDC hydro-epidemiological dataset (Manila, 2001–2012) with NASA POWER rainfall; dengue cases and rainfall from the UPRI-NOAH dataset (Quezon City, 2010–2025).

## MVP plan (deadline Oct 24, 2026)

1. **Models:** done per the proposal methodology. Record the final CV results in `docs/DATA_MODEL.md`.
2. **App:** Streamlit app showing, per disease, actual vs. predicted monthly cases, a rainfall what-if slider (the models take rainfall as input), the effect-size statement, and action cards.
3. **Repo:** README with setup and run steps, a dependency file, and a reproducible notebook or script for each model.
4. **Proposal, slides, demo video:** align them with the methodology (see below).

Stretch, only if time allows: a 17-region dengue map from the same UPRI-NOAH workbook's Regional sheet, or a Quezon City barangay hotspot map.

## Proposal sections that are out of date

As of 2026-10-23, these sections of the NEW PROPOSAL tab still describe the earlier plan and conflict with its own METHODOLOGY:

- **Executive Summary, Objectives:** province level, weekly forecasts 1–4 weeks ahead, negative-binomial + LightGBM, Normal/Alert/Epidemic tiers, SHAP.
- **Scope & Limitations:** province level, HDX data, rainfall *trigger* for leptospirosis (it is now a trained model).
- **Appendices:** explain negative-binomial regression, LightGBM and SHAP. None of these are in the methodology now.
- **References:** missing the two datasets the methodology uses (EIDC leptospirosis, UPRI-NOAH/Zenodo dengue), and still lists HDX and Mendeley, which it no longer uses. Full APA entries are in `docs/DATA_MODEL.md`.
- **Placeholders in the Methodology:** `[citation]` (NASA POWER), `[end year]` (2025), `[ISO / epidemiological]` and `[confirm]` (answers in `docs/DATA_MODEL.md`).

## Feature priority (impact vs. effort)

| Feature | Challenge goal | Impact | Effort |
|---|---|---|---|
| Actual vs. predicted monthly cases chart, per disease | Stop outbreaks early | High | Low |
| Rainfall what-if slider → expected cases | Prevention | High | Low |
| Plain-language effect size ("each extra 100 mm of rain → X% more dengue cases") | All | High | Low |
| Action cards: doxycycline, IV fluids, test kits, clean-up drives | Healthcare reach | High | Low |
| Model & methodology page: CV results vs. baseline, limitations | All (rigor) | High | Low |
| 17-region dengue map (UPRI-NOAH Regional sheet) | Stop outbreaks early | High | Medium |
| Quezon City barangay hotspot map | Healthcare reach | Medium | Medium |
| SMS/email alert mock-up for LGUs | Stop outbreaks early | Medium | Low |
| Hospital/RHU capacity overlay | Healthcare reach | Medium–High | Medium |

## Story hook: the 2025 leptospirosis surge

- 4,859 cases since the start of the rainy season, as of Sept 6, 2025 (DOH).
- The National Kidney and Transplant Institute (NKTI) converted space into a leptospirosis ward in August 2025.

Source citations for these figures: TBD (add APA references to `docs/DATA_MODEL.md`).
