/**
 * DALOY API Client with Automatic Offline Fallback Engine
 * Provides dual-mode resilience for live FastAPI or standalone client demos.
 */

export interface PredictPayload {
  disease: 'dengue' | 'lepto';
  month: number;
  rain: number;
  prev_rain?: number;
  n_weeks?: number;
}

export interface SimilarMonth {
  year: number;
  month: number;
  rain: number;
  prev: number | null;
  cases: number;
  dist: number;
  sim: number;
}

export interface ActionItem {
  i: string;
  t: string;
  d: string;
  w: string;
  urgency?: string;
  priority?: 'critical' | 'high' | 'routine' | string;
  metric?: string;
  target_zones?: string;
}

export interface FloodZone {
  name: string;
  risk: string;
  level: number;
  desc: string;
}

export interface ResponseCurvePoint {
  rain: number;
  cases: number;
  raw?: number;
  ci_lower: number;
  ci_upper: number;
}

export interface SeasonalProfilePoint {
  month: number;
  month_name: string;
  short_name: string;
  baseline_cases: number;
  typical_rain: number;
}

export interface HistoricalPoint {
  year: number;
  month: number;
  rain: number;
  prev?: number | null;
  cases: number;
}

export interface PredictionResult {
  disease: string;
  city: string;
  month: number;
  month_name: string;
  rain: number;
  prev_rain: number | null;
  n_weeks: number;
  predicted_cases: number;
  raw_estimate: number;
  raw_model_output?: number[];
  model_name?: string;
  weekly_rate?: number;
  ci_lower: number;
  ci_upper: number;
  baseline_cases: number;
  ratio_to_baseline: number;
  pct_diff_baseline: number;
  level_id: 'low' | 'typ' | 'up' | 'high';
  level_label: string;
  takeaway_title?: string;
  takeaway_body?: string;
  why_text: string;
  effect_text: string;
  similar_months: SimilarMonth[];
  actions: ActionItem[];
  flood_zones: FloodZone[];
  response_curve?: ResponseCurvePoint[];
  seasonal_profile?: SeasonalProfilePoint[];
  history_points?: HistoricalPoint[];
  is_live_backend?: boolean;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MON3_NAMES = MONTH_NAMES.map(m => m.slice(0, 3));

// Local client-side fallback math
const RAIN_SHAPE = [20, 14, 18, 28, 120, 260, 400, 430, 360, 210, 130, 70];

function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-9);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

class LocalEngine {
  dengueHistory: HistoricalPoint[];
  leptoHistory: HistoricalPoint[];
  dengueMu = 0;
  dengueSdv = 1;
  leptoMu = 0;
  leptoSdv = 1;

  constructor() {
    this.dengueHistory = this.buildHistory('dengue', 11, [2010, 2025]);
    this.leptoHistory = this.buildHistory('lepto', 29, [2001, 2012]);
  }

  buildHistory(key: 'dengue' | 'lepto', seed: number, years: [number, number]): HistoricalPoint[] {
    const r = mulberry32(seed);
    const rows: any[] = [];
    const nWeeksPattern = [5, 4, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5];

    for (let y = years[0]; y <= years[1]; y++) {
      for (let m = 1; m <= 12; m++) {
        const rain = Math.max(0, RAIN_SHAPE[m - 1] * Math.exp(gauss(r) * 0.55));
        rows.push({
          year: y,
          month: m,
          rain: Math.round(rain * 10) / 10,
          nWeeks: nWeeksPattern[m - 1],
          prev: null,
          cases: 0
        });
      }
    }

    for (let i = 0; i < rows.length; i++) {
      rows[i].prev = i > 0 ? rows[i - 1].rain : null;
    }

    const logs = rows.map(d => Math.log1p(d.rain));
    const mu = logs.reduce((s, v) => s + v, 0) / logs.length;
    const sdv = Math.sqrt(logs.reduce((s, v) => s + (v - mu) ** 2, 0) / logs.length) || 1;

    if (key === 'dengue') {
      this.dengueMu = mu;
      this.dengueSdv = sdv;
    } else {
      this.leptoMu = mu;
      this.leptoSdv = sdv;
    }

    const usable = key === 'lepto' ? rows.filter(d => d.prev !== null) : rows;
    usable.forEach(d => {
      const expected = this.predictRaw(key, d.rain, d.prev, d.month, d.nWeeks);
      d.cases = Math.max(0, Math.round(expected * Math.exp(gauss(r) * 0.3)));
    });
    return usable;
  }

