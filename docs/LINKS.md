# LINKS

> Every link the team uses, in one place. When you find or create a new one, add it here.
> **Status:** ✅ = confirmed by the team or opened and checked · ⚠️ = official homepage added without checking it, so verify before citing · `TBD` = link not known yet.

## 1. Deliverables and working documents (top priority)

| What | Link | Status | Notes |
|---|---|---|---|
| **Proposal doc (Google Docs)** | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit | ✅ | `PJDSC26_anthropos_Proposal`. The current proposal is in the **NEW PROPOSAL** tab. |
| ↳ NEW PROPOSAL tab (current) | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.lyzugvixxmz4 | ✅ | **Source of truth.** Its METHODOLOGY section drives `docs/DATA_MODEL.md`. Other sections still need aligning (see `docs/PROJECT_BRIEF.md`). |
| ↳ COPY_OF_OLD_METHODOLOGY tab | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.rg158er3tz2b | ✅ | The earlier weekly/province methodology, kept for reference. Superseded. |
| ↳ OFFICIAL TEMPLATE tab (old proposal) | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.vinjlfs8xbmc | ✅ | The earlier diabetes/heart disease proposal. Use it as the formatting template only. |
| ↳ Ivanne Draft tab | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.27wgwz57ypoi | ✅ | Empty as of 2026-10-20. |
| ↳ Tab 3 | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.dhz4zusrodhh | ✅ | Feature notes (heatmap). |
| UI layout tab (Google Docs, retired) | TBD | TBD | Content moved to `docs/UI_SPEC.md`. Should be read-only. |
| Slides (Paul) | TBD | TBD | |
| Demo video (Ivanne, Diego) | TBD | TBD | |
| GitHub repo | https://github.com/PaulFababeir/pjdsc-app | ✅ | Single source of truth for all AI context files. |
| Deployed app (Streamlit) | TBD | TBD | |

## 2. Competition

