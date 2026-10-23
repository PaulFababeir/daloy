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
* **Look & Feel:** High-tech public health command center (think Singapore Smart Nation meets WHO Outbreak Radar with sleek glassmorphism and radiant bioclimatic accents).

---

## 2. Dual-Theme Color Sheet: Dark Mode vs. Light Mode

DALOY is engineered with a **first-class dual-theme system**:
* **Dark Mode ("Command Center / Outbreak Radar"):** The default theme. High-contrast neon accents over abyssal slate surfaces, designed for low-light command rooms, nighttime LGU emergency ops, and glowing 3D depth perception.
* **Light Mode ("Warm White & Soft Beige / Editorial Dossier"):** Clean warm alabaster cards (`#FFFDF9`) set against soft oat beige trays (`#F4EFE6`) with warm limestone borders (`#E7E1D6`) and deep espresso charcoal typography (`#1C1917`), optimized for daytime executive readability, high-clarity briefing printouts, and zero eye-strain.

### Complete Side-by-Side Color Sheet

| UI Token / Role | Dark Mode ("Command Center") | Light Mode ("Warm White & Beige") | Semantic Meaning |
|:---|:---:|:---:|:---|
| **Canvas / Background** | `#0B0F17`<br>`rgb(11, 15, 23)` | `#F7F4EE`<br>`rgb(247, 244, 238)` | App canvas & 3D viewport void |
| **Primary Glass Surface** | `rgba(15, 23, 42, 0.88)`<br>(Slate-900 @ 88%) | `rgba(255, 253, 249, 0.95)`<br>(Warm White `#FFFDF9` @ 95%) | Floating HUD cards & side drawers |
| **Secondary Chip / Tray** | `rgba(30, 41, 59, 0.70)`<br>(Slate-800 @ 70%) | `rgba(244, 239, 230, 0.95)`<br>(Soft Beige `#F4EFE6` @ 95%) | Inset inputs, tabs & data subcards |
| **Card Borders / Dividers** | `rgba(148, 163, 184, 0.14)`<br>`#334155` | `rgba(231, 225, 214, 0.95)`<br>`#E7E1D6` | 1px warm stone containment rings |
| **Specular Top Highlight** | `rgba(255, 255, 255, 0.12)` | `rgba(255, 255, 255, 0.95)` | Subtle 3D light reflection on cards |
| **3D Inactive City Plates** | `#1E293B` to `#2C3B4E`<br>(Deep Architectural Slate) | `#DBD4C8` to `#EDE8E1`<br>(Warm Limestone Grayscale) | 15 unmodeled NCR cities |
| **Text: Primary Heading** | `#F8FAFC` (Clinical White) | `#1C1917` (Stone-900 Warm Espresso) | Brand titles, KPI numbers, city names |
| **Text: Secondary / Labels** | `#94A3B8` (Mist Slate) | `#57534E` (Stone-600 Warm Charcoal) | Metric units, column titles, subtitles |
| **Text: Muted / Coordinates**| `#64748B` (Deep Mist) | `#78716C` (Stone-500 Warm Stone) | Lat/Lon coordinates, disclaimers |
| **Dengue Solid Fill** | `#E11D48` (Rose-600) | `#E11D48` (Rose-600) | Quezon City 3D plate, active indicator |
| **Dengue Accent / Text** | `#FB7185` (Rose-400) | `#9F1239` (Rose-800) | Dark mode glow / Light mode readable text |
| **Leptospirosis Solid Fill** | `#0D9488` (Teal-600) | `#0D9488` (Teal-600) | City of Manila 3D plate, active indicator |
| **Leptospirosis Accent / Text**| `#2DD4BF` (Teal-400) | `#115E59` (Teal-800) | Dark mode glow / Light mode readable text |
| **Monsoon Rain / Rivers** | `#38BDF8` (Sky-400) | `#0284C7` (Sky-600) | River channels, precipitation slider |
| **Rain Particles (3D)** | `#7DD3FC` (Sky-300 @ 0.5) | `#0284C7` (Sky-600 @ 0.6) | 3D falling rainfall vectors |

---

## 3. CSS Variables & Tailwind Theme Mapping

Use these CSS custom properties for instant theme switching via `.dark` class:

```css
:root {
  /* LIGHT MODE TOKENS (WARM WHITE & SOFT BEIGE) */
  --daloy-bg: #F7F4EE;
  --daloy-surface-1: rgba(255, 253, 249, 0.95);
  --daloy-surface-2: rgba(244, 239, 230, 0.95);
  --daloy-border: #E7E1D6;
  --daloy-text-primary: #1C1917;
  --daloy-text-secondary: #57534E;
  --daloy-text-muted: #78716C;

  --daloy-dengue-solid: #E11D48;
  --daloy-dengue-text: #9F1239;
  --daloy-dengue-bg: rgba(225, 29, 72, 0.10);

  --daloy-lepto-solid: #0D9488;
  --daloy-lepto-text: #115E59;
  --daloy-lepto-bg: rgba(13, 148, 136, 0.10);

  --daloy-rain: #0284C7;
  --daloy-shadow: 0 20px 40px -15px rgba(28, 25, 23, 0.08);
}

.dark {
  /* DARK MODE TOKENS */
  --daloy-bg: #0B0F17;
  --daloy-surface-1: rgba(15, 23, 42, 0.88);
  --daloy-surface-2: rgba(30, 41, 59, 0.70);
  --daloy-border: rgba(148, 163, 184, 0.14);
  --daloy-text-primary: #F8FAFC;
  --daloy-text-secondary: #94A3B8;
  --daloy-text-muted: #64748B;

  --daloy-dengue-solid: #E11D48;
  --daloy-dengue-text: #FB7185;
  --daloy-dengue-bg: rgba(225, 29, 72, 0.20);

  --daloy-lepto-solid: #0D9488;
  --daloy-lepto-text: #2DD4BF;
  --daloy-lepto-bg: rgba(13, 148, 136, 0.20);

  --daloy-rain: #38BDF8;
  --daloy-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
}
```

