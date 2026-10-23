# DALOY Brand Identity & Design System Guide
**Philippine Junior Data Science Challenge 2026 (PJDSC 2026)**  
*Project Name:* **DALOY** (Tagalog for *Flow*, *Current*, *Circulation*)  
*Tagline:* **"Trace the rain, target the outbreak."** / *"Trace the Pattern, Target the Cure."*

---

## 1. Brand Essence & Story

### The Meaning of DALOY
In Filipino, **"Daloy"** evokes the natural, unyielding movement of water—from monsoon clouds spilling over the Sierra Madre, coursing through the Pasig and Marikina river basins, backing up into urban esteros, to the puddles that become breeding grounds for disease.

In public health epidemiology, **"Daloy"** takes on two deeper meanings:
1. **The Pathogen Transmission Chain:** The temporal flow connecting a rainfall anomaly today to a leptospirosis spike in 14 days or a dengue surge in 4 weeks.
2. **The Flow of Timely Intelligence:** Traditional surveillance is stagnant—lagging 2 to 3 weeks behind hospital admissions. DALOY turns this into a dynamic, proactive flow, getting actionable resource allocations into the hands of Local Government Units (LGUs) *before* clinics are overwhelmed.

### Brand Archetype & Tone
* **Archetype:** **The Vigilant Navigator** (blend of Sage + Guardian).
* **Tone:** Authoritative, clinically calm, precise, hyper-modern, and civic-minded.
* **Look & Feel:** High-tech public health command center (think Singapore Smart Nation meets WHO Outbreak Radar with sleek dark-mode glassmorphism and radiant bioclimatic accents).

---

## 2. Color Palette & Token System

The color system is anchored around the **bioclimatic triad**: **Abyssal Slate** (urban terrain), **Tidal Cyan** (waterborne leptospirosis / hydrological flow), and **Crimson Rose** (vector-borne dengue / epidemic alert).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE COLOR SPECTRUM                             │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│ Tidal Teal   │ Crimson Rose │ Monsoon Sky  │ Midnight    │ Slate Plate │
│  #0D9488     │  #E11D48     │  #0284C7     │  #0B0F17    │  #1E293B    │
│ Leptospirosis│ Dengue Alert │ Precipitation│ Deep Canvas │ Topo Grids  │
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

### Primary Identity Colors

| Swatch | Color Name | Hex Code | HSL / RGB | Meaning & Role |
|:---:|:---|:---:|:---|:---|
| ⬛ | **Midnight Abyss** | `#0B0F17` | `hsl(220, 35%, 7%)` | **Canvas Base.** Deep oceanic/space navy that makes neon alerts and 3D maps pop with zero eye strain. |
| 🟩 | **Tidal Teal** | `#0D9488` | `hsl(175, 84%, 32%)` | **Hydrological / Leptospirosis.** Represents water, esteros, floodwater immersion, and clinical recovery. |
| 🟥 | **Crimson Vector** | `#E11D48` | `hsl(347, 77%, 50%)` | **Epidemic / Dengue.** Represents fever, blood platelets, biological vectors (*Aedes aegypti*), and critical surge alerts. |
| 🟦 | **Monsoon Sky** | `#0284C7` | `hsl(201, 96%, 39%)` | **Meteorology & Flow.** Rainfall indicators, satellite precipitation (NASA IMERG), and river waterways. |

### Secondary & Surface Grayscale

| Swatch | Color Name | Hex Code | Purpose |
|:---:|:---|:---:|:---|
| ⬛ | **Slate Plate (Dark)** | `#1E293B` | Inactive 3D city plates, HUD card backgrounds (`rgba(30,41,59,0.85)`). |
| 🔲 | **Cadence Border** | `#334155` | Subtle 1px borders, grid separators, glassmorphic edge rings. |
| ◽ | **Mist Silver** | `#94A3B8` | Secondary labels, units (`mm`, `km²`), axes tick marks. |
| ⬜ | **Clinical White** | `#F8FAFC` | Primary KPI numbers, headline typography, high-contrast highlights. |

### Semantic Epidemiological Tiers

```
[ Normal / Controlled ]  ──>  #10B981 (Emerald)  · Cases within baseline
[ Elevated / Alert ]     ──>  #F59E0B (Amber)    · Pre-positioning triggered
[ Epidemic Surge ]       ──>  #E11D48 (Crimson)  · Fast-lane triage & bed mobilization
```

---

## 3. Typography Hierarchy & Pairings

DALOY blends **high-legibility structural sans-serifs** with **high-precision monospace data glyphs** to create a legitimate epidemiological dashboard look.

```
Header:    PLUS JAKARTA SANS / SPACE GROTESK  (Punchy, architectural, geometric)
UI & Body: INTER / GEIST                     (Neutral, crystal clear at 11px)
KPIs & CI: JETBRAINS MONO                    (Tabular numbers, formula expressions)
```

### Font System & Roles

1. **Brandmark & Primary Titles: `Plus Jakarta Sans` or `Space Grotesk`**
   - **Characteristics:** Geometric curves with humanist warmth. The circular geometric bowls reflect water droplets, while the sharp vertices feel engineered.
   - **Weight:** `800 ExtraBold` for Hero title; `700 Bold` for section headings.
   - **Tracking:** `-0.03em` (tight tracking gives a modern, premium enterprise aesthetic).

2. **Body & Interface Text: `Inter`**
   - **Characteristics:** Tall x-height, wide apertures, open counters. Designed specifically for dense computer screens and mobile readability.
   - **Weights:** `400 Regular` (body descriptions), `500 Medium` (metadata), `600 SemiBold` (buttons & subheaders).
   - **Line Height:** `1.45` to `1.55` for high-density HUD readability.

