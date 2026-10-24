# Brand kit

## The name

*Daloy* is Filipino for flow or current. It's the flow of floodwater through Metro Manila's rivers and esteros, and the flow of information we want to speed up: from rainfall data to the city health office, ahead of the case reports.

Tagline: **Trace the rain, target the outbreak.**

The tone we aim for is calm and practical. This is a tool for health officers, so no alarm-red everywhere and no hype; "well above typical" should be the only thing that looks urgent.

## Colours

Each disease has one colour and keeps it everywhere: dengue is rose, leptospirosis is teal, rain and rivers are sky blue.

| Role | Dark theme | Light theme |
|---|---|---|
| Page background | `#0B0F17` | `#F7F4EE` |
| Cards | slate-900 at 88% (`rgba(15, 23, 42, 0.88)`) | `#FFFDF9` |
| Inset trays, inputs | slate-800 at 70% | `#F4EFE6` |
| Borders | `#334155` | `#E7E1D6` |
| Heading text | `#F8FAFC` | `#1C1917` |
| Secondary text | `#94A3B8` | `#57534E` |
| Dengue (Quezon City) | fill `#E11D48`, text `#FB7185` | fill `#E11D48`, text `#9F1239` |
| Leptospirosis (Manila) | fill `#0D9488`, text `#2DD4BF` | fill `#0D9488`, text `#115E59` |
| Rain, rivers | `#38BDF8` | `#0284C7` |

The dark theme is the default; it suits the 3D map. The light theme is warmer and closer to a printed report, which is also why the summary report is always rendered on white.

## Type

- **Headings:** Plus Jakarta Sans, bold to extra-bold, slightly tight tracking.
- **Body and UI:** Inter, 400 for text and 600 for buttons.
- **Numbers, formulas, coordinates:** JetBrains Mono, so case counts and ranges line up.

## Logo

The mark is two overlapping waves: a sky-to-teal one for rain and leptospirosis, and a rose one for dengue. Each wave has a dot riding its crest, and a dashed circle around them suggests a monitoring radius. Like a case curve, the waves rise and fall together. The files are `app/frontend/public/logo.svg` and `logo.png`, and the favicon is `favicon.svg`.

When using it:

- check it on both backgrounds (`#0B0F17` and `#FFFFFF`)
- keep about 18% clear space around it
- don't go below 24 px wide; use the favicon at smaller sizes
