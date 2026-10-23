# AGENTS.md — rules for every AI working in this repo

**Project:** `<project-name>` (name TBD; "Trace the rain, target the outbreak"), the team's PJDSC 2026 entry. It estimates monthly leptospirosis cases in Manila and monthly dengue cases in Quezon City from rainfall, using Poisson models, so LGUs can prepare before surveillance reports (2–3 weeks late) arrive.

**Source of truth:** the proposal doc's **NEW PROPOSAL** tab (link in `docs/LINKS.md`), which is also the proposal deliverable. `docs/DATA_MODEL.md` mirrors its METHODOLOGY section. If they disagree, the proposal wins; update the repo docs. The **NEW METHODOLOGY** tab is the team's reference copy; don't edit it.

**Deadline:** Oct 24, 2026 (confirmed). **Team target: finish by Oct 23, 2026.**

**Tech stack:** Python (pandas, scikit-learn), Streamlit app, folium and/or plotly for maps and charts.

## Read order (start of every session)

1. `AGENTS.md` (this file)
2. `docs/STATUS.md`
3. The spec file your task touches: `docs/DATA_MODEL.md`, `docs/UI_SPEC.md`, or `docs/PROJECT_BRIEF.md`

## Update rules (end of every session)

- Update **only your own person's section** in `docs/STATUS.md`.
- Append decisions to `docs/DECISIONS.md` as `YYYY-MM-DD | who | AI model | decision | why`.
- Update `docs/UI_SPEC.md` or `docs/DATA_MODEL.md` if the design changed.
- Add any new link (document, dataset, paper, tool) to `docs/LINKS.md`.

## Don'ts

- Don't rewrite `docs/PROJECT_BRIEF.md` unless the team has agreed first.
- Don't delete or edit other people's entries.
- Don't invent data sources or facts. Mark unknowns as `TBD`.
- `docs/DECISIONS.md` is **append-only**. To reverse a decision, add a new entry that overrides the old one.

## Workflow

- Run `git pull` before each session and commit after it.
- Make small commits with clear messages, e.g. `docs: update UI_SPEC map screen`.
- No pull-request review for docs. Pull requests for code are optional, given the deadline.
- The repo is the **single source of truth**. The Google Docs (idea brief tab and UI tab) become read-only or are retired once their content is moved here.

## Browser-based chat AIs that can't push

At the end of the session, output the **full updated markdown of every file you changed** so the human can commit it.

### Starter prompt for teammates using browser chat AIs

> Read AGENTS.md, docs/STATUS.md, and [relevant spec] from [https://github.com/PaulFababeir/pjdsc-app or pasted content]. Follow the update rules in AGENTS.md. At the end, give me the exact updated markdown for any file you changed so I can commit it.

## Repo layout

```
AGENTS.md            rules for every AI (this file)
CLAUDE.md, GEMINI.md pointers to AGENTS.md
docs/PROJECT_BRIEF.md  concept, scope, pitch, competition context (rarely changes)
docs/UI_SPEC.md        screens, components, user flow
docs/DATA_MODEL.md     datasets, features, models, evaluation
docs/STATUS.md         who's doing what, blockers, next steps
docs/DECISIONS.md      append-only decision log
docs/LINKS.md          all links: proposal doc, deliverables, datasets, papers, tools
docs/FINALISTS_INSIGHTS.md  what past PJDSC finalists did, and recommendations for us
app/                   Streamlit app
data/                  datasets
notebooks/             exploration and modeling notebooks
```
