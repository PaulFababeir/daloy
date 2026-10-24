# DALOY: Outbreak & Flood Surveillance Platform — Methodology Specification

> **Platform:** DALOY (Data-driven Analytics & Localized Outbreak Yields)  
> **Geographic Scope:** Metro Manila (National Capital Region, NCR), Philippines — 17 Local Government Units (LGUs)  
> **Diseases Monitored:** Dengue Fever (*Aedes aegypti* vector) & Leptospirosis (*Leptospira* spirochete)  
> **Last Updated:** October 2026 (PJDSC 2026 Hackathon Finalist Submission)  

---

## 1. Executive Summary & Problem Formulation

In Metro Manila, monsoon rains (*Habagat*) and tropical cyclones trigger concurrent spikes in two climate-sensitive infectious diseases through distinct hydrological mechanisms:
1. **Dengue Fever:** Driven by intermittent rainfall and urban container stagnation, creating breeding grounds for *Aedes aegypti* mosquitoes with a multi-week incubation and vector proliferation cycle.
2. **Leptospirosis:** A waterborne bacterial zoonosis caused by *Leptospira interrogans*, transmitted directly through skin abrasion contact with floodwaters contaminated by infected rodent urine. Outbreaks exhibit an acute post-flood lag of 1 to 2 weeks.

**DALOY** operationalizes meteorological and epidemiological data into a **real-time 3D geospatial digital twin**, bridging predictive epidemiological modeling with tactical public health response. The platform couples predictive models with localized action directives, 10 flood-vulnerable hotspot grids, and 36 public hospitals and super health centers across the 17 NCR municipalities.

---

## 2. Data Sources & Ingestion Pipeline

### 2.1 Epidemiological Surveillance Records
* **Dengue Fever (Quezon City, 2010–2025):**
  * Source: Quezon City Epidemiology and Surveillance Division (QCESD) via the Philippine Integrated Disease Surveillance and Response (PIDSR) system, compiled in the UPRI-NOAH dataset (*Pelitro et al., 2026*, CC BY 4.0).
  * Temporal Coverage: 832 consecutive weeks aggregated into 180+ monthly surveillance bins.
  * Target Metric: Total monthly confirmed and probable dengue cases (`DC_QC`).
* **Leptospirosis (City of Manila, 2001–2012):**
  * Source: Hydro-epidemiological data for Leptospirosis (*De Stercke et al., 2023*, NERC EDS / Open Government Licence v3.0).
  * Temporal Coverage: 143 months of surveillance reporting weekly case counts and reporting period week counts ($n_{\text{weeks}} \in \{4, 5\}$).
  * Target Metric: Weekly incidence rate normalized to monthly volume:
    $$\text{Cases}_{\text{monthly}} = \text{Rate}_{\text{weekly}} \times n_{\text{weeks}}$$

### 2.2 Satellite & Meteorological Reanalysis
* **NASA GPM IMERG & NASA POWER:**
  * Quezon City Centroid: $14.6760^\circ\text{N}, 121.0437^\circ\text{E}$
  * City of Manila Centroid: $14.5995^\circ\text{N}, 120.9842^\circ\text{E}$
  * Primary Ingested Feature: Surface precipitation accumulation (mm/month, `RF_NASA`).
  * Secondary Engineering: Antecedent rainfall lag ($\text{Rain}_{t-1}$, mm) capturing ground saturation and residual flood stagnation.

### 2.3 Rationale for Monthly Aggregation
Daily and weekly epidemiological records in Metro Manila suffer from pronounced reporting artifacts:
* Clumping of case notifications on Mondays and post-typhoon reporting backlogs.
* Stochastic zero-inflation during dry months.
Aggregating to calendar monthly resolution ($M_t$) filters high-frequency noise while aligning with public health budgetary, supply chain, and vector control planning cycles.

---

## 3. Mathematical & Machine Learning Formulations

### 3.1 Dengue: Regularized Poisson Generalized Linear Model (GLM)
Dengue case counts $Y_t \in \mathbb{N}_0$ follow an overdispersed count distribution conditioned on monthly precipitation $R_t$:

$$\mathbb{E}[Y_t \mid R_t] = \mu_t = \exp\left(\beta_0 + \beta_1 z(R_t)\right)$$

Where:
* $z(R_t) = \frac{\log(1 + R_t) - \bar{x}}{\sigma_x}$ represents standardized log-transformed precipitation.
* The model is fitted using scikit-learn `PoissonRegressor(alpha=0.1, max_iter=300)` with L2 penalty minimizing the Poisson deviance loss:

$$\mathcal{D}(y, \hat{y}) = 2 \sum_{t=1}^N \left( y_t \log\frac{y_t}{\hat{y}_t} - (y_t - \hat{y}_t) \right) + \frac{\alpha}{2} \|\beta\|_2^2$$

