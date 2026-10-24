# Data

All data in this repo is open and already aggregated to months. Nothing here identifies a patient.

## Where it comes from

| Data | Source | Coverage | Licence |
|---|---|---|---|
| Leptospirosis cases, Manila | EIDC hydro-epidemiological leptospirosis dataset (De Stercke et al., 2023), listed on [data.gov.uk](https://www.data.gov.uk/dataset/2878048f-e13f-415c-87dc-c5137d9a3062/) | weekly, 2001–2012 | Open Government Licence v3.0 |
| Rainfall, Manila | [NASA POWER](https://power.larc.nasa.gov/), daily `PRECTOTCORR` at 14.5995°N, 120.9842°E | daily | public NASA data; cite as below |
| Dengue cases and rainfall, Quezon City | UPRI-NOAH dengue-rainfall dataset, QC sheet ([GitHub](https://github.com/UPRI-NOAH/dengue-rainfall-dataset), [Zenodo](https://doi.org/10.5281/zenodo.21978184); Pelitro et al., 2026) | weekly, 2010–2025 | CC BY 4.0 (Zenodo) |

Full APA references are at the bottom of the [README](../README.md#sources).

## Files the app uses

These are the monthly panels the models train on. They were built from the sources above as described in [METHODOLOGY.md](METHODOLOGY.md#why-monthly).

**`app/backend/dataset/leptos/manila_lepto_monthly.csv`** (144 months)

| Column | Meaning |
|---|---|
| `month` | first day of the month, `YYYY-MM-DD` |
| `lepto` | leptospirosis cases that month |
| `rain_total_mm` | total rainfall that month, mm |
| `n_weeks` | number of case weeks assigned to the month (4 or 5) |

**`app/backend/dataset/dengue/qc_dengue_monthly.csv`** (192 months)

| Column | Meaning |
|---|---|
| `YR`, `MN` | year and month number (1–12) |
| `DC_QC` | dengue cases that month (confirmed + probable). The name comes from the source dataset, where `QC` means Quezon City. |
| `RF_NASA` | total rainfall that month, mm (NASA GPM IMERG, one grid cell at the QC centroid) |
| `n_weeks` | number of case weeks assigned to the month |

## Uploading your own city

The experimental upload accepts either format above, as a CSV with exactly these column names:

```csv
month,lepto,rain_total_mm,n_weeks
2001-01-01,6,79.67,5
```

```csv
YR,MN,DC_QC,RF_NASA,n_weeks
2010,1,110,39.53,4
```

Keep `DC_QC` and `RF_NASA` as column names even if your city isn't Quezon City or your rainfall isn't from NASA. The upload needs at least 24 monthly rows (two full years) so cross-validation can run. Rows with non-numeric rainfall or case values are skipped, and both those and any negative values are listed back to you as errors.

Uploaded files are saved to `app/backend/temp_uploads/`, which is ignored by git (except one example file the backend tests with).

## Sample files

`sample_datasets/` has files you can upload to try the feature:

- `manila_leptospirosis_2001-2003.csv` and `quezon_city_dengue_2010-2013.csv` are short slices of the real training data above.
- `makati_*`, `manila_dengue.csv` and `quezon_city_leptospirosis.csv` are made-up demo data in the right format. They are not real surveillance records.

## Other data in the app

- **Metro Manila boundaries** for the 3D map are bundled in `app/frontend/src/components/metroManilaData.ts` and `ncrBarangayGeoData.ts`.
- **Flood-prone barangays and health facilities** are hand-picked lists in `app/backend/prediction_engine.py` (`get_flood_zones`, `get_health_facilities`), based on publicly reported flood areas and referral hospitals. They are not derived from flood hazard maps yet.
