# PAST FINALISTS: WHAT THEY DID AND WHAT WE SHOULD COPY

> Source: UP DSSoc's PJDSC-Datasets repo (https://github.com/up-dssoc-org/PJDSC-Datasets), read on 2026-10-23.
> Read: slides of the 2025 champion (2Ls), both 2025 runners-up (Knight to D4, link.od) and Vibe Coders (2025); slides of 2024 first runner-up Hippothesis; source code of Knight to D4, link.od and 2024 champion CCLEX.
> Not read: demo videos (can't be watched here), the 2025 champion's 142 MB code zip, the other finalists.
> **Caveat:** the repo shows what finalists built, not how judges scored them. Treat these as patterns, not a scoring rubric. **Take ideas, never code.** Copying another team's code is a plagiarism risk.

## What the finalists did

| Team (year, placing) | Project | What stands out |
|---|---|---|
| 2Ls (2025, champion) | **drAIn**: drainage vulnerability for Mandaue City (LiDAR, land cover, PAGASA rainfall scenarios, K-means risk clusters) | One named city. One sharp claim: *"This exact drain will fail first, and here's why."* **Validated against an independent published flood-hazard map** and showed the correlation. User/admin roles with community reports. A "future vision" slide on scaling. About 10 APA references, many of them local (NDRRMC report, Mandaue studies, local news). |
| Knight to D4 (2025, 1st runner-up) | **AGOS**: relief-goods routing for Calamba City | Opens with a concrete disaster story (Yolanda relief took 7–14 days) and a citation. Method built on one named paper. **Streamlit dashboard walkthrough** in the slides. Honest **Limitations** and **Future plans** slides. README documents exact input CSV columns, run commands and runtime warnings, and ships demo CSVs and saved solutions. |
| link.od (2025, 2nd runner-up) | **AGIP**: geohazard platform for Laguna | **Separate LGU-facing and public-facing views.** Offline-first web app. **Live demonstration** in the pitch. Impact framed as "from reactive to proactive". Backend README with local run steps, `.env.example`, `requirements.txt`, LICENSE. |
| Vibe Coders (2025, finalist) | **Alerto**: class-suspension advisory for CALABARZON | Local hook (Typhoon Kristine, 42 municipalities, 500,000 students). Clear stakeholder flow (community → AI validation → mayors → governors). **Survey traction numbers** (100 respondents) and a 3-year roadmap. |
| Hippothesis (2024, 1st runner-up) | **Padyak**: walkability/bikeability index for Mandaluyong | **Consulted a domain expert** and put that on a slide. "Evaluate" and **"Simulate" (what-if)** features. **XGBoost + SHAP** for interpretation. Deployed Streamlit app with a **QR code** in the slides, plus a worked case (one street to another). |
| CCLEX (2024, champion) | **Lakbai**: pedestrian accessibility index | Fuzzy-logic index built from **expert opinion**, plus ML models. Full web app with backend, README setup steps and a deployment workflow. |

## Patterns that repeat

1. **One named place and one sharp claim.** Every finalist anchors on a specific city or region and states a one-line takeaway.
2. **A concrete local story with a citation in the first minute** (a typhoon, a disaster, a statistic).
3. **A working product shown live or walked through.** Deployed apps, QR codes, dashboard walkthroughs.
4. **Users and roles spelled out.** LGU view vs. public view; who does what with the output.
5. **What-if or simulation features** that let users change an input and see the effect.
6. **Validation against something independent** (2Ls' hazard-map correlation), or credibility from experts (Hippothesis, CCLEX).
7. **Honest limitations and a future roadmap**, each on its own slide.
8. **Reproducible repos:** README with run steps, documented input formats, sample data, dependency file.
9. **Many local, APA-formatted references.**

## Where we stand (as of 2026-10-23)

| Pattern | Us | Gap |
|---|---|---|
| Named place + sharp claim | Manila and Quezon City | Need the one-liner, e.g. "Every extra 100 mm of rain in a month means about X more dengue cases in Quezon City." |
| Local story + citation | Proposal has the 2025 leptospirosis surge and NKTI ward | Both citations still TBD |
| Working product | **No app code in the repo yet** | Biggest gap |
| Users and roles | LGU health officers | Write the LGU workflow on one slide |
| What-if | Not built | Easy: our models take rainfall as input |
| Independent validation | Leave-one-year-out CV vs. baseline | Compare our rainfall–leptospirosis pattern with Matsushita et al. (2018), same city and period |
| Limitations + roadmap | Not written | Write them (list below) |
| Reproducible repo | Docs only | README run steps, `requirements.txt`, one script or notebook per model |
| References | Two papers + both datasets in APA (fixed 2026-10-23) | Two story-hook citations still TBD; few local sources compared with 2Ls |

## Recommendations for the last day (ranked by impact for effort)

1. **Get the models into the repo and make them reproducible.** Put one notebook or script per disease in `notebooks/`, add `requirements.txt` and README run steps. Document where each dataset is downloaded (both are open, with DOIs) instead of committing raw data. This covers the "code repository" criterion, which right now we'd fail.
2. **Build a small Streamlit app with a rainfall what-if slider.** Both models take rainfall as input, so the slider is honest and easy: *"If Quezon City gets 400 mm this month, expect about N dengue cases (baseline: M)."* Add an actual-vs-predicted chart and the action cards. Deploy it on Streamlit Community Cloud and put a QR code in the slides (Hippothesis, Knight to D4).
3. **Lead with one sharp, quantified claim** from the unpenalized Poisson effect-size model (2Ls pattern).
4. **Frame both models honestly as nowcasts.** Both use the current month's rainfall, so their value is beating the 2–3 week reporting delay, not forecasting weeks ahead. The leptospirosis model's previous-month rainfall adds signal from the month before. Don't call either a 1–4 week forecast. Judges reward rigor more than overclaiming. See "Open methodology questions" in `docs/DATA_MODEL.md`.
5. **Show validation numbers on a slide:** each model vs. the baseline on MAE, RMSE and Spearman, from the leave-one-year-out CV. Add one line linking our leptospirosis results to Matsushita et al. (2018) as an independent check.
6. **Add "Limitations" and "Future work" slides.** Limitations: two cities only; monthly resolution; rainfall is the only input; leptospirosis data ends in 2012; 2020–2021 COVID distortion; week-numbering ambiguity in the dengue data. Future work: the 17-region dengue map (data already in the UPRI-NOAH workbook), barangay hotspots, rainfall forecasts as input for real lead time, SMS alerts to LGUs.
7. **One slide on users:** an LGU health officer sees the estimate, reads why, gets an action card, and exports an advisory.
8. **Expert credibility, if anyone can do it today:** a short message to a city health officer or epidemiologist, quoted with permission. Skip it if there isn't time.

## Not worth doing before the deadline

- Survey or traction numbers (Vibe Coders): no time to run a real survey.
- Full multi-role web platforms (CCLEX, link.od): Streamlit is enough for the demo.