* **Effect Size Formulation:** An unpenalized Poisson regression parameterized per 100 mm of precipitation yields $\exp(\beta_{\text{100mm}})$, quantifying the percentage surge in dengue incidence per 100 mm rainfall increment.

### 3.2 Leptospirosis: Histogram Gradient Boosting with Poisson Loss
Leptospirosis dynamics exhibit non-linear threshold responses: dry-season baseline vs. acute monsoon inundation. We deploy a `HistGradientBoostingRegressor` parameterized with Poisson deviance loss:

* **Input Vector:**
  $$\mathbf{x}_t = \begin{bmatrix} \log(1 + R_t) \\ \log(1 + R_{t-1}) \\ \sin\left(\frac{2\pi m_t}{12}\right) \\ \cos\left(\frac{2\pi m_t}{12}\right) \end{bmatrix}$$
  * $R_t$: Current month cumulative rainfall (mm).
  * $R_{t-1}$: Antecedent 1-month lag rainfall (mm).
  * Harmonic cyclical features encode annual monsoonal seasonality.
* **Target Variable:** Weekly case rate $r_t = \frac{Y_t}{n_{\text{weeks}, t}}$.
* **Hyperparameters:**
  * `loss="poisson"`
  * `max_depth=2` (preventing overfitting on extreme typhoon outliers like Ondoy 2009)
  * `learning_rate=0.05`
  * `max_iter=150`
  * `min_samples_leaf=5`

---

## 4. Cross-Validation & Benchmark Performance

To prevent temporal data leakage, models were evaluated strictly using **Leave-One-Year-Out Cross-Validation (LOYOCV)**:
For each year $k \in \{1, \dots, K\}$, all records from year $k$ were held out as the test fold while training on the remaining $K-1$ years. Predictions across all holdout folds were concatenated to compute out-of-fold generalization metrics.

### 4.1 Quantitative Results Table

| Disease & Target LGU | Model Architecture | LOYOCV Spearman $\rho$ | $p$-value | LOYOCV MAE | Baseline MAE | Error Reduction |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Dengue** (Quezon City) | Poisson GLM ($\alpha=0.1$) | **0.528** | $< 0.001$ | **214.3** | 328.7 | **34.8%** |
| **Leptospirosis** (Manila) | HistGradientBoosting (Poisson) | **0.612** | $< 0.001$ | **8.42** | 13.91 | **39.5%** |

* Baseline represents the historical mean of all other years for the corresponding calendar month.
* Both models achieve statistically significant rank correlation ($\rho > 0.50$, $p < 0.001$), demonstrating reliable discrimination between low-risk and high-risk outbreak scenarios.

---

## 5. Nearest Historical Analogue Search Engine

When simulating scenario rainfall $R^*$ and antecedent rainfall $R^*_{\text{prev}}$ for month $m^*$, DALOY queries the historical surveillance catalog to find the most hydro-meteorologically similar historical month $t^*$:

$$t^* = \arg\min_{t} D(\mathbf{x}^*, \mathbf{x}_t)$$

Where the normalized Euclidean distance metric is defined as:

$$D(\mathbf{x}^*, \mathbf{x}_t) = \sqrt{ w_R \left(\frac{R^* - R_t}{\sigma_R}\right)^2 + w_{\text{prev}} \left(\frac{R^*_{\text{prev}} - R_{t-1}}{\sigma_{R_{\text{prev}}}}\right)^2 + w_m \Delta_{\text{circ}}(m^*, m_t)^2 }$$

* $\Delta_{\text{circ}}(a, b) = \min(|a - b|, 12 - |a - b|) / 6$ computes cyclical calendar distance.
* This surfaces the exact historical month (e.g., August 2012 Habagat or September 2009 Ondoy), its recorded rainfall, and the actual verified case burden, providing immediate clinical and historical context to decision-makers.

---

## 6. 3D Geospatial Digital Twin & Tactical Action Layers

### 6.1 Geographic Data & Boundary Precision
* **17 NCR Local Government Units:** Extruded 3D polygonal meshes derived from official **PSA/PSGC 2023** administrative boundaries with centroid geo-coordinates.
* **827 Official Barangays:** Complete sub-municipal coverage across Metro Manila, enabling granular hover inspection, boundary rendering, and spatial querying.

### 6.2 Prioritized Vulnerable Action Zones (10 Hotspots)
Calibrated with UP NOAH flood hazard maps, MGB alluvial flood zones, and local epidemiological density:
1. **Quezon City (Dengue):**
   * *Barangay Tatalon:* San Juan River basin corridor, high post-flood container stagnation.
   * *Barangay Bagong Silangan:* Upper Marikina River tributary floodplain.
   * *Barangay Roxas District:* Low-lying basin near Diliman Creek drainage outlets.
   * *Barangay Doña Imelda:* San Juan River & Araneta Ave low-elevation border.
   * *Barangay Batasan Hills:* High-density urban pocket with variable terrace drainage.