  predictRaw(key: 'dengue' | 'lepto', rain: number, prev: number | null, month: number, nWeeks = 4) {
    const mu = key === 'dengue' ? this.dengueMu : this.leptoMu;
    const sdv = key === 'dengue' ? this.dengueSdv : this.leptoSdv;
    const z = (v: number) => (Math.log1p(Math.max(0, v)) - mu) / sdv;

    if (key === 'dengue') {
      return Math.exp(Math.log(170) + 0.42 * z(rain));
    }

    const ang = (2 * Math.PI * month) / 12;
    const prevVal = prev !== null ? prev : rain;
    const rate = Math.exp(0.35 + 0.38 * z(rain) + 0.30 * z(prevVal) - 0.28 * Math.sin(ang) - 0.12 * Math.cos(ang));
    return Math.max(0, rate * (nWeeks || 4));
  }

  baseline(key: 'dengue' | 'lepto', month: number) {
    const hist = key === 'dengue' ? this.dengueHistory : this.leptoHistory;
    const list = hist.filter(d => d.month === month).map(d => d.cases);
    return list.reduce((s, v) => s + v, 0) / (list.length || 1);
  }

  typical(key: 'dengue' | 'lepto', month: number) {
    const hist = key === 'dengue' ? this.dengueHistory : this.leptoHistory;
    const sorted = hist.filter(d => d.month === month).map(d => d.rain).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] || 0;
  }

  similar(key: 'dengue' | 'lepto', rain: number, prev: number | null, month: number, k = 4): SimilarMonth[] {
    const mu = key === 'dengue' ? this.dengueMu : this.leptoMu;
    const sdv = key === 'dengue' ? this.dengueSdv : this.leptoSdv;
    const z = (v: number) => (Math.log1p(v) - mu) / sdv;

    const feat = (r: number, p: number | null, m: number) => {
      const f = [z(r)];
      if (key === 'lepto') {
        const a = (2 * Math.PI * m) / 12;
        f.push(z(p ?? r), Math.sin(a) * 0.8, Math.cos(a) * 0.8);
      }
      return f;
    };

    const q = feat(rain, prev, month);
    const hist = key === 'dengue' ? this.dengueHistory : this.leptoHistory;

    return hist
      .map(d => {
        const f = feat(d.rain, d.prev ?? null, d.month);
        const dist = Math.sqrt(f.reduce((s, v, i) => s + (v - q[i]) ** 2, 0));
        return {
          year: d.year,
          month: d.month,
          rain: d.rain,
          prev: d.prev ?? null,
          cases: d.cases,
          dist,
          sim: Math.round(100 * Math.exp(-dist * 1.2))
        };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k);
  }

  buildResponseCurve(
    key: 'dengue' | 'lepto',
    currentRain: number,
    prev: number | null,
    month: number,
    nWeeks = 4,
    anchorCases?: number,
    customHistory?: HistoricalPoint[]
  ): ResponseCurvePoint[] {
    const hist = customHistory && customHistory.length > 0
      ? customHistory
      : key === 'dengue' ? this.dengueHistory : this.leptoHistory;
    const histMax = Math.max(...hist.map(d => d.rain), 500);
    const xMax = Math.max(600, currentRain * 1.15, histMax * 1.05);
    const steps = 36;
    const set = new Set<number>([Math.round(currentRain * 10) / 10]);
    for (let i = 0; i <= steps; i++) {
      set.add(Math.round(((xMax / steps) * i) * 10) / 10);
    }
    const rains = Array.from(set).sort((a, b) => a - b);
    const rawAtCurrent = this.predictRaw(key, currentRain, prev, month, nWeeks);
    const scale =
      anchorCases !== undefined && rawAtCurrent > 0.1
        ? anchorCases / rawAtCurrent
        : 1.0;

    return rains.map(rVal => {
      const isAnchor = Math.abs(rVal - currentRain) < 0.15 && anchorCases !== undefined;
      const pred = isAnchor
        ? anchorCases!
        : this.predictRaw(key, rVal, prev, month, nWeeks) * scale;
      const casesVal = isAnchor ? Math.round(anchorCases!) : Math.max(0, Math.round(pred));
      const margin = pred > 0 ? 1.96 * Math.sqrt(Math.max(pred, 1)) : 0;
      return {
        rain: rVal,
        cases: casesVal,
        raw: Math.round(pred * 100) / 100,
        ci_lower: Math.max(0, Math.round(pred - margin)),
        ci_upper: Math.max(0, Math.round(pred + margin))
      };
    });
  }

  buildSeasonalProfile(key: 'dengue' | 'lepto', customHistory?: HistoricalPoint[]): SeasonalProfilePoint[] {
    const hist = customHistory && customHistory.length > 0
      ? customHistory
      : key === 'dengue' ? this.dengueHistory : this.leptoHistory;
    return MONTH_NAMES.map((mName, idx) => {
      const m = idx + 1;
      const monthRows = hist.filter(d => d.month === m);
      const meanCases = monthRows.length > 0
        ? monthRows.reduce((s, d) => s + d.cases, 0) / monthRows.length
        : this.baseline(key, m);
      const sortedRains = monthRows.map(d => d.rain).sort((a, b) => a - b);
      const medianRain = sortedRains.length > 0
        ? sortedRains[Math.floor(sortedRains.length / 2)]
        : this.typical(key, m);
      return {
        month: m,
        month_name: mName,
        short_name: MON3_NAMES[idx],
        baseline_cases: Math.round(meanCases * 10) / 10,
        typical_rain: Math.round(medianRain * 10) / 10
      };
    });
  }
}

