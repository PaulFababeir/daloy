# DECISIONS (append-only — newest at bottom)

Format: YYYY-MM-DD | who | AI model | decision | why

2026-10-19 | Fabi | Claude (claude.ai) | Pivot to dengue + leptospirosis outbreak forecasting from weather data | Fits "stop outbreaks early" pillar; dengue data in official catalogue
2026-10-19 | Fabi | Claude (claude.ai) | Dengue = trained forecaster; leptospirosis = 2-wk rain/flood trigger module | Lepto public data mostly national/regional; 2-wk lag well-evidenced (Matsushita 2018)
2026-10-19 | Fabi | Claude (claude.ai) | Province-level primary unit; Quezon City as city-level showcase | Catalogue dengue data is province-level
2026-10-19 | Fabi | Claude (claude.ai) | Use DOH alert/epidemic thresholds for Normal/Alert/Epidemic tiers | Matches PH surveillance practice; interpretable for LGUs
2026-10-19 | Fabi | Claude (claude.ai) | Always benchmark vs seasonal baseline; include lagged cases | Evidence shows weather alone adds modest gains
2026-10-20 | Fabi | Claude (claude.ai) | GitHub repo markdown files = single source of truth for all teammates' AIs | Team uses different AI models; Docs drift out of sync
2026-10-20 | Fabi | Claude Code (claude-opus-5-5) | Bootstrap AGENTS.md + CLAUDE.md/GEMINI.md pointers + docs/* context files | One entry point every AI reads; per-person STATUS sections avoid overwrites