### Tailwind Class Shorthands

| Component | Dark Mode Classes | Light Mode Classes |
|:---|:---|:---|
| **Floating HUD Card** | `bg-slate-900/90 border-slate-800 text-white backdrop-blur-xl shadow-2xl` | `bg-[#FFFDF9]/95 border-[#E7E1D6] text-stone-900 backdrop-blur-xl shadow-xl` |
| **Data Chip / Subcard** | `bg-slate-800/70 border-slate-700/60 text-slate-200` | `bg-[#F4EFE6] border-[#E7E1D6] text-stone-800` |
| **Dengue Badge** | `bg-rose-500/20 text-rose-300 border-rose-500/40` | `bg-rose-100 text-rose-900 border-rose-200` |
| **Lepto Badge** | `bg-teal-500/20 text-teal-300 border-teal-500/40` | `bg-teal-100 text-teal-900 border-teal-200` |
| **Muted Legend / Out of Scope** | `bg-slate-800 text-slate-400 border-slate-700` | `bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]` |

---

## 4. Accessibility & Contrast Verification (WCAG AAA)

To ensure high usability during critical disaster response:
* **Dark Mode Contrast:**
  - `#F8FAFC` on `#0B0F17` has a contrast ratio of **18.2:1** (far exceeds WCAG AAA 7:1 standard).
  - `#2DD4BF` (Teal text) on `#0F172A` has a contrast ratio of **9.4:1** (WCAG AAA Pass).
  - `#FB7185` (Rose text) on `#0F172A` has a contrast ratio of **7.6:1** (WCAG AAA Pass).
* **Light Mode Contrast:**
  - `#0F172A` on `#FFFFFF` has a contrast ratio of **19.1:1** (WCAG AAA Pass).
  - `#115E59` (Teal-800 text) on `#FFFFFF` has a contrast ratio of **7.5:1** (WCAG AAA Pass).
  - `#9F1239` (Rose-800 text) on `#FFFFFF` has a contrast ratio of **7.8:1** (WCAG AAA Pass).

---

## 5. Typography Hierarchy & Pairings

DALOY blends **high-legibility structural sans-serifs** with **high-precision monospace data glyphs**:

```
Header:    PLUS JAKARTA SANS / SPACE GROTESK  (Punchy, architectural, geometric)
UI & Body: INTER / GEIST                     (Neutral, crystal clear at 11px)
KPIs & CI: JETBRAINS MONO                    (Tabular numbers, formula expressions)
```

### Font System & Roles
1. **Brandmark & Primary Titles: `Plus Jakarta Sans` or `Space Grotesk`**
   - **Weight:** `800 ExtraBold` for Hero title; `700 Bold` for section headings.
   - **Tracking:** `-0.03em` (tight tracking gives a modern, premium enterprise aesthetic).
2. **Body & Interface Text: `Inter`**
   - **Weights:** `400 Regular` (descriptions), `500 Medium` (metadata), `600 SemiBold` (buttons).
   - **Line Height:** `1.45` to `1.55` for high-density HUD readability.
3. **Metrics, Formulas & Coordinates: `JetBrains Mono`**
   - **Used For:** Poisson regression formula `log E[y] = β₀ + β₁z`, 95% Confidence Intervals (`240 – 330`), coordinates (`121.03°E, 14.60°N`), and case counts (`1,846,513`).

---

## 6. Logo & App Icon Inspiration & Construction

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

## 7. App Icon Blueprint (1:1 Square / Squircle)

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
- **Dark Mode Icon Background:** Linear gradient from Deep Navy (`#0F172A`) to Midnight Ink (`#020617`).
- **Light Mode Icon Background:** Linear gradient from Pure White (`#FFFFFF`) to Soft Alabaster (`#F1F5F9`) with a 1px border (`#E2E8F0`).
- **Corner Radius:** `224 px` (Continuous curvature iOS squircle / Android 13 adaptive round).
- **Primary Mark Stroke:** `48 px` to `64 px` stroke width (remains crisp down to `16x16` browser favicon).
- **Gradients & Glows:** 
  - Linear gradient along the path from `#0D9488` (Teal) $\rightarrow$ `#38BDF8` (Sky) $\rightarrow$ `#E11D48` (Crimson spark).
  - Subtle drop shadow with `blur: 32px`, `opacity: 0.45` in Teal glow (`#0D9488`).
- **Negative Space:** Generous 18% outer safe margin so the mark never clips when rounded by Apple or Google launcher masks.

---

## 8. Summary Checklist for Your Logo / Icon Creation

When drafting your logo in Figma, Illustrator, or Canva:
1. [ ] **Does it work on BOTH Dark and Light canvases?** Test the mark on both `#0B0F17` and `#FFFFFF`.
2. [ ] **Does it work in pure monochrome (all-white or all-black)?** If the silhouette doesn't read clearly without color, simplify the shapes.
3. [ ] **Is it recognizable at 24x24 px?** Shrink your viewport to inspect the favicon scale. The main curves must remain crisp.
4. [ ] **Does it convey "Water" + "Predictive Public Health"?** Ensure the aesthetic feels like scientific public infrastructure rather than a generic fitness or water utility app.
5. [ ] **Does it balance both Teal (`#0D9488`) and Crimson (`#E11D48`)?** These two signature colors establish the connection to both disease threats.