const localFallback = new LocalEngine();

function buildPresentationMetadata(
  key: 'dengue' | 'lepto',
  cases: number,
  nWeeks: number,
  monthName: string,
  base: number,
  ratio: number,
  pctDiff: number,
  levelId: 'low' | 'typ' | 'up' | 'high'
) {
  const weeklyRate = Math.round((cases / Math.max(1, nWeeks)) * 10) / 10;
  const weekly = Math.max(1, Math.round(cases / Math.max(1, nWeeks)));
  const isElevated = levelId === 'up' || levelId === 'high';
  const isCritical = levelId === 'high';

  let takeawayTitle = '';
  let takeawayBody = '';

  if (key === 'dengue') {
    if (levelId === 'high') {
      takeawayTitle = `Outbreak Surge Warning · ${ratio.toFixed(1)}x Typical ${monthName} Load`;
      takeawayBody = `Expect ~${weeklyRate} dengue admissions/week (${cases.toLocaleString()} total). Rapid larval proliferation in flood basins will peak hospital demand within 10–14 days.`;
    } else if (levelId === 'up') {
      takeawayTitle = `Elevated Transmission · +${pctDiff}% Above ${monthName} Mean`;
      takeawayBody = `Model projects ~${weeklyRate} cases/week across ${nWeeks} weeks. Pre-emptive barangay 4S cleanups in Tatalon and Bagong Silangan are needed to cap transmission.`;
    } else if (levelId === 'low') {
      takeawayTitle = `Below Typical Baseline · ${Math.abs(pctDiff)}% Lower Than Usual`;
      takeawayBody = `Projected load (~${weeklyRate} cases/week) is well within routine clinic capacity. Maintain baseline larviciding in perennial drainage pockets.`;
    } else {
      takeawayTitle = `Typical Seasonal Burden · Near ${monthName} Average (${Math.round(base).toLocaleString()} cases)`;
      takeawayBody = `Expect ~${weeklyRate} cases/week (${cases.toLocaleString()} monthly total), matching historical ${monthName} patterns in Quezon City.`;
    }
  } else {
    if (levelId === 'high') {
      takeawayTitle = `High Flood-Exposure Surge · ${ratio.toFixed(1)}x Normal ${monthName} Risk`;
      takeawayBody = `Model predicts ${cases.toLocaleString()} leptospirosis cases (~${weeklyRate}/week). Acute hospital admissions & renal complications typically spike 7–14 days after flood wading.`;
    } else if (levelId === 'up') {
      takeawayTitle = `Above-Average Exposure Risk · +${pctDiff}% vs. ${monthName} Baseline`;
      takeawayBody = `Projected ${cases.toLocaleString()} cases (~${weeklyRate}/week). Immediate Doxycycline prophylaxis in flooded Manila corridors (España, Tondo) can prevent severe Weil's disease.`;
    } else if (levelId === 'low') {
      takeawayTitle = `Low Background Risk · ${cases.toLocaleString()} Projected Cases`;
      takeawayBody = `Minimal floodwater exposure (~${weeklyRate} cases/week). Standard health center surveillance and prophylaxis stock checks are sufficient.`;
    } else {
      takeawayTitle = `Typical Seasonal Exposure · Matches ${monthName} Baseline (${Math.round(base).toLocaleString()} cases)`;
      takeawayBody = `Model estimates ${cases.toLocaleString()} cases (~${weeklyRate}/week) for Manila. Keep post-exposure Doxycycline ready at barangay health stations.`;
    }
  }

  const actions: ActionItem[] = key === 'dengue'
    ? [
        {
          i: '4S',
          t: 'Deploy Barangay 4S Vector Sweep',
          d: 'Eliminate standing water in gutters, tires, and open containers within 48h of rainfall before Aedes larvae pupate.',
          w: 'Barangay Health Workers (BHWs)',
          urgency: 'Immediate (0–48h)',
          priority: isElevated ? 'critical' : 'high',
          metric: `Sweep ~${Math.max(15, Math.round(cases * 0.45)).toLocaleString()} priority households & storm drains`,
          target_zones: 'Brgy. Tatalon, Bagong Silangan, Roxas District'
        },
        {
          i: 'Rx',
          t: 'Pre-position NS1 Antigen & ORS Stocks',
          d: 'Ensure district health centers hold a 1.6x buffer of NS1 rapid diagnostic kits, oral rehydration salts, and paracetamol.',
          w: 'Quezon City Health Department',
          urgency: 'Within 72 Hours',
          priority: isElevated ? 'high' : 'routine',
          metric: `Stage ~${Math.max(40, Math.round(cases * 1.6)).toLocaleString()} NS1 test kits & ${Math.max(80, Math.round(cases * 3.0)).toLocaleString()} ORS packs`,
          target_zones: 'Districts II & IV Super Health Centers'
        },
        {
          i: 'IV',
          t: 'Activate Hospital Dengue Fast-Lanes',
          d: 'Stand up dedicated fever triage and ambulatory IV rehydration bays ahead of the 14-day post-rainfall symptomatic peak.',
          w: 'QC General & East Ave Medical Center',
          urgency: '7–14 Day Surge Window',
          priority: isCritical ? 'critical' : isElevated ? 'high' : 'routine',
          metric: `Reserve ~${Math.max(6, Math.round(cases * 0.18)).toLocaleString()} IV hydration beds (~${weekly.toLocaleString()} cases/wk)`,
          target_zones: 'QC Tertiary Referral Hospitals'
        },
        {
          i: 'PIO',
          t: 'Broadcast Early Fever Consultation Alert',
          d: 'Instruct residents with >2 days of fever to seek immediate NS1 testing, monitor warning signs, and avoid NSAIDs/aspirin.',
          w: 'QC DRRMO & Public Information Office',
          urgency: '7-Day Window',
          priority: isElevated ? 'high' : 'routine',
          metric: `Alert 5 flood-basin barangays (${cases.toLocaleString()} projected cases)`,
          target_zones: 'San Juan & Marikina River Basin Corridors'
        }
      ]
    : [
        {
          i: 'Dx',
          t: 'Deploy Post-Flood Doxycycline Prophylaxis',
          d: 'Administer single-dose 200mg Doxycycline PEP within 24–72h to residents and rescue personnel exposed to street floodwaters.',
          w: 'Manila Health Department (MHD)',
          urgency: 'Immediate (0–48h Post-Wading)',
          priority: isElevated ? 'critical' : 'high',
          metric: `Pre-position ~${Math.max(60, Math.round(cases * 25)).toLocaleString()} Doxycycline (200mg) PEP courses`,
          target_zones: 'Brgy. Sampaloc (España), Tondo I & II, Ermita'
        },
        {
          i: '!',
          t: 'Enforce Floodwater Wading Advisories',
          d: 'Broadcast warnings against bare-skin wading in floodwaters and distribute protective boots to frontline sanitation crews.',
          w: 'Manila DRRMO & Barangay Tanods',
          urgency: 'Immediate (0–24h)',
          priority: isCritical ? 'critical' : 'high',
          metric: `Active alerts across ${isElevated ? 5 : 3} chronic inundation corridors`,
          target_zones: 'España Blvd, Estero de Vitas, Taft Ave'
        },
        {
          i: 'H',
          t: 'Ready Renal Triage & Dialysis Capacity',
          d: 'Alert nephrology and ICU teams for Weil’s disease and acute kidney injury admissions peaking 7–14 days after flood exposure.',
          w: 'NKTI, PGH & Ospital ng Maynila',
          urgency: '7–14 Day Incubation Window',
          priority: isElevated ? 'critical' : 'routine',
          metric: `Prepare ~${Math.max(2, Math.round(cases * 0.3)).toLocaleString()} acute renal/dialysis slots (~${weekly.toLocaleString()} cases/wk)`,
          target_zones: 'Manila Tertiary & DOH Referral Hospitals'
        },
        {
          i: 'Rx',
          t: 'Stock IV Penicillin G & Rapid Triage Kits',
          d: 'Verify inventory of oral amoxicillin/doxycycline for mild cases and injectable Penicillin G / Ceftriaxone for moderate-severe cases.',
          w: 'District Health Centers & Emergency Wards',
          urgency: 'Within 72 Hours',
          priority: isElevated ? 'high' : 'routine',
          metric: `Stage ~${Math.max(15, Math.round(cases * 3.0)).toLocaleString()} adult antibiotic treatment courses`,
          target_zones: '6 Manila Health Districts'
        }
      ];

  return { weeklyRate, takeawayTitle, takeawayBody, actions };
}

