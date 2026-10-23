# PJDSC 2026 Proposal & Web App Handoff (`DALOY`)

> **Last Updated:** 2026-10-23 (Synced with latest `origin/main` methodology + `DALOY` HTML/CSS/JS Web App Prototype)
> **Prepared by:** Ivanne (`UI, demo, proposal`)
> **App Prototype Location:** [`app/daloy-ui/index.html`](../app/daloy-ui/index.html), [`app/daloy-ui/styles.css`](../app/daloy-ui/styles.css), [`app/daloy-ui/app.js`](../app/daloy-ui/app.js)

---

## 1. Executive Summary of Current Project State (Post-2026-10-23 Sync)

Following the 2026-10-23 methodology update and team meeting:
- **Proposed App Name:** **`DALOY`** (*"Trace the rain, target the outbreak"* — Tagalog for *flow / current*).
- **Core Problem & Framing:** DOH surveillance takes **2–3 weeks** to compile and verify dengue and leptospirosis case counts, whereas **NASA POWER daily satellite rainfall** is available within days. **`DALOY`** uses monthly rainfall to **nowcast** same-month disease burden ahead of official reporting delays.
- **Models & Geographic Scope (Monthly City-Level Nowcasting):**
  1. **Dengue — Quezon City (`2010–2025`, 192 months):**
     - **Data:** UPRI-NOAH / Zenodo weekly QC dengue & NASA POWER rainfall dataset (`Pelitro et al., 2026`), aggregated to monthly totals (`YR, MN, DC_QC, RF_NASA, n_weeks`).
     - **Model:** `scikit-learn` `PoissonRegressor(alpha=0.1)` on standardized $\log(1 + \text{RF\_NASA})$, plus an unpenalized Poisson regression in $100\text{ mm}$ units for an interpretable effect size ($\exp(\beta)$ per $+100\text{ mm}$).
  2. **Leptospirosis — City of Manila (`2001–2012`, 144 months):**
     - **Data:** NERC Environmental Information Data Centre (EIDC) weekly Flood-related Extreme Event (FREE) dataset (`De Stercke et al., 2023`) merged with daily NASA POWER `PRECTOTCORR` at Manila ($14.5995^\circ\text{N}, 120.9842^\circ\text{E}$), aggregated to monthly (`month, lepto, rain_total_mm, n_weeks`).
     - **Model:** `HistGradientBoostingRegressor(loss="poisson", max_depth=2, learning_rate=0.05, max_iter=150, min_samples_leaf=5, random_state=42)` using $\log(1 + \text{rain}_t)$, $\log(1 + \text{rain}_{t-1})$, and seasonal $\sin/\cos(2\pi m / 12)$, predicting weekly rate ($\text{lepto} / n_{\text{weeks}}$) multiplied by $n_{\text{weeks}}$.
- **Validation Protocol:** **Leave-One-Year-Out Cross-Validation (LOYO-CV)** benchmarked against an **other-years monthly mean baseline** across 5 metrics: **MAE**, **RMSE**, **$R^2$**, **Spearman $\rho$**, and **RMSE on $\log(1 + \text{cases})$**.

---

## 2. Interactive Web App Prototype: `DALOY` (`app/daloy-ui/`)

A complete, zero-dependency, responsive **HTML5 + CSS3 + Vanilla JS** web app prototype has been built in [`app/daloy-ui/`](../app/daloy-ui/) implementing all features finalized in the 2026-10-23 team meeting:

### View 1: `Case estimate` (`#view-predict` — Finalized Feature 1)
- **Disease & City Segmented Switcher:** Switches the entire dashboard theme, inputs, and historical series between **Dengue · Quezon City** (terracotta accent `#C2551F`) and **Leptospirosis · Manila** (flood-blue accent `#3A6FB0`).
- **Scenario Controls:**
  - **Calendar month selector (`Jan–Dec`)** + **Current-month rainfall slider & numeric box (`0–1,200 mm`)**.
  - **Quick-preset chips:** *Dry month*, *Typical for month*, *Very wet (450 mm)*, *Typhoon month (650 mm)*.
  - **Leptospirosis-specific inputs:** Automatically reveals **Rainfall last month (`mm`)** and **Case weeks in this month (`n_weeks` = 4 or 5)** when Leptospirosis is selected.
  - **Collapsible *"What the model actually uses"* drawer:** Displays the exact mathematical transforms ($\log(1 + \text{RF\_NASA})$, $\sin/\cos$ month encoding, rate normalization).
- **Expected Monthly Cases Card (Primary Output):**
  - Displays the point estimate (`cases / month`), approximate **95% Poisson interval**, horizontal comparison bar against the **historical monthly average (other-years mean baseline)**, relative status pill (*Near typical*, *Above typical*, *Well above typical*), and a plain-language **"Why this number"** box (+100 mm effect-size statement for Dengue; 2-month cumulative rainfall + seasonal context for Leptospirosis).
- **Most Similar Past Month Card:**
  - Computes distance in model feature space against the city's historical monthly record and displays the **#1 closest past month & year**, similarity percentage ring, rainfall then, **actual reported cases then**, and the **next 3 closest historical months**.
- **Interactive SVG Scatter + Model Curve Chart:**
  - Plots all historical monthly observations, highlights same-calendar-month records, renders the model response curve across `0–900 mm`, and pins both **Your input (`★`)** and the **Most similar past month (`◎`)**.
