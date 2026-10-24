# DALOY frontend

React 19 + TypeScript, built with Vite. The 3D map uses Three.js and styling is Tailwind CSS.

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to the backend on :8000
npm run build    # production build into dist/
```

## Where things are

| File | What it is |
|---|---|
| `src/App.tsx` | top-level layout, tabs, theme switch, intro and onboarding |
| `src/services/api.ts` | all calls to the backend, plus the in-browser fallback used when the backend is down |
| `src/components/Philippines3DMap.tsx` | the 3D Metro Manila map (cities, barangays, rivers, rain, facilities) |
| `src/components/CaseEstimateView.tsx` | inputs, the case estimate, similar months, charts and the action plan |
| `src/components/ActionSummaryReport.tsx` | the printable one-page summary of the action plan |
| `src/components/ScatterChart.tsx` | rainfall vs. cases chart and the seasonal profile |
| `src/components/FloodZonesCard.tsx` | flood-prone barangays list |
| `src/components/UploadCityView.tsx` | the experimental "try your own city" upload |
| `src/components/MethodView.tsx` | the Method & Data tab |
| `src/components/metroManilaData.ts`, `ncrBarangayGeoData.ts`, `actionMapData.ts` | map geometry and facility data |

Light and dark themes share one set of components; colours and type are described in `docs/BRAND_KIT.md`.