2. **City of Manila (Leptospirosis):**
   * *Sampaloc (España Blvd Corridor):* Chronic severe street flooding and commercial runoff.
   * *Tondo I & II:* Manila Bay coastal tidal backflow and high rodent-human contact density.
   * *Ermita / Taft Avenue Corridor:* Low-elevation stormwater stagnation corridor.
   * *Santa Ana:* Sharp meander of the Pasig River vulnerable to overtopping.
   * *Paco:* Estero de Paco drainage basin with residential stormwater accumulation.

### 6.3 Spatial Verification of 36 Health Facilities
All 36 public hospitals and health staging hubs were spatially verified using Point-in-Polygon (PIP) raycasting against official PSA administrative boundaries:
* **Result:** **100% (36/36) verified** inside their respective city boundaries with zero out-of-bounds coordinates.
* **Tertiary Referral Hospitals (18):** e.g., Philippine General Hospital (PGH), San Lazaro Hospital (national infectious disease referral center), East Avenue Medical Center, National Kidney and Transplant Institute (NKTI - hemodialysis surge capacity).
* **Super Health Centers & Staging Hubs (18):** Localized distribution points for rapid diagnostic kits (NS1/IgM), Oral Rehydration Salts (ORS), and prophylactic Doxycycline.

---

## 7. Tactical Action Protocol Matrix

DALOY maps predicted case thresholds directly to four standardized public health operational protocols:

```
+-----------------------------------------------------------------------------------------+
| CODE  | PROTOCOL TITLE             | TARGET DISEASE | CLINICAL / PUBLIC HEALTH DIRECTIVE |
+-----------------------------------------------------------------------------------------+
| 4S    | Search & Destroy Sweeps    | Dengue         | Mobilize BHW teams within 48h of   |
|       |                            |                | rainfall to eliminate stagnant     |
|       |                            |                | water containers in hotspot zones. |
|       |                            |                | Larviciding in catch-basins.       |
+-------+----------------------------+----------------+------------------------------------+
| PEP   | Post-Exposure Prophylaxis  | Leptospirosis  | Distribute Doxycycline (200mg      |
|       |                            |                | single dose for moderate exposure; |
|       |                            |                | weekly for continuous wading)      |
|       |                            |                | within 24–72 hours of flood event. |
+-------+----------------------------+----------------+------------------------------------+
| FAST  | Hydration & Fast-Lanes     | Dengue / Lepto | Establish triage fast-lanes; stage |
|       |                            |                | NS1/IgM rapid diagnostic kits, ORS,|
|       |                            |                | and IV fluids. Alert NKTI & San    |
|       |                            |                | Lazaro for hemodialysis surge.     |
+-------+----------------------------+----------------+------------------------------------+
| PIO   | Public Information Advisory| Both           | Issue multi-channel SMS, barangay  |
|       |                            |                | PA announcements, and clinic alert |
|       |                            |                | bulletins on early fever warning.  |
+-----------------------------------------------------------------------------------------+
```

---

## 8. Client Architecture & Extensibility

* **Backend:** FastAPI (Python 3.11) with Uvicorn worker serving `/api/predict`, `/api/health`, `/api/historical-analogue`, and `/api/train-custom`.
* **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Three.js WebGL rendering at a locked 60 FPS.
* **Offline Resilience:** Dual-mode execution engine: if backend network connectivity is interrupted, the frontend automatically activates a mathematical client-side fallback mirroring the exact GLM log-link and gradient boosted tree inference formulas.
* **Multi-City Extensibility ("Your City CSV"):** LGUs outside NCR can upload custom weekly/monthly CSV surveillance datasets. The platform validates data schemas, aggregates time series, fits localized Poisson models, and outputs real-time out-of-sample LOYOCV validation metrics directly in the browser.

---

## 9. References & Data Citations

1. **Pelitro, R., et al. (2026).** *Weekly Dengue Incidence Linked to Meteorological Variables at City, Regional, and Multi-Setting Scales in the Philippines*. Zenodo. DOI: [10.5281/zenodo.18187841](https://doi.org/10.5281/zenodo.18187841). License: CC BY 4.0.
2. **De Stercke, J., et al. (2023).** *Hydro-epidemiological data for Leptospirosis for areas in Brazil, Malaysia, Philippines, Argentina, China and Sri Lanka, 1978-2020*. NERC EDS Environmental Information Data Centre. DOI: [10.5285/1fb29ec3-863a-4eef-9ff0-17d47f0e6dd6](https://doi.org/10.5285/1fb29ec3-863a-4eef-9ff0-17d47f0e6dd6). License: Open Government Licence v3.0.
3. **Philippine Statistics Authority (PSA). (2023).** *Philippine Standard Geographic Code (PSGC) 2023 Administrative Boundaries*. Republic of the Philippines.
4. **Department of Health (DOH) Philippines. (2024–2025).** *National Dengue & Leptospirosis Surveillance Bulletins*. Epidemiology Bureau, Manila, Philippines.
