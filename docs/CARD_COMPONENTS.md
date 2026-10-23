# DALOY Component & Card Architecture Specification

This document maps all UI cards, floating HUD docks, modal overlays, and sub-components used across the DALOY application, including their component names, file locations, hierarchy, and styling tokens for both **Light Mode (Warm White & Soft Beige)** and **Dark Mode (Slate Navy & Bioclimatic Neon)**.

---

## Quick Navigation Index

1. [Top Navigation & Control Header (`App.tsx`)](#1-top-navigation--control-header-apptsx)
2. [Left HUD: Scenario Simulation Cards (`CaseEstimateView.tsx`)](#2-left-hud-scenario-simulation-cards-caseestimateviewtsx)
3. [Right HUD: Real-Time Intelligence & KPI Cards (`CaseEstimateView.tsx`)](#3-right-hud-real-time-intelligence--kpi-cards-caseestimateviewtsx)
4. [3D Map Viewport Dock & Tooltip (`Philippines3DMap.tsx`)](#4-3d-map-viewport-dock--tooltip-philippines3dmaptxs)
5. [Flood Vulnerability Assessment Card (`FloodZonesCard.tsx`)](#5-flood-vulnerability-assessment-card-floodzonescardtsx)
6. [Executive Analytics & Clinical Action Plan Modal (`CaseEstimateView.tsx`)](#6-executive-analytics--clinical-action-plan-modal-caseestimateviewtsx)
7. [Local LGU Surveillance Upload View (`UploadCityView.tsx`)](#7-local-lgu-surveillance-upload-view-uploadcityviewtsx)
8. [Scientific Pipeline & Governance View (`MethodView.tsx`)](#8-scientific-pipeline--governance-view-methodviewtsx)

---

## 1. Top Navigation & Control Header (`App.tsx`)

**File:** [`app/frontend/src/App.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/App.tsx)  
**Layout Position:** Fixed top overlay (`fixed top-3 left-4 right-4 z-30`)

### 1.1 Brand & Map Legend Pill
* **Component / Element:** Floating Brand Card (`header > div:first-child`)
* **Role:** Shows application identity, logo mark, subtitle, and color legend for Metro Manila cities.
* **Sub-elements:**
  * App Icon Avatar (`/favicon.svg` container)
  * Title & Scope Tag (`DALOY` + `Metro Manila 3D` badge)
  * Outbreak Subtitle (`Trace the rain, target the outbreak`)
  * City Color Legend (Rose = QC Dengue, Teal = Manila Lepto, Stone = Other 15 unmodeled cities)
* **Styling Tokens:**
  * **Light Mode:** `bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-xl`
  * **Dark Mode:** `dark:bg-slate-900/90 text-white dark:border-slate-800/90 shadow-xl`

### 1.2 Center Navigation Tabs Pill
* **Component / Element:** Main Navigation Card (`header > nav`)
* **Role:** Switches views between the 3D Map Nowcaster, Action Plan Modal, CSV Uploader, and Methodological Dossier.
* **Sub-elements:**
  * Tab 1: `3D Map & Nowcast` (Button + `Activity` icon)
  * Tab 2: `Charts & Action Plan` (Button + `BarChart3` icon)
  * Tab 3: `Your City CSV` (Button + `UploadCloud` icon)
  * Tab 4: `Method & Data` (Button + `FileText` icon)
* **Styling Tokens:**
  * **Container:** `bg-[#FFFDF9]/95 border-[#E7E1D6]` (Light) / `dark:bg-slate-900/90 dark:border-slate-800` (Dark)
  * **Active Tab:** `bg-stone-900 text-white` (Light) / `dark:bg-white dark:text-slate-900` (Dark)
  * **Inactive Tab:** `text-stone-700 hover:bg-[#F4EFE6]` (Light) / `dark:text-slate-300 dark:hover:bg-slate-800/60` (Dark)

### 1.3 Right Utility & Engine Status Pill
* **Component / Element:** System Controls Card (`header > div:last-child`)
* **Sub-elements:**
  * API Health Indicator (`FastAPI Live` with emerald pulse or `Local Engine`)
  * HUD Visibility Toggle (`Hide Cards` / `Show Cards` with `Eye`/`EyeOff` icon)
  * Theme Switcher (`Moon` / `Sun` icon for Light vs Dark mode)
* **Styling Tokens:**
  * **Container:** `bg-[#FFFDF9]/95 border-[#E7E1D6]` (Light) / `dark:bg-slate-900/90 dark:border-slate-800` (Dark)
  * **Button Insets:** `bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-800` (Light) / `dark:bg-slate-800 text-slate-200` (Dark)

---

## 2. Left HUD: Scenario Simulation Cards (`CaseEstimateView.tsx`)

**File:** [`app/frontend/src/components/CaseEstimateView.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/CaseEstimateView.tsx)  
**Layout Position:** Fixed left overlay (`fixed top-20 left-4 z-20 w-80 lg:w-96`)

### 2.1 Scenario Controls & Disease Switcher Card
* **Component / Element:** `Left HUD Container > Card 1`
* **Role:** Interactive scenario cockpit allowing the user to select the targeted disease, target month, rainfall intensity, and reporting weeks.
* **Sub-elements:**
  * **Disease Selector Segment:** Dual-switch toggle (`Dengue (QC)` vs `Leptospirosis (Manila)`)
    * Dengue Active: Rose badge (`bg-rose-600 text-white`)
    * Lepto Active: Teal badge (`bg-teal-700 text-white`)
  * **Target Month Grid:** 12 monthly chips (`Jan` through `Dec`)
    * Active Month Chip: High-contrast stone pill `bg-stone-900 text-white` (Light) / `dark:bg-white dark:text-slate-900` (Dark)
    * Inactive Month Chip: Warm beige inset `bg-[#F4EFE6] text-stone-700` (Light) / `dark:bg-slate-800/60` (Dark)
  * **Rainfall Scenario Slider:** Dual-number readout (actual mm & percent difference vs historical average) with disease-accented slider track.
  * **Previous Month Rainfall Slider:** (Displayed when Leptospirosis is active to capture hydrological accumulation lag).
  * **Surveillance Window Selector:** Segmented toggle for 4 vs 5 reporting weeks in the target month.
* **Styling Tokens:**
  * **Outer Card:** `bg-[#FFFDF9]/95 backdrop-blur-xl border border-[#E7E1D6] shadow-xl` (Light) / `dark:bg-slate-900/90 dark:border-slate-800` (Dark)
  * **Inner Insets:** `bg-[#F4EFE6] border-[#E7E1D6]` (Light) / `dark:bg-slate-800/60 dark:border-slate-700/50` (Dark)
  * **Typography:** `text-stone-900` headings, `text-stone-600` labels, `font-mono` values.

### 2.2 Municipal Scope & City Inspection Card
* **Component / Element:** `Left HUD Container > Card 2`
* **Role:** Shows the active municipal model coverage, or displays contextual guidance when the user clicks any of the 15 unmodeled NCR cities in the 3D map.
* **Sub-elements:**
  * Mode A: Modeled Cities Quick Switch (`Quezon City` for Dengue, `City of Manila` for Leptospirosis).
  * Mode B: Unmodeled City Detail Card (Triggered by clicking e.g. Taguig, Makati, Pasig, etc.):
    * City Name & Census Population badge
    * Model coverage disclaimer banner ("Surveillance panel not yet ingested")
    * Call-to-action button: `Upload City CSV` to calibrate DALOY for that LGU
* **Styling Tokens:**
  * **Card Container:** `bg-[#FFFDF9]/95 border-[#E7E1D6]` (Light) / `dark:bg-slate-900/90 dark:border-slate-800` (Dark)
  * **Action Button:** `bg-stone-900 text-white` (Light) / `dark:bg-teal-500 dark:text-slate-950` (Dark)

---

## 3. Right HUD: Real-Time Intelligence & KPI Cards (`CaseEstimateView.tsx`)

**File:** [`app/frontend/src/components/CaseEstimateView.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/CaseEstimateView.tsx)  
**Layout Position:** Fixed right overlay (`fixed top-20 right-4 z-20 w-80 lg:w-96`)

### 3.1 Primary Nowcast KPI Card
* **Component / Element:** `Right HUD Container > Card 1`
* **Role:** Central outbreak prediction display with confidence intervals and alert status.
* **Sub-elements:**
  * City & Target Horizon Title (e.g. `Quezon City · August Nowcast`)
  * **Expected Monthly Case Hero Number:** Large monospace headline (e.g. `286 cases`)
  * **95% Confidence Interval Chip:** Statistical bounds (e.g. `245 – 332 cases (95% CI)`)
  * **Baseline Comparison Delta:** Trend badge comparing prediction against the 15-year historical average (e.g. `+18.4% vs Baseline`)
  * **Outbreak Severity Alert Banner:**
    * `Normal / Low Risk` (Emerald)
    * `Elevated Transmission` (Amber)
    * `Severe Outbreak Warning` (Rose/Red)
* **Styling Tokens:**
  * **Outer Card:** `bg-[#FFFDF9]/95 border-[#E7E1D6] shadow-xl` (Light) / `dark:bg-slate-900/90 dark:border-slate-800` (Dark)
  * **Stat Inset Box:** `bg-[#F4EFE6] border-[#E7E1D6]` (Light) / `dark:bg-slate-800/60 dark:border-slate-700/60` (Dark)
  * **Hero Number:** `text-stone-900` (Light) / `dark:text-white` (Dark)

### 3.2 Analogous Historical Month ("Twin Scenario") Card
* **Component / Element:** `Right HUD Container > Card 2`
* **Role:** Locates the closest matching historical meteorological month in the DOH historical panel to provide grounding and empirical context.
* **Sub-elements:**
  * Twin Month Title (e.g. `Nearest Historical Twin: August 2018`)
  * Twin Scenario Metrics (Historical rainfall in mm vs recorded cases)
  * Similarity Delta tag (`Within ±4% of simulated precipitation`)
* **Styling Tokens:**
  * `bg-[#FFFDF9]/95 border-[#E7E1D6]` with inner tray `bg-[#F4EFE6]` (Light)

### 3.3 Historical Relative Intensity Bar Card
* **Component / Element:** `Right HUD Container > Card 3`
* **Role:** Progress meter contextualizing the current nowcast against the historical all-time peak outbreak record.
* **Sub-elements:**
  * Relative Intensity Percent (e.g. `38% of Historical Record Peak`)
  * Progress Bar Track with disease-specific gradient fill
  * Baseline Reference Annotations (Median vs Record High)
* **Styling Tokens:**
  * Track: `bg-[#E5DFD4]` (Light) / `dark:bg-slate-800` (Dark)
  * Fill: `bg-rose-500` (Dengue) or `bg-teal-600` (Lepto)

### 3.4 Executive Action Plan Trigger Button
* **Component / Element:** `Right HUD Container > Bottom Action Button`
* **Role:** Launches the detailed Analytics & Clinical Action Plan Modal.
* **Styling Tokens:**
  * `bg-stone-900 hover:bg-stone-800 text-white shadow-lg` (Light)
  * `dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 shadow-teal-500/20` (Dark)

---

## 4. 3D Map Viewport Dock & Tooltip (`Philippines3DMap.tsx`)

**File:** [`app/frontend/src/components/Philippines3DMap.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/Philippines3DMap.tsx)  
**Layout Position:** Fixed bottom center overlay (`fixed bottom-4 left-1/2 -translate-x-1/2 z-20`)

### 4.1 Camera Preset Dock Card
* **Component / Element:** Floating Bottom HUD Dock
* **Role:** Quick camera orbit controls for navigating Metro Manila in 3D.
* **Sub-elements:**
  * Button 1: `Metro Manila` (Wide 45° angle bird's-eye view)
  * Button 2: `Quezon City` (Focused high-tilt zoom on QC plate)
  * Button 3: `Manila City` (Focused zoom on Manila & Pasig River mouth)
  * Button 4: `Reset Orbit` (Default perspective camera orientation)
* **Styling Tokens:**
  * **Card Container:** `bg-[#FFFDF9]/95 backdrop-blur-xl border border-[#E7E1D6] shadow-2xl rounded-2xl` (Light)
  * **Dark Mode:** `dark:bg-slate-900/90 dark:border-slate-800 text-white`
  * **Button States:** `hover:bg-[#F4EFE6] text-stone-700 hover:text-stone-900` (Light)

### 4.2 Interactive 3D Hover Tooltip
* **Component / Element:** Direct-DOM Floating Overlay Element
* **Role:** Follows the user's cursor when hovering over any of the 17 NCR city polygon plates in the 3D WebGL canvas.
* **Sub-elements:**
  * City Name Headline (e.g. `Quezon City`, `City of Manila`, `Pasig`)
  * Model Status Pill (`Modeled · Dengue Nowcast` vs `Out of Scope · Inactive`)
  * Current Expected Cases or Click-to-Inspect hint
* **Styling Tokens:**
  * **Tooltip Shell:** `bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-xl` (Light)
  * **Dark Mode:** `dark:bg-slate-900/95 text-white dark:border-slate-700`

---

## 5. Flood Vulnerability Assessment Card (`FloodZonesCard.tsx`)

**File:** [`app/frontend/src/components/FloodZonesCard.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/FloodZonesCard.tsx)  
**Export:** `export const FloodZonesCard: React.FC<FloodZonesCardProps>`  
**Layout Position:** Embedded inside the Executive Action Plan Modal & City Views.

### 5.1 Card Structure & Sub-elements
* **Header Section:**
  * Title: `Flood-Vulnerable Areas · {city}` with `Waves` icon
  * Subtitle: Drainage choke points and low-lying basins
  * Provenance Tag: `UP NOAH / MGB`
* **Zone Items List:** Individual cards for each recognized flood basin:
  * Zone Name (e.g. `San Juan River Basin Corridor`, `Tullahan River Lowlands`)
  * Drainage description and pooling characteristics
  * Risk Badge (`High Risk` in Rose, `Medium Risk` in Amber, `Low Risk` in Emerald)
* **Bioclimatic Exposure Callout:**
  * Footer notification box explaining how standing pools create breeding sites for *Aedes aegypti* and floodwaters harboring pathogenic *Leptospira*.
* **Styling Tokens:**
  * **Card Container:** `bg-[#FFFDF9] dark:bg-slate-900 border border-[#E7E1D6] dark:border-slate-800 shadow-sm`
  * **Zone Row Insets:** `bg-[#F4EFE6] dark:bg-slate-800/60 border border-[#E7E1D6] dark:border-slate-800 text-stone-900 dark:text-white`
  * **Callout Box:** `bg-[#F4EFE6] dark:bg-teal-950/30 border border-[#E7E1D6] dark:border-teal-900/40 text-stone-700 dark:text-slate-400`

---

## 6. Executive Analytics & Clinical Action Plan Modal (`CaseEstimateView.tsx`)

**File:** [`app/frontend/src/components/CaseEstimateView.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/CaseEstimateView.tsx)  
**Layout Position:** Fixed full-screen modal scrim (`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-md`)

### 6.1 Modal Shell Card
* **Component / Element:** `div.max-w-6xl.bg-[#FFFDF9]`
* **Sub-elements:**
  * Header Bar: Disease badge, City name, Horizon, and Close button (`X` icon).

### 6.2 Inner Card 1: Poisson Regression Mathematical Decomposition
* **Sub-elements:**
  * Mathematical formulation display: $\log E[y] = \beta_0 + \beta_1 \cdot \text{Rainfall}$
  * Feature weights table & coefficients ($\beta$ values, standard error, p-value)
  * Log-transformed rainfall factor breakdown
* **Styling Tokens:** `bg-[#F4EFE6] dark:bg-slate-800/60 border-[#E7E1D6] dark:border-slate-800`

### 6.3 Inner Card 2: Historical Analogues Comparison Card
* **Sub-elements:**
  * Ranked list of historical months sharing identical rainfall bounds
  * Actual reported clinical cases vs model back-test predictions
* **Styling Tokens:** `bg-[#F4EFE6] dark:bg-slate-800/60 border-[#E7E1D6]`

### 6.4 Inner Card 3: DOH / NKTI Clinical Directives & Action Plan
* **Sub-elements:**
  * **Dengue Protocol:** Larvicide scheduling, NS1 antigen stocking, vector fogging alerts.
  * **Leptospirosis Protocol:** Post-exposure Doxycycline prophylaxis distribution, dialysis readiness (NKTI directives), flood barrier closures.
  * Interactive action checklist with status checkboxes.
* **Styling Tokens:**
  * Directive Boxes: `bg-[#F4EFE6] dark:bg-slate-800/60 border-[#E7E1D6]`
  * Checkbox Items: `text-stone-800 dark:text-slate-200`

---

## 7. Local LGU Surveillance Upload View (`UploadCityView.tsx`)

**File:** [`app/frontend/src/components/UploadCityView.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/UploadCityView.tsx)  
**Export:** `export const UploadCityView: React.FC<UploadCityViewProps>`  
**Layout Position:** Modal Dialog or Main View (`fixed inset-0 z-30 pt-20 pb-16`)

### 7.1 Header & Disease Schema Selector Card
* **Sub-elements:**
  * Title: `Upload Your City Surveillance Data` with `Experimental Feature` pill
  * Description: Explaining LOYO cross-validation and format requirements
  * Format Switcher: `Dengue Format` (Rose) vs `Lepto Format` (Teal)
* **Styling Tokens:** `bg-[#FFFDF9] dark:bg-slate-900 border-[#E7E1D6]`

### 7.2 Schema Specification & Template Download Card (Left Col)
* **Sub-elements:**
  * Required column tags (`YR`, `MN`, `DC_QC`, `RF_NASA`, `n_weeks`)
  * Validation rules notice (minimum 24 monthly records)
  * Actions: `Download Template` (CSV blob) & `Copy Sample` (clipboard)
* **Styling Tokens:** `bg-[#FFFDF9] dark:bg-slate-900 border-[#E7E1D6]` with code badges `bg-[#F4EFE6]`

### 7.3 Drag-and-Drop CSV Upload Zone Card (Right Col)
* **Sub-elements:**
  * Drag & drop dropzone with hidden file input
  * Upload icon in soft beige pill `bg-[#EBE4D8]`
  * File name readout and validation loader (`RefreshCw` spinner)
* **Styling Tokens:** `bg-[#F4EFE6]/60 border-2 border-dashed border-[#DBD4C8] hover:border-stone-500`

### 7.4 Live Validation Results & Correlation Summary Card
* **Sub-elements:**
  * Validation Status Banner (`Valid` with green checkmark vs `Errors` with rose alert)
  * Metric Tile 1: Spearman Rank Correlation ($\rho$) between rain and cases
  * Metric Tile 2: Mean Monthly Rainfall baseline
  * Metric Tile 3: Total Cases parsed across dataset
  * **5-Row Interactive CSV Preview Table:** With warm stone borders and alternating rows
* **Styling Tokens:**
  * Card: `bg-[#FFFDF9] border-[#E7E1D6]`
  * Metric Tiles: `bg-[#F4EFE6] border-[#E7E1D6]`
  * Preview Table: `border-[#E7E1D6] divide-[#E7E1D6]` with header `bg-[#F4EFE6]`

---

## 8. Scientific Pipeline & Governance View (`MethodView.tsx`)

**File:** [`app/frontend/src/components/MethodView.tsx`](file:///c:/Users/Justine%20Ivanne/Desktop/pjdsc/pjdsc-app/app/frontend/src/components/MethodView.tsx)  
**Export:** `export const MethodView: React.FC`  
**Layout Position:** Modal Dialog or Main View (`fixed inset-0 z-30 pt-20 pb-16`)

### 8.1 4-Stage Methodological Pipeline Card
* **Role:** High-level architectural walkthrough of data collection, feature harmonization, model estimation, and out-of-sample validation.
* **Sub-elements (4 Inner Cards):**
  * `Step 1 · Collect`: NASA POWER + DOH surveillance ingestion (Slate/Stone pill)
  * `Step 2 · Harmonize`: Log transformations, 1-month lags, circular harmonics (Sky pill)
  * `Step 3 · Model`: Poisson regression with L2 regularization (Rose pill)
  * `Step 4 · Validate`: Leave-One-Year-Out cross-validation (Emerald pill)
* **Styling Tokens:**
  * Container: `bg-[#FFFDF9] dark:bg-slate-900 border-[#E7E1D6]`
  * 4 Step Tiles: `bg-[#F4EFE6] dark:bg-slate-800/60 border-[#E7E1D6] dark:border-slate-800`

### 8.2 Model Specifications & Parameters Table Card
* **Role:** Full empirical parameters table comparing Dengue (Quezon City) vs Leptospirosis (City of Manila).
* **Sub-elements:**
  * Comparison Table: Horizons, Algorithms, Meteorological Drivers, and LOYO-CV folds
* **Styling Tokens:**
  * Card: `bg-[#FFFDF9] border-[#E7E1D6]`
  * Thead: `bg-[#F4EFE6] text-stone-700`
  * Rows: `divide-[#E7E1D6] hover:bg-[#F9F6F0]`

### 8.3 Assumptions, Limitations & Academic Citations Cards (Bottom Dual Cards)
* **Sub-elements:**
  * Card 1: `Assumptions and Limitations` (Surveillance lag, non-transferability, extreme flood outliers)
  * Card 2: `Key Academic & Clinical Citations` (DOH Surveillance Bulletins, NKTI Directives, NASA POWER API)
* **Styling Tokens:**
  * Cards: `bg-[#FFFDF9] dark:bg-slate-900 border-[#E7E1D6]`
  * Text: `text-stone-600 dark:text-slate-400`

---

## Summary of Design Tokens Applied Across All Cards

```
Light Mode (Warm White & Soft Beige):
  - Primary Surface:   bg-[#FFFDF9] / bg-[#FFFDF9]/95
  - Insets / Subcards: bg-[#F4EFE6]
  - Card Borders:      border-[#E7E1D6]
  - Primary Headings:  text-stone-900 (#1C1917)
  - Secondary Labels:  text-stone-600 (#57534E)
  - Hover States:      hover:bg-[#EAE3D6] or hover:bg-[#F9F6F0]
  - Shadow:            shadow-xl / shadow-2xl

Dark Mode (Command Center / Radar):
  - Primary Surface:   dark:bg-slate-900 / dark:bg-slate-900/90
  - Insets / Subcards: dark:bg-slate-800/60
  - Card Borders:      dark:border-slate-800
  - Primary Headings:  text-white / text-slate-100
  - Secondary Labels:  dark:text-slate-400
  - Accents:           dark:text-teal-400 (Lepto) / dark:text-rose-400 (Dengue)
```