| What | Link | Status | Notes |
|---|---|---|---|
| PJDSC 2026 dataset catalogue | https://pjdsc26-website.vercel.app/catalogue | ✅ | Official catalogue. HDX dengue data is listed here (not used in the current methodology). |
| PJDSC 2026 FAQ / primer | TBD | TBD | Needed to confirm the external-data rule, deliverable format and judging criteria. |
| Submission page | TBD | TBD | Deadline Oct 24, 2026; team target Oct 23. |
| UP DSSoc PJDSC-Datasets GitHub (past finalists' slides, code, catalogs) | https://github.com/up-dssoc-org/PJDSC-Datasets | ✅ | Summary of what finalists did: `docs/FINALISTS_INSIGHTS.md`. Code zips use Git LFS. |
| ↳ 2025 finalists (climate theme) | https://github.com/up-dssoc-org/PJDSC-Datasets/tree/main/2025 | ✅ | Champion 2Ls (drAIn), Knight to D4 (AGOS), link.od (AGIP). Slides, demo videos, code. |
| ↳ 2024 finalists (urban mobility) | https://github.com/up-dssoc-org/PJDSC-Datasets/tree/main/2024 | ✅ | Champion CCLEX (Lakbai), Hippothesis (Padyak). |
| ↳ 2025 dataset catalog | https://github.com/up-dssoc-org/PJDSC-Datasets/blob/main/2025/Datasets/datasets_list.md | ✅ | Lists Project CCHAIN, PAGASA CliMap, tropical cyclone tracks, LiPAD. |

## 3. Datasets

Details on each dataset (columns, coverage, caveats) are in `docs/DATA_MODEL.md`.

### In the current methodology

| Dataset | Link | Status | Used for |
|---|---|---|---|
| UPRI-NOAH dengue-rainfall dataset (GitHub), file `Dengue_Environmental Vars_Dataset.xlsx` | https://github.com/UPRI-NOAH/dengue-rainfall-dataset | ✅ | **Dengue model:** Quezon City sheet (`YR`, `WN`, `DC_QC`, `RF_NASA`), 2010–2025 |
| ↳ Same dataset on Zenodo (cite this one), v1.1.0 | https://doi.org/10.5281/zenodo.21978184 | ✅ | APA entry in `docs/DATA_MODEL.md` (Pelitro et al., 2026) |
| EIDC hydro-epidemiological leptospirosis dataset (data.gov.uk listing) | https://www.data.gov.uk/dataset/2878048f-e13f-415c-87dc-c5137d9a3062/ | ✅ | **Leptospirosis model:** Manila weekly cases, 2001–2012 |
| ↳ Same dataset, DOI (cite this one) | https://doi.org/10.5285/56f42170-3678-4586-b8c8-9b05f03125e1 | ✅ | APA entry in `docs/DATA_MODEL.md` (De Stercke et al., 2023). Open Government Licence v3.0. |
| NASA POWER API | https://power.larc.nasa.gov/ | ✅ | Leptospirosis model: daily rainfall at Manila (14.5995°N, 120.9842°E) |

### Not used now (earlier plan, or candidates for scaling up)

| Dataset | Link | Status | Notes |
|---|---|---|---|
| UPRI-NOAH workbook, Regional sheet | https://github.com/UPRI-NOAH/dengue-rainfall-dataset | ✅ | 17 regions, weekly, 2016–2025 excl. 2020–2021. Could feed a regional map. |
| Project CCHAIN (barangay-level health + climate, 12 cities, 2003–2022) | https://thinkingmachines.github.io/project-cchain/ | ✅ | From the PJDSC 2025 catalog. Which diseases it covers is unverified. Full data needs a request form. |
| HDX: Philippine Dengue Cases and Deaths (DOH Epidemiology Bureau) | https://data.humdata.org/dataset/philippine-dengue-cases-and-deaths | ✅ | Earlier plan (province level). Still in the proposal's References; remove if unused. |
| Mendeley: Philippine Epidemiological Data | https://data.mendeley.com/datasets/v98325dpxv/1 | ✅ | Earlier plan (national leptospirosis). Still in the proposal's References; remove if unused. |
| OpenDengue v1.2 | https://opendengue.org/ | ⚠️ | Optional longer dengue history |
| Project Tycho (PH 1955–2010) | https://www.tycho.pitt.edu/ | ⚠️ | Optional historical data |
| HDX admin boundaries (Philippines) | https://data.humdata.org/ | ⚠️ | Province shapes for the map. Exact dataset page TBD. |
| PSA (census / population) | https://psa.gov.ph/ | ⚠️ | Population for rates and the vulnerability index |
| UP NOAH flood-hazard maps | https://noah.up.edu.ph/ | ⚠️ | Flood layer. Access unverified. |
| ERA5 / ERA5-Land (Copernicus) | https://cds.climate.copernicus.eu/ | ⚠️ | Alternative weather source |
| CHIRPS rainfall | https://www.chc.ucsb.edu/data/chirps | ⚠️ | Alternative rainfall source |
| GPM IMERG rainfall | https://gpm.nasa.gov/data/imerg | ⚠️ | Alternative rainfall source |
| data.gov.ph | https://data.gov.ph/ | ⚠️ | Linked from the catalogue |
| WHO Global Health Observatory | https://www.who.int/data/gho | ⚠️ | Linked from the catalogue |
| UNICEF Data | https://data.unicef.org/ | ⚠️ | Linked from the catalogue |

## 4. Research papers and evidence

APA versions are in the proposal doc's References section and in `docs/DATA_MODEL.md`.

| Source | Link | Status | Supports |
|---|---|---|---|
| Matsushita et al. (2018), PLOS NTD | https://doi.org/10.1371/journal.pntd.0006331 | ✅ | Leptospirosis risk peaks 2 weeks after heavy rain (Manila) |
| Carvajal et al. (2018), BMC Infectious Diseases | https://doi.org/10.1186/s12879-018-3066-0 | ✅ | Lagged weather + random forest best for dengue (Metro Manila) |
| DrivenData DengAI benchmark | https://drivendata.co/blog/dengue-benchmark | ✅ | Weather-only models are weak; always use a baseline |
| Sri Lanka SARIMA leptospirosis study | TBD | TBD | Univariate model beat a weather-driven one |
| DOH: 2025 leptospirosis cases (4,859 as of Sept 6, 2025) | TBD | TBD | Story hook in the proposal |
| NKTI leptospirosis ward (Aug 2025) | TBD | TBD | Story hook in the proposal |

## 5. Tools and documentation

| Tool | Link | Status |
|---|---|---|
| Streamlit docs | https://docs.streamlit.io/ | ⚠️ |
| scikit-learn docs (`PoissonRegressor`, `HistGradientBoostingRegressor`) | https://scikit-learn.org/stable/ | ⚠️ |
| LightGBM docs (earlier plan) | https://lightgbm.readthedocs.io/ | ⚠️ |
| SHAP docs (earlier plan) | https://shap.readthedocs.io/ | ⚠️ |
| statsmodels docs | https://www.statsmodels.org/ | ⚠️ |
| GeoPandas docs | https://geopandas.org/ | ⚠️ |
| folium docs | https://python-visualization.github.io/folium/ | ⚠️ |
| Plotly (Python) docs | https://plotly.com/python/ | ⚠️ |
| APA 7th edition reference guide | TBD | TBD |