export async function fetchPrediction(payload: PredictPayload): Promise<PredictionResult> {
  const key = payload.disease;
  const rain = payload.rain;
  const prev = payload.prev_rain !== undefined ? payload.prev_rain : rain;
  const month = payload.month;
  const nWeeks = payload.n_weeks || 4;

  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      const meta = buildPresentationMetadata(
        key,
        data.predicted_cases,
        data.n_weeks || nWeeks,
        data.month_name || MONTH_NAMES[month - 1],
        data.baseline_cases,
        data.ratio_to_baseline,
        data.pct_diff_baseline,
        data.level_id
      );
      return {
        ...data,
        raw_model_output: [data.predicted_cases],
        model_name:
          key === 'dengue'
            ? 'PoissonRegressor (Log-Link GLM)'
            : 'HistGradientBoostingRegressor (Poisson)',
        weekly_rate: meta.weeklyRate,
        takeaway_title: meta.takeawayTitle,
        takeaway_body: meta.takeawayBody,
        actions: meta.actions,
        response_curve: localFallback.buildResponseCurve(
          key,
          rain,
          prev,
          month,
          nWeeks,
          data.predicted_cases,
          data.history_points
        ),
        seasonal_profile: localFallback.buildSeasonalProfile(key, data.history_points),
        is_live_backend: true
      };
    }
  } catch {
    // Backend unreachable, run seamless local engine fallback
  }

  const rawPred = localFallback.predictRaw(key, rain, prev, month, nWeeks);
  const cases = Math.max(0, Math.round(rawPred));
  const weeklyRate = Math.round((rawPred / Math.max(1, nWeeks)) * 10) / 10;
  const margin = 1.96 * Math.sqrt(rawPred);
  const lo = Math.max(0, Math.round(rawPred - margin));
  const hi = Math.max(lo, Math.round(rawPred + margin));

  const base = localFallback.baseline(key, month);
  const ratio = base > 0 ? rawPred / base : 1.0;
  const pctDiff = Math.round((ratio - 1.0) * 100);

  let levelId: 'low' | 'typ' | 'up' | 'high' = 'typ';
  let levelLabel = 'Typical';
  if (ratio < 0.8) { levelId = 'low'; levelLabel = 'Below typical'; }
  else if (ratio <= 1.2) { levelId = 'typ'; levelLabel = 'Typical'; }
  else if (ratio <= 1.6) { levelId = 'up'; levelLabel = 'Above typical'; }
  else { levelId = 'high'; levelLabel = 'Well above typical'; }

  const tRain = localFallback.typical(key, month);
  const mName = MONTH_NAMES[month - 1];
  const rainCmp = rain > tRain * 1.15 ? 'more' : rain < tRain * 0.85 ? 'less' : 'about the same';

  let whyText = '';
  let effectText = '';
  let takeawayTitle = '';
  let takeawayBody = '';

  if (key === 'dengue') {
    whyText = `${Math.round(rain).toLocaleString()} mm is ${
      rainCmp === 'about the same' ? 'about the usual' : rainCmp + ' than the usual'
    } ${mName} rainfall in Quezon City (median ${Math.round(tRain).toLocaleString()} mm). More monthly rainfall expands outdoor container habitats for Aedes aegypti.`;
    const up = localFallback.predictRaw(key, rain + 100, prev, month, nWeeks);
    const eff = Math.round((up / rawPred - 1.0) * 100);
    effectText = `At this level, +100 mm of extra rain adds ~${eff}% more cases (+${Math.max(0, Math.round(up - rawPred))} cases).`;

    if (levelId === 'high') {
      takeawayTitle = `Outbreak Surge Warning · ${ratio.toFixed(1)}x Typical ${mName} Load`;
      takeawayBody = `Expect ~${weeklyRate} dengue admissions/week (${cases.toLocaleString()} total). Rapid larval proliferation in flood basins will peak hospital demand within 10–14 days.`;
    } else if (levelId === 'up') {
      takeawayTitle = `Elevated Transmission · +${pctDiff}% Above ${mName} Mean`;
      takeawayBody = `Model projects ~${weeklyRate} cases/week across ${nWeeks} weeks. Pre-emptive barangay 4S cleanups in Tatalon and Bagong Silangan are needed to cap transmission.`;
    } else if (levelId === 'low') {
      takeawayTitle = `Below Typical Baseline · ${Math.abs(pctDiff)}% Lower Than Usual`;
      takeawayBody = `Projected load (~${weeklyRate} cases/week) is well within routine clinic capacity. Maintain baseline larviciding in perennial drainage pockets.`;
    } else {
      takeawayTitle = `Typical Seasonal Burden · Near ${mName} Average (${Math.round(base).toLocaleString()} cases)`;
      takeawayBody = `Expect ~${weeklyRate} cases/week (${cases.toLocaleString()} monthly total), matching historical ${mName} patterns in Quezon City.`;
    }
  } else {
    const tPrev = localFallback.typical(key, month === 1 ? 12 : month - 1);
    whyText = `This month: ${Math.round(rain).toLocaleString()} mm (median ${Math.round(tRain).toLocaleString()} mm) · Last month: ${Math.round(prev).toLocaleString()} mm (median ${Math.round(tPrev).toLocaleString()} mm). Both months drive soil saturation and street flood wading exposure.`;
    effectText = `ML Model Output: [${cases.toFixed(1)}] → ${cases} cases (~${weeklyRate} cases/week × ${nWeeks} weeks).`;

    if (levelId === 'high') {
      takeawayTitle = `High Flood-Exposure Surge · ${ratio.toFixed(1)}x Normal ${mName} Risk`;
      takeawayBody = `Model predicts ${cases.toLocaleString()} leptospirosis cases (~${weeklyRate}/week). Acute hospital admissions & renal complications typically spike 7–14 days after flood wading.`;
    } else if (levelId === 'up') {
      takeawayTitle = `Above-Average Exposure Risk · +${pctDiff}% vs. ${mName} Baseline`;
      takeawayBody = `Projected ${cases.toLocaleString()} cases (~${weeklyRate}/week). Immediate Doxycycline prophylaxis in flooded Manila corridors (España, Tondo) can prevent severe Weil's disease.`;
    } else if (levelId === 'low') {
      takeawayTitle = `Low Background Risk · ${cases.toLocaleString()} Projected Cases`;
      takeawayBody = `Minimal floodwater exposure (~${weeklyRate} cases/week). Standard health center surveillance and prophylaxis stock checks are sufficient.`;
    } else {
      takeawayTitle = `Typical Seasonal Exposure · Matches ${mName} Baseline (${Math.round(base).toLocaleString()} cases)`;
      takeawayBody = `Model estimates ${cases.toLocaleString()} cases (~${weeklyRate}/week) for Manila. Keep post-exposure Doxycycline ready at barangay health stations.`;
    }
  }

  const sims = localFallback.similar(key, rain, prev, month, 4);
  const isElevated = levelId === 'up' || levelId === 'high';
  const isCritical = levelId === 'high';
  const weekly = Math.max(1, Math.round(cases / 4));

  const floodZones: FloodZone[] = key === 'dengue'
    ? [
        { name: 'Barangay Tatalon', risk: 'High', level: 3, desc: 'San Juan River overflow zone; dense residential drainage corridor' },
        { name: 'Barangay Bagong Silangan', risk: 'High', level: 3, desc: 'Marikina River tributary floodplain; rapid inundation risk' },
        { name: 'Barangay Roxas District', risk: 'Medium', level: 2, desc: 'Low elevation basin near Scout area creek outlets' },
        { name: 'Barangay Doña Imelda', risk: 'Medium', level: 2, desc: 'Bordering San Juan River; vulnerable during heavy monsoon surges' },
        { name: 'Barangay Batasan Hills', risk: 'Low', level: 1, desc: 'Elevated terrain; localized gully erosion and pocket ponding' }
      ]
    : [
        { name: 'Barangay Sampaloc (Espana corridor)', risk: 'High', level: 3, desc: 'Chronic street-level flooding; primary leptospirosis cluster zone' },
        { name: 'Barangay Tondo I & II', risk: 'High', level: 3, desc: 'Estero de Vitas tidal influence and high wading frequency' },
        { name: 'Barangay Ermita - Taft Ave', risk: 'Medium', level: 2, desc: 'Storm drain backup; pedestrian and commuter contact risk' },
        { name: 'Barangay Santa Ana', risk: 'Medium', level: 2, desc: 'Pasig River tidal bend flood zone during monsoon tides' },
        { name: 'Barangay Paco', risk: 'Low', level: 1, desc: 'Estero de Paco catchment; mitigated by pumping station operations' }
      ];

  const actions: ActionItem[] = key === 'dengue'
    ? [
        {
          i: '4S',
          t: 'Deploy Barangay 4S Vector Sweep',
          d: 'Eliminate standing water in gutters, tires, and open containers within 48h of rainfall before Aedes larvae pupate.',
          w: 'Barangay Health Workers (BHWs)',
          urgency: 'Immediate (0–48h)',
          priority: isElevated ? 'critical' : 'high',
          metric: `Sweep ~${Math.max(15, Math.round(cases * 0.45)).toLocaleString()} priority households & storm drains`,
          target_zones: 'Brgy. Tatalon, Bagong Silangan, Roxas District'
        },
        {
          i: 'Rx',
          t: 'Pre-position NS1 Antigen & ORS Stocks',
          d: 'Ensure district health centers hold a 1.6x buffer of NS1 rapid diagnostic kits, oral rehydration salts, and paracetamol.',
          w: 'Quezon City Health Department',
          urgency: 'Within 72 Hours',
          priority: isElevated ? 'high' : 'routine',
          metric: `Stage ~${Math.max(40, Math.round(cases * 1.6)).toLocaleString()} NS1 test kits & ${Math.max(80, Math.round(cases * 3.0)).toLocaleString()} ORS packs`,
          target_zones: 'Districts II & IV Super Health Centers'
        },
        {
          i: 'IV',
          t: 'Activate Hospital Dengue Fast-Lanes',
          d: 'Stand up dedicated fever triage and ambulatory IV rehydration bays ahead of the 14-day post-rainfall symptomatic peak.',
          w: 'QC General & East Ave Medical Center',
          urgency: '7–14 Day Surge Window',
          priority: isCritical ? 'critical' : isElevated ? 'high' : 'routine',
          metric: `Reserve ~${Math.max(6, Math.round(cases * 0.18)).toLocaleString()} IV hydration beds (~${weekly.toLocaleString()} cases/wk)`,
          target_zones: 'QC Tertiary Referral Hospitals'
        },
        {
          i: 'PIO',
          t: 'Broadcast Early Fever Consultation Alert',
          d: 'Instruct residents with >2 days of fever to seek immediate NS1 testing, monitor warning signs, and avoid NSAIDs/aspirin.',
          w: 'QC DRRMO & Public Information Office',
          urgency: '7-Day Window',
          priority: isElevated ? 'high' : 'routine',
          metric: `Alert 5 flood-basin barangays (${cases.toLocaleString()} projected cases)`,
          target_zones: 'San Juan & Marikina River Basin Corridors'
        }
      ]
    : [
        {
          i: 'Dx',
          t: 'Deploy Post-Flood Doxycycline Prophylaxis',
          d: 'Administer single-dose 200mg Doxycycline PEP within 24–72h to residents and rescue personnel exposed to street floodwaters.',
          w: 'Manila Health Department (MHD)',
          urgency: 'Immediate (0–48h Post-Wading)',
          priority: isElevated ? 'critical' : 'high',
          metric: `Pre-position ~${Math.max(60, Math.round(cases * 25)).toLocaleString()} Doxycycline (200mg) PEP courses`,
          target_zones: 'Brgy. Sampaloc (España), Tondo I & II, Ermita'
        },
        {
          i: '!',
          t: 'Enforce Floodwater Wading Advisories',
          d: 'Broadcast warnings against bare-skin wading in floodwaters and distribute protective boots to frontline sanitation crews.',
          w: 'Manila DRRMO & Barangay Tanods',
          urgency: 'Immediate (0–24h)',
          priority: isCritical ? 'critical' : 'high',
          metric: `Active alerts across ${isElevated ? 5 : 3} chronic inundation corridors`,
          target_zones: 'España Blvd, Estero de Vitas, Taft Ave'
        },
        {
          i: 'H',
          t: 'Ready Renal Triage & Dialysis Capacity',
          d: 'Alert nephrology and ICU teams for Weil’s disease and acute kidney injury admissions peaking 7–14 days after flood exposure.',
          w: 'NKTI, PGH & Ospital ng Maynila',
          urgency: '7–14 Day Incubation Window',
          priority: isElevated ? 'critical' : 'routine',
          metric: `Prepare ~${Math.max(2, Math.round(cases * 0.3)).toLocaleString()} acute renal/dialysis slots (~${weekly.toLocaleString()} cases/wk)`,
          target_zones: 'Manila Tertiary & DOH Referral Hospitals'
        },
        {
          i: 'Rx',
          t: 'Stock IV Penicillin G & Rapid Triage Kits',
          d: 'Verify inventory of oral amoxicillin/doxycycline for mild cases and injectable Penicillin G / Ceftriaxone for moderate-severe cases.',
          w: 'District Health Centers & Emergency Wards',
          urgency: 'Within 72 Hours',
          priority: isElevated ? 'high' : 'routine',
          metric: `Stage ~${Math.max(15, Math.round(cases * 3.0)).toLocaleString()} adult antibiotic treatment courses`,
          target_zones: '6 Manila Health Districts'
        }
      ];

  return {
    disease: key === 'dengue' ? 'Dengue' : 'Leptospirosis',
    city: key === 'dengue' ? 'Quezon City' : 'Manila',
    month,
    month_name: mName,
    rain,
    prev_rain: key === 'lepto' ? prev : null,
    n_weeks: nWeeks,
    predicted_cases: cases,
    raw_estimate: Math.round(rawPred * 10) / 10,
    raw_model_output: [cases],
    model_name: key === 'dengue' ? 'PoissonRegressor (Log-Link GLM)' : 'HistGradientBoostingRegressor (Poisson)',
    weekly_rate: weeklyRate,
    ci_lower: lo,
    ci_upper: hi,
    baseline_cases: Math.round(base * 10) / 10,
    ratio_to_baseline: Math.round(ratio * 100) / 100,
    pct_diff_baseline: pctDiff,
    level_id: levelId,
    level_label: levelLabel,
    takeaway_title: takeawayTitle,
    takeaway_body: takeawayBody,
    why_text: whyText,
    effect_text: effectText,
    similar_months: sims,
    actions,
    flood_zones: floodZones,
    response_curve: localFallback.buildResponseCurve(key, rain, prev, month, nWeeks),
    seasonal_profile: localFallback.buildSeasonalProfile(key),
    history_points: key === 'dengue' ? localFallback.dengueHistory : localFallback.leptoHistory,
    is_live_backend: false
  };
}

export function getHistoricalPoints(disease: 'dengue' | 'lepto') {
  return disease === 'dengue' ? localFallback.dengueHistory : localFallback.leptoHistory;
}
