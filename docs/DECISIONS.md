# DECISIONS (append-only — newest at bottom)

Format: YYYY-MM-DD | who | AI model | decision | why

2026-10-19 | Fabi | Claude (claude.ai) | Pivot to dengue + leptospirosis outbreak forecasting from weather data | Fits "stop outbreaks early" pillar; dengue data in official catalogue
2026-10-19 | Fabi | Claude (claude.ai) | Dengue = trained forecaster; leptospirosis = 2-wk rain/flood trigger module | Lepto public data mostly national/regional; 2-wk lag well-evidenced (Matsushita 2018)
2026-10-19 | Fabi | Claude (claude.ai) | Province-level primary unit; Quezon City as city-level showcase | Catalogue dengue data is province-level
2026-10-19 | Fabi | Claude (claude.ai) | Use DOH alert/epidemic thresholds for Normal/Alert/Epidemic tiers | Matches PH surveillance practice; interpretable for LGUs
2026-10-19 | Fabi | Claude (claude.ai) | Always benchmark vs seasonal baseline; include lagged cases | Evidence shows weather alone adds modest gains
2026-10-20 | Fabi | Claude (claude.ai) | GitHub repo markdown files = single source of truth for all teammates' AIs | Team uses different AI models; Docs drift out of sync
2026-10-20 | Fabi | Claude Code (claude-opus-5-5) | Bootstrap AGENTS.md + CLAUDE.md/GEMINI.md pointers + docs/* context files | One entry point every AI reads; per-person STATUS sections avoid overwrites
2026-10-20 | Paul | Claude Code (claude-opus-5-5) | No team captain. Roles: UI + demo = Ivanne, Diego; code + model = JD, JP, Paul; slides = Paul; proposal = all | Team agreed on role split
2026-10-20 | Paul | Claude Code (claude-opus-5-5) | Deadline confirmed Oct 24, 2026; team target is to finish by Oct 23 | One-day buffer before submission
2026-10-20 | Paul | Claude Code (claude-opus-5-5) | Migrate Google Docs UI tab into docs/UI_SPEC.md; repo copy is now the source of truth | Single source of truth for all teammates' AIs
2026-10-23 | Paul | Claude Code (claude-opus-5-5) | The proposal doc's NEW PROPOSAL tab (its METHODOLOGY section) is the source of truth for data, models and evaluation; repo docs follow it | Team rewrote the methodology in the proposal; repo had drifted
2026-10-23 | Team (per proposal) | — | Supersedes 2026-10-19 entries on province level, weekly 1–4 week forecasts, NB-GLM/LightGBM and the lepto rule trigger: monthly models; leptospirosis = HistGradientBoosting (Poisson loss) on current + previous month rain + seasonality, Manila 2001–2012 (EIDC data); dengue = Poisson regression on same-month rain, Quezon City 2010–2025 (UPRI-NOAH data); leave-one-year-out CV vs. baseline | Weekly analyses were dominated by a few outbreak weeks and fit poorly; these models performed best among those tested (per proposal)
2026-10-23 | Paul | Claude Code (claude-opus-5-5) | Aligned every NEW PROPOSAL section with its METHODOLOGY (exec summary, keywords, background, objectives, scope, appendices, references); filled Methodology placeholders except week numbering; NEW METHODOLOGY tab kept unedited as the reference copy | Paul confirmed only the methodology had been updated; the proposal is the deliverable and must be internally consistent
2026-10-23 | Paul | Claude Code (claude-opus-5-5) | Dropped DOH Normal/Alert/Epidemic tiers and SHAP from the proposal; framed both models as nowcasts | Neither is in the methodology; models use current-month rainfall, so "1–4 weeks ahead" would overclaim