3. **Metrics, Formulas & Coordinates: `JetBrains Mono`**
   - **Characteristics:** Monospaced with clear distinction between `0` (slashed) and `O`, `1` and `l`. Numbers have tabular lining so digits don't jitter during rainfall slider dragging.
   - **Used For:** Poisson regression formula `log E[y] = β₀ + β₁z`, 95% Confidence Intervals (`240 – 330`), coordinates (`121.03°E, 14.60°N`), and case counts (`1,846,513`).

---

## 4. Logo & App Icon Inspiration & Construction

When designing the DALOY logo/icon, avoid cliché hospital cross stickers or generic blue water drops. The icon must express **flowing movement, predictive foresight, and public health protection**.

### Concept Direction 1: "The Hydrological Vector" (Recommended)
* **The Visual Idea:** A stylized **continuous river current** that loops seamlessly into an **epidemiological pulse wave** or forward-pointing chevron ($\rightarrow$), forming the lettermark **"D"**.
* **Symbolism:** 
  - The left vertical stem represents the stable rainfall baseline.
  - The dynamic right curve represents the flow of water and the Poisson case trajectory.
  - An embedded radiant point (pulsing dot) at the apex symbolizes the early warning trigger.
* **Mood:** Fast, responsive, scientific.

### Concept Direction 2: "The Dual-Current Convergence" (The Two Diseases)
* **The Visual Idea:** Two intertwining fluid ribbons:
  - Ribbon 1 in **Tidal Teal** (`#0D9488`) representing floodwaters & Leptospirosis.
  - Ribbon 2 in **Crimson Rose** (`#E11D48`) representing biological surge & Dengue.
  - Where they overlap, they form a unified shield or topographic water droplet.
* **Symbolism:** Metro Manila's twin rainfall-sensitive public health threats unified under one intelligent monitoring lens.
* **Mood:** Unified, comprehensive, biosafe.

### Concept Direction 3: "The Topographic Radar Basin"
* **The Visual Idea:** Concentric topographic contour rings (reminiscent of the Pasig-Marikina river basin elevation lines) intersected by a 30-degree radar sweep angle that lights up in neon teal and crimson.
* **Symbolism:** Looking down from space at the urban basin to detect invisible risk ripples before they flood the hospitals.
* **Mood:** Geospatial, intelligence-driven, surveillance command.

---

## 5. App Icon Blueprint (1:1 Square / Squircle)

Use this geometry grid when constructing the SVG or canvas icon:

```
┌──────────────────────────────────────────────┐
│  (Canvas: 1024 x 1024 px, Padding: 128 px)    │
│                                              │
│               ╭──────────────╮               │
│             ╱                  ╲             │
│           ╱       ╭──────╮       ╲           │
│         │        │  ★   │        │          │
│         │   ▲    ╰──────╯        │          │
│         │   │   [DALOY STREAM]   │          │
│         │   │                    │          │
│          ╲  ╰───────────────────╯          │
│            ╲                            ╱    │
│              ╰────────────────────────╯      │
│                                              │
└──────────────────────────────────────────────┘
```

### Technical Icon Parameters
- **Canvas Size:** `1024 x 1024 px` (Scalable vector `.svg` export).
- **Background:** Gradient fill from Deep Midnight Navy (`#06090F`) at top-left to Abyssal Teal-Black (`#041D24`) at bottom-right.
- **Corner Radius:** `224 px` (Continuous curvature iOS squircle / Android 13 adaptive round).
- **Primary Mark Stroke:** `48 px` to `64 px` stroke width (remains crisp down to `16x16` browser favicon).
- **Gradients & Glows:** 
  - Linear gradient along the path from `#0D9488` (Teal) $\rightarrow$ `#38BDF8` (Sky) $\rightarrow$ `#E11D48` (Crimson spark).
  - Subtle drop shadow with `blur: 32px`, `opacity: 0.45` in Teal glow (`#0D9488`).
- **Negative Space:** Generous 18% outer safe margin so the mark never clips when rounded by Apple or Google launcher masks.

---

## 6. Text-Lockup & Typography Hierarchy Specs

```
          ┌────────────────────────────────────────┐
          │                                        │
          │   [ ICON ]    D A L O Y                │
          │             PUBLIC HEALTH OUTBREAK     │
          │             NOWCASTING PLATFORM        │
          │                                        │
          └────────────────────────────────────────┘
```

### Exact CSS Specs for Logo Lockup
```css
/* DALOY Brand Wordmark */
.brand-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.035em;
  background: linear-gradient(135deg, #FFFFFF 30%, #94A3B8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Category Subtitle */
.brand-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #38BDF8; /* Sky-400 */
}

/* Tagline */
.brand-tagline {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  font-size: 11px;
  color: #64748B; /* Slate-500 */
}
```

---

## 7. Glassmorphism & UI Card Recipes

To give the app its signature high-end public health dashboard look:

```css
/* Master Glassmorphic Card Token */
.glass-panel {
  background: rgba(15, 23, 42, 0.88); /* Slate-900 with 88% opacity */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.12); /* 1px translucent border */
  border-top: 1px solid rgba(255, 255, 255, 0.15); /* Specular top light */
  box-shadow: 
    0 20px 40px -15px rgba(0, 0, 0, 0.6),
    0 0 1px 1px rgba(255, 255, 255, 0.05) inset;
  border-radius: 24px;
}
```
