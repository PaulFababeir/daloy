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
- **Deadline:** Oct 24, 2026. ⚠️ UNVERIFIED: this comes from another team's public README. Confirm on the official FAQ/primer.
- **Judging criteria** (⚠️ UNVERIFIED, secondhand):
  - Project rationale & design
  - Execution & impact
  - Code repository: structure, documentation, reproducibility, dependency and data management
  - Demo video
  - Technical rigor & innovation
  - Sources: reliable, up to date, APA 7th edition
- **Accepted deliverables:** web app, mobile app, dashboard, or another usable product.
- **External data:** the catalogue links out to data.gov.ph, WHO GHO, HDX, UNICEF and the UP DSSoc PJDSC-Datasets GitHub, which suggests outside data is allowed. ⚠️ Confirm the rule on the FAQ and **cite every source**.
- **Team:** Fabi is the team captain. Other members: TBD. Teammates use different AI models, which is why this repo's context-file system exists.

## Concept

**Name:** `<project-name>` (TBD, not yet decided). Working tagline: "Trace the rain, target the outbreak."

**Pivot:** the team moved away from an earlier idea (diabetes/heart disease risk prediction with facility suggestions) to **forecasting dengue and leptospirosis outbreaks from meteorological data**, at province or city level.

### Pitch

Philippine dengue and leptospirosis surges follow the rain. Leptospirosis peaks about 2 weeks after heavy rainfall, and dengue follows weeks to months of warm, wet weather. Local government units (LGUs) usually act only after cases cross thresholds.

`<project-name>` combines Department of Health (DOH) surveillance data with satellite weather data to:

- forecast weekly dengue risk 1–4 weeks ahead for each province or city,
- flag flood-triggered leptospirosis surges before patients arrive, and
- explain each alert in plain language.

Each alert comes with recommended actions: where to pre-position doxycycline and IV fluids, which hospitals may be overwhelmed, and when to run clean-up drives. This covers all three challenge goals.

### Scope

- **Dengue** is the main **trained forecaster**, because the catalogue has the data for it.
- **Leptospirosis** is an **evidence-based trigger module**: a rule or simple model that fires 2 weeks after heavy rain or flooding. Public case data for it is mostly national or regional.
- **Spatial unit:** province level, because that is the granularity of the catalogue's dengue data. City-level output is a showcase only where city data exists, with Quezon City as the main example.

## MVP plan

1. **Dengue model (2–3 days):**
   1. Clean the HDX data into weekly province counts.
   2. Pull NASA POWER weather and aggregate it to weekly.
   3. Build the lag features.
   4. Backtest the baseline, the NB-GLM and LightGBM against each other.
   5. Apply the DOH tiers.
   6. Build the Streamlit map with a SHAP panel.
2. **Leptospirosis module (1 day):** a 2-week-lag rain/flood trigger with a what-if slider and action cards.
3. **Stretch goals:**
   - Quezon City city-level demo
   - Hospital and rural health unit (RHU) capacity overlay
   - SMS alert mock-up for LGUs
   - Google Trends nowcasting

## Feature priority (impact vs. effort)

| Feature | Challenge goal | Impact | Effort |
|---|---|---|---|
| Province/city risk map with Normal/Alert/Epidemic tiers | Stop outbreaks early | High | Low |
| 1–4 week forecasts with uncertainty bands | Stop outbreaks early | High | Medium |
| SHAP "why is risk high" panel | All | High | Low |
| Typhoon/heavy-rain what-if slider → leptospirosis surge in 2 weeks | Prevention | High | Low–Medium |
| Action cards: doxycycline, IV fluids, test kits, clean-up drives | Healthcare reach | High | Low |
| Hospital/RHU capacity overlay | Healthcare reach | Medium–High | Medium |
| Vulnerability index (population density, poverty, water and sanitation, flood hazard) | Prevention | Medium | Medium |
| SMS/email alert mock-up | Stop outbreaks early | Medium | Low |
| Google Trends nowcast | Stop outbreaks early | Medium | Medium |

## Story hook: the 2025 leptospirosis surge

- 4,859 cases since the start of the rainy season, as of Sept 6, 2025 (DOH).
- The National Kidney and Transplant Institute (NKTI) converted space into a leptospirosis ward in August 2025.

Source citations for these figures: TBD (add APA references to `docs/DATA_MODEL.md`).