- **Flood-Vulnerable Areas within the City Card:**
  - Interactive barangay hex-map + ranked barangay hazard table for Quezon City (*Tatalon, Bagong Silangan, Roxas District, Doña Imelda, Batasan Hills*) and Manila (*Sampaloc, Tondo I/II, Ermita–Taft, Santa Ana, Paco*), explicitly badged `Data source pending` until UP NOAH / MGB shapefiles are wired in.
- **Suggested LGU & Hospital Actions Card:**
  - Context-aware operational checklist (4S clean-up, NS1/ORS stock check, fast lanes for Dengue; doxycycline prophylaxis, flood-wading advisory, dialysis/ICU readiness for Leptospirosis), explicitly badged `Pending team confirmation`.

### View 2: `Your city` (`#view-upload` — Finalized Feature 2, `[Experimental]`)
- **4-Step Guided Flow:** *1. Choose disease* → *2. Upload CSV* → *3. Check file* → *4. Results*.
- **Exact Agreed CSV Schema Display & One-Click Copy:**
  - **Dengue CSV:** `YR,MN,DC_QC,RF_NASA,n_weeks`
  - **Leptospirosis CSV:** `month,lepto,rain_total_mm,n_weeks`
- **Drag-and-Drop CSV Uploader + Template Downloader + Built-In Sample City Loader.**
- **Live Client-Side Validation Checklist:** Verifies exact column names, blank cells, non-negative numeric types, valid months/dates, and $\ge 24$ rows ($\ge 2$ years) for LOYO-CV.
- **Instant Exploratory Output:** Displays a 5-row preview table, summary stats ($N$ months, mean rain, mean cases), empirical **Spearman rank correlation ($\rho$)**, and an interactive rainfall-vs.-cases scatter plot.

### View 3: `Method & data` (`#view-method`)
- **4-Step Pipeline Diagram:** *1. Collect → 2. Aggregate → 3. Model → 4. Validate*.
- **Side-by-Side Model Cards & Leave-One-Year-Out CV Table:** Ready for final numbers from JD/JP/Paul (`CONFIG` object in `app/daloy-ui/app.js`).
- **Transparent Limitations, Next Steps, and APA 7th References.**

---

## 3. Verified Citations & PJDSC 2026 Rules to Paste into Proposal Doc

### A. Missing Story-Hook Citations (`docs/DATA_MODEL.md` & `docs/LINKS.md` Open Items)
These two citations were still marked `Citation TBD` in the proposal and `docs/STATUS.md` — here are the verified APA 7th citations:

1. **DOH 2025 Leptospirosis Cases (4,859 cases from June 8 to Sept 4, 2025):**
   > Sigales, J. (2025, September 6). Leptospirosis cases rise to 4,859 since start of rainy season – DOH. *Inquirer.net*. https://newsinfo.inquirer.net/2105553/leptospirosis-cases-rise-to-4859-since-start-of-rainy-season-doh

2. **NKTI Gym Converted into Leptospirosis Ward (August 2025):**
   > GMA Integrated News. (2025, August 8). NKTI turns gym into ward amid influx of leptospirosis cases. *GMA News Online*. https://www.gmanetwork.com/news/topstories/nation/955198/nkti-turns-gym-into-ward-amid-influx-of-leptospirosis-cases/story/

### B. Complete APA 7th Reference List for the Proposal
- De Stercke, S.,urer, D., Buytaert, W., & Mijic, A. (2023). *Flood-related Extreme Event (FREE) dataset for Manila: Leptospirosis, climate, and socioeconomic data* [Data set]. NERC Environmental Information Data Centre. https://doi.org/10.5285/32320989-5563-4449-9682-6c7a1f3229e6
- GMA Integrated News. (2025, August 8). NKTI turns gym into ward amid influx of leptospirosis cases. *GMA News Online*. https://www.gmanetwork.com/news/topstories/nation/955198/nkti-turns-gym-into-ward-amid-influx-of-leptospirosis-cases/story/
- Matsushita, N., Ng, C. F. S., Kim, Y., Suzuki, M., Saito, N., Ariyoshi, K., Salva, E. P., Dimaano, E. M., Villarama, J. B., Go, W. S., & Hashizume, M. (2018). The non-linear and lagged short-term relationship between rainfall and leptospirosis and the intermediate role of floods in the Philippines. *PLOS Neglected Tropical Diseases*, *12*(4), e0006331. https://doi.org/10.1371/journal.pntd.0006331
- NASA Langley Research Center. (n.d.). *Prediction Of Worldwide Energy Resources (POWER) Project*. https://power.larc.nasa.gov/
- Pelitro, J., et al. (2026). *Quezon City weekly dengue cases and meteorological variables (2010–2025)* [Data set]. UPRI-NOAH / Zenodo. https://doi.org/10.5281/zenodo.19045384
- Sigales, J. (2025, September 6). Leptospirosis cases rise to 4,859 since start of rainy season – DOH. *Inquirer.net*. https://newsinfo.inquirer.net/2105553/leptospirosis-cases-rise-to-4859-since-start-of-rainy-season-doh

### C. Verified PJDSC 2026 Competition Rules (`pjdsc26-website.vercel.app/primer` & `/faq`)
- **External Datasets Rule:** Explicitly **ALLOWED** (*"Participants may use datasets from the official PJDSC Dataset Catalogue and supplement them with publicly available external data, provided all sources are properly cited in APA 7th format"*).
- **Stage 2 Anonymity Requirement:** Ensure the PDF proposal, slide deck, and demo video do **not** display your school name, university logos, or personal names in the submission artifacts (use team code/name only).
