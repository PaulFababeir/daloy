# LINKS

> Every link the team uses, in one place. When you find or create a new one, add it here.
> **Status:** ✅ = confirmed by the team or opened and checked · ⚠️ = official homepage added without checking it, so verify before citing · `TBD` = link not known yet.

## 1. Deliverables and working documents (top priority)

| What | Link | Status | Notes |
|---|---|---|---|
| **Proposal doc (Google Docs)** | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit | ✅ | `PJDSC26_anthropos_Proposal`. The current proposal is in the **NEW PROPOSAL** tab. |
| ↳ NEW PROPOSAL tab (current) | https://docs.google.com/document/d/14dmCKVEz5Pxl2Q-4OKlkQb8PaN98TtjX07P7dHUOpLg/edit?tab=t.lyzugvixxmz4 | ✅ | Dengue + leptospirosis proposal. Has open `TBD` references. |
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
| PJDSC 2026 dataset catalogue | https://pjdsc26-website.vercel.app/catalogue | ✅ | Official catalogue. The dengue data (HDX) is listed here. |
| PJDSC 2026 FAQ / primer | TBD | TBD | Needed to confirm the external-data rule, deliverable format and judging criteria. |
| Submission page | TBD | TBD | Deadline Oct 24, 2026; team target Oct 23. |
| UP DSSoc PJDSC-Datasets GitHub | TBD | TBD | Linked from the catalogue. |

## 3. Datasets

Details on each dataset (columns, coverage, caveats) are in `docs/DATA_MODEL.md`.

| Dataset | Link | Status | Used for |
|---|---|---|---|
| HDX: Philippine Dengue Cases and Deaths (DOH Epidemiology Bureau) | https://data.humdata.org/dataset/philippine-dengue-cases-and-deaths | ✅ | Main dengue forecaster (province level) |
| Zenodo: Weekly Dengue Incidence Linked to Meteorological Variables | https://zenodo.org/records/21978184 | ✅ | Quezon City city-level example |
| Mendeley: Philippine Epidemiological Data | https://data.mendeley.com/datasets/v98325dpxv/1 | ✅ | National leptospirosis cases (trigger check) |
| NASA POWER API | https://power.larc.nasa.gov/ | ✅ | Daily weather at province centroids |
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
| LightGBM docs | https://lightgbm.readthedocs.io/ | ⚠️ |
| SHAP docs | https://shap.readthedocs.io/ | ⚠️ |
| statsmodels docs | https://www.statsmodels.org/ | ⚠️ |
| GeoPandas docs | https://geopandas.org/ | ⚠️ |
| folium docs | https://python-visualization.github.io/folium/ | ⚠️ |
| Plotly (Python) docs | https://plotly.com/python/ | ⚠️ |
| APA 7th edition reference guide | TBD | TBD |
