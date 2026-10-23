# STATUS (last updated: 2026-10-23)

> Update **only your own section**. See `AGENTS.md`.

## Overall
- Phase: models done per the proposal methodology (monthly Poisson models, Manila leptospirosis + Quezon City dengue). App features finalized at the 2026-10-23 meeting (see `docs/UI_SPEC.md`). Remaining: code in repo, app, slides, demo video.
- Source of truth: proposal doc, NEW PROPOSAL tab. Fully aligned with its METHODOLOGY on 2026-10-23; repo docs synced after. NEW METHODOLOGY tab = team's reference copy.
- Deadline: Oct 24, 2026 (confirmed). Team target: finish by Oct 23, 2026.
- MVP plan and feature priorities: see `docs/PROJECT_BRIEF.md`. Lessons from past finalists: `docs/FINALISTS_INSIGHTS.md`.

## Team roles
No team captain.

| Area | Who |
|---|---|
| UI, demo | Ivanne, Diego |
| Code, model | JD, JP, Paul |
| Slides | Paul |
| Proposal | All |

## Ivanne (UI, demo, proposal)
- Done: Built interactive HTML/CSS/JS web app prototype **`DALOY`** (`app/daloy-ui/index.html`, `styles.css`, `app.js`) implementing all finalized 2026-10-23 features (QC Dengue & Manila Leptospirosis monthly case prediction, most similar past month lookup, city flood-vulnerable areas view, experimental multi-city CSV uploader + live validator, and methodology/LOYO-CV transparency view).
- Done: Migrated **`DALOY`** to a modern production stack in `app/frontend/` (React + Vite + Tailwind CSS + Three.js) and `app/backend/` (FastAPI + Uvicorn) featuring an interactive 3D Philippine archipelago map with real-time monsoon rainfall particle simulation, interactive city beacons (Quezon City & Manila), dual-mode API/offline client fallback, and all finalized prediction/upload/methodology views.
- Done: Verified official PJDSC 2026 Primer/FAQ rules and found exact APA 7th citations for the DOH Sept 2025 leptospirosis figures and NKTI Aug 2025 ward story hook (documented in `docs/PROPOSAL_HANDOFF.md`).
- Next: Wire final trained model coefficients / LOYO-CV metrics from JD/JP/Paul and UP NOAH/MGB flood susceptibility layer into the FastAPI backend and React frontend.

## Diego (UI, demo, proposal)
- Doing: UI design (spec now in docs/UI_SPEC.md).

## JD (code, model, proposal)
- Next: build weekly province dengue panel (HDX 2016–2020) + NASA POWER weather.

## JP (code, model, proposal)
- Next: build weekly province dengue panel (HDX 2016–2020) + NASA POWER weather.

## Paul (code, model, slides, proposal)
- Done: shared repo + AI context files; past-finalists review (`docs/FINALISTS_INSIGHTS.md`); NEW PROPOSAL tab aligned with its methodology and repo docs re-synced (2026-10-23).
- Done (branch `feat/action-summary`, 2026-10-24): "View Summary" pop-up in the action plan (`app/frontend/src/components/ActionSummaryReport.tsx`). It's a one-glance brief: a headline sentence with predicted cases, a one-line verdict by risk level, one line per deadline (48 h / 72 h / 14 days) with the action, target and lead unit, the high-risk hotspots and the month with the most similar rainfall. The full action table sits behind a toggle. It has Print / Save as PDF and Copy Brief buttons, and its checkboxes stay in sync with the readiness checklist.
- Next: slides, using the patterns in `docs/FINALISTS_INSIGHTS.md`.
- Next: confirm external-data rule / deliverables on official FAQ.

## Blockers
- **No model or app code in the repo yet.** Needed for the code-repository criterion.
- JD, JP, Ivanne and Diego: your sections below the team table still describe the old plan (HDX province panel, province map). Please update them.
- External-data rule, deliverable format and judging criteria unverified.

## Open items
- [x] Paste the Google Docs UI tab into `docs/UI_SPEC.md`.
- [x] Confirm deadline (Oct 24, 2026; target Oct 23).
- [x] Align the proposal's Executive Summary, Objectives, Scope, Appendices and References with its Methodology (2026-10-23).
- [x] Fill the Methodology placeholders `[citation]`, `[end year]`, `[confirm]` (2026-10-23).
- [ ] Choose the week convention and replace `[ISO / epidemiological]` in the proposal.
- [ ] Find citations for the DOH 2025 leptospirosis figures and the NKTI ward (proposal says "Citation TBD").
- [x] Finalize app features (2026-10-23 meeting).
- [ ] Decide the prediction inputs (rainfall only, or rainfall + month).
- [ ] Decide how "most similar past month" is computed.
- [ ] Pick the flood data source and area unit for flood-vulnerable areas (candidates in `docs/DATA_MODEL.md`).
- [ ] Decide what the app does with an uploaded CSV (retrain vs. apply our models), and the upload validation rules.
- [ ] Confirm whether action cards and the what-if slider stay (not in the finalized list).
- [ ] Add the finalized features to the proposal (Executive Summary, 5th Objective).
- [ ] Add the final CV results to `docs/DATA_MODEL.md`.
- [ ] Commit model code + `requirements.txt` + README run steps.
- [ ] Decide the dengue framing: nowcast (same-month rain) or add previous-month rain for lead time.
- [ ] Confirm external-data rule and deliverable format on the official PJDSC FAQ/primer.
- [ ] Resolve UI vs. data-model conflicts listed in `docs/UI_SPEC.md`.
- [ ] Decide the app name (placeholder: `<project-name>`).
