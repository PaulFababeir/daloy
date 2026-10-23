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
}

export interface FloodZone {
  name: string;
  risk: string;
  level: number;
  desc: string;
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
  ci_lower: number;
  ci_upper: number;
  baseline_cases: number;
  ratio_to_baseline: number;
  pct_diff_baseline: number;
  level_id: 'low' | 'typ' | 'up' | 'high';
  level_label: string;
  why_text: string;
  effect_text: string;
  similar_months: SimilarMonth[];
  actions: ActionItem[];
  flood_zones: FloodZone[];
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
  dengueHistory: any[];
  leptoHistory: any[];
  dengueMu = 0;
  dengueSdv = 1;
  leptoMu = 0;
  leptoSdv = 1;

  constructor() {
    this.dengueHistory = this.buildHistory('dengue', 11, [2010, 2025]);
    this.leptoHistory = this.buildHistory('lepto', 29, [2001, 2012]);
  }

  buildHistory(key: 'dengue' | 'lepto', seed: number, years: [number, number]) {
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
        const f = feat(d.rain, d.prev, d.month);
        const dist = Math.sqrt(f.reduce((s, v, i) => s + (v - q[i]) ** 2, 0));
        return {
          year: d.year,
          month: d.month,
          rain: d.rain,
          prev: d.prev,
          cases: d.cases,
          dist,
          sim: Math.round(100 * Math.exp(-dist * 1.2))
        };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k);
  }
}

const localFallback = new LocalEngine();

export async function fetchPrediction(payload: PredictPayload): Promise<PredictionResult> {
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return { ...data, is_live_backend: true };
    }
  } catch {
    // Backend unreachable, run seamless local engine fallback
  }

  // Local fallback execution
  const key = payload.disease;
  const rain = payload.rain;
  const prev = payload.prev_rain !== undefined ? payload.prev_rain : rain;
  const month = payload.month;
  const nWeeks = payload.n_weeks || 4;

  const rawPred = localFallback.predictRaw(key, rain, prev, month, nWeeks);
  const cases = Math.max(0, Math.round(rawPred));
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

  if (key === 'dengue') {
    whyText = `${Math.round(rain).toLocaleString()} mm is ${
      rainCmp === 'about the same' ? 'about the usual' : rainCmp + ' than the usual'
    } ${mName} rainfall in Quezon City (median ${Math.round(tRain).toLocaleString()} mm). In the model, more rain in a month correlates with more dengue cases.`;
    const up = localFallback.predictRaw(key, rain + 100, prev, month, nWeeks);
    const eff = Math.round((up / rawPred - 1.0) * 100);
    effectText = `At this rainfall level, each extra 100 mm adds about ${eff}% more cases (≈ ${Math.round(up - rawPred)} cases).`;
  } else {
    const tPrev = localFallback.typical(key, month === 1 ? 12 : month - 1);
    whyText = `This month: ${Math.round(rain).toLocaleString()} mm (usual ${Math.round(tRain).toLocaleString()} mm). Last month: ${Math.round(prev).toLocaleString()} mm (usual ${Math.round(tPrev).toLocaleString()} mm). Leptospirosis follows heavy rain and flooding by about 2 weeks.`;
    effectText = `Estimate = predicted weekly rate × ${nWeeks} case weeks.`;
  }

  const sims = localFallback.similar(key, rain, prev, month, 4);

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
        { i: '4S', t: 'Search and destroy breeding sites', d: 'Run barangay clean-ups of containers, gutters and tires that hold water.', w: 'Barangay health workers' },
        { i: 'Rx', t: 'Check clinic supplies', d: 'Confirm stocks of NS1 rapid tests, oral rehydration salts and paracetamol.', w: 'City health office' },
        ...(levelId === 'up' || levelId === 'high' ? [
          { i: 'IV', t: 'Prepare hospital fast lanes', d: 'Pre-position IV fluids and alert hospitals to open dengue fast lanes.', w: 'Hospitals' },
          { i: '!', t: 'Issue a public advisory', d: 'Remind residents of warning signs and when to go to a health center.', w: 'Public information office' }
        ] : [])
      ]
    : [
        { i: '!', t: 'Warn against wading', d: 'Advise residents to avoid floodwater and wear boots if exposure is unavoidable.', w: 'Public information office' },
        { i: 'Rx', t: 'Check doxycycline stocks', d: 'Confirm health centers can give doxycycline prophylaxis after flood exposure.', w: 'City health office' },
        ...(levelId === 'up' || levelId === 'high' ? [
          { i: 'Dx', t: 'Distribute prophylaxis', d: 'Give doxycycline to residents and responders exposed to floodwater, per DOH guidance.', w: 'Health centers' },
          { i: 'H', t: 'Ready kidney care', d: 'Alert hospitals to expect admissions in about 2 weeks and to prepare dialysis capacity.', w: 'Hospitals' }
        ] : [])
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
    ci_lower: lo,
    ci_upper: hi,
    baseline_cases: Math.round(base * 10) / 10,
    ratio_to_baseline: Math.round(ratio * 100) / 100,
    pct_diff_baseline: pctDiff,
    level_id: levelId,
    level_label: levelLabel,
    why_text: whyText,
    effect_text: effectText,
    similar_months: sims,
    actions,
    flood_zones: floodZones,
    is_live_backend: false
  };
}

export function getHistoricalPoints(disease: 'dengue' | 'lepto') {
  return disease === 'dengue' ? localFallback.dengueHistory : localFallback.leptoHistory;
}
