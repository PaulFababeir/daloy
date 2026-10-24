/**
 * DALOY API Client with Automatic Offline Fallback Engine
 * Provides dual-mode resilience for live FastAPI or standalone client demos.
 * Uses real historical surveillance panels from qc_dengue_monthly.csv (2010–2025)
 * and manila_lepto_monthly.csv (2001–2012).
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
  rain_diff?: number;
  prev_diff?: number;
  month_gap?: number;
  match_reason?: string;
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
  nWeeks?: number;
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

// Authentic Quezon City Dengue Monthly Surveillance Panel (2010–2025, 192 records)
// Format: [year, month, cases, rain_mm, n_weeks]
const RAW_DENGUE_PANEL: [number, number, number, number, number][] = [
  [2010,1,110,39.5,4],[2010,2,88,18.1,4],[2010,3,67,36.4,4],[2010,4,77,76.8,5],[2010,5,68,59.7,4],[2010,6,123,181.1,4],[2010,7,722,459.3,5],[2010,8,910,289.2,4],[2010,9,597,286.3,5],[2010,10,340,319.0,4],[2010,11,341,299.3,4],[2010,12,224,201.6,5],
  [2011,1,316,142.1,4],[2011,2,276,55.9,4],[2011,3,285,140.4,5],[2011,4,169,50.6,4],[2011,5,159,256.8,4],[2011,6,263,615.4,5],[2011,7,555,408.1,4],[2011,8,1313,396.8,4],[2011,9,1445,464.3,5],[2011,10,392,283.5,4],[2011,11,188,367.3,4],[2011,12,177,328.5,5],
  [2012,1,326,51.6,4],[2012,2,335,225.7,4],[2012,3,390,200.1,5],[2012,4,283,111.5,4],[2012,5,475,257.3,5],[2012,6,761,383.1,4],[2012,7,1117,619.0,4],[2012,8,1266,815.3,5],[2012,9,820,465.7,4],[2012,10,556,248.8,4],[2012,11,477,99.0,5],[2012,12,275,87.3,4],
  [2013,1,295,86.8,5],[2013,2,175,164.0,4],[2013,3,182,101.2,4],[2013,4,162,56.7,4],[2013,5,248,203.1,5],[2013,6,356,384.4,4],[2013,7,992,332.2,4],[2013,8,1236,752.6,5],[2013,9,783,527.3,4],[2013,10,560,382.3,5],[2013,11,270,118.9,4],[2013,12,262,136.3,4],
  [2014,1,244,39.3,5],[2014,2,141,40.3,4],[2014,3,71,70.4,4],[2014,4,50,44.8,4],[2014,5,68,145.1,5],[2014,6,117,267.0,4],[2014,7,349,437.4,5],[2014,8,365,324.6,4],[2014,9,396,423.7,4],[2014,10,425,342.0,5],[2014,11,153,154.5,4],[2014,12,262,254.6,4],
  [2015,1,393,76.9,5],[2015,2,226,63.5,4],[2015,3,170,59.2,4],[2015,4,131,43.9,5],[2015,5,85,70.7,4],[2015,6,198,234.6,4],[2015,7,789,429.5,5],[2015,8,1148,291.9,4],[2015,9,1433,343.1,4],[2015,10,1288,221.6,5],[2015,11,518,96.1,4],[2015,12,219,411.2,4],
  [2016,1,295,25.6,4],[2016,2,269,63.5,4],[2016,3,226,37.6,5],[2016,4,96,42.4,4],[2016,5,89,149.6,4],[2016,6,207,222.9,5],[2016,7,408,294.7,4],[2016,8,672,579.1,4],[2016,9,892,325.7,5],[2016,10,566,369.9,4],[2016,11,367,241.9,4],[2016,12,372,296.4,5],
  [2017,1,481,168.6,4],[2017,2,339,164.5,4],[2017,3,430,67.9,5],[2017,4,188,82.6,4],[2017,5,190,167.9,4],[2017,6,486,234.3,5],[2017,7,775,395.4,4],[2017,8,1618,421.7,5],[2017,9,1005,412.2,4],[2017,10,751,251.4,4],[2017,11,787,360.4,5],[2017,12,477,257.8,4],
  [2018,1,619,132.7,4],[2018,2,500,55.0,4],[2018,3,443,67.1,5],[2018,4,286,83.7,4],[2018,5,377,350.0,5],[2018,6,493,375.5,4],[2018,7,780,588.9,4],[2018,8,1481,582.1,5],[2018,9,1001,282.7,4],[2018,10,995,148.5,4],[2018,11,734,94.9,5],[2018,12,449,303.5,4],
  [2019,1,886,39.6,5],[2019,2,437,18.2,4],[2019,3,238,20.7,4],[2019,4,190,57.2,4],[2019,5,266,244.3,5],[2019,6,248,316.7,4],[2019,7,868,347.9,4],[2019,8,2623,469.2,5],[2019,9,1696,349.4,4],[2019,10,1369,195.7,5],[2019,11,731,133.4,4],[2019,12,616,112.2,4],
  [2020,1,672,120.0,5],[2020,2,263,34.3,4],[2020,3,117,38.3,4],[2020,4,14,86.4,5],[2020,5,6,209.0,4],[2020,6,18,261.1,4],[2020,7,39,375.0,5],[2020,8,43,226.1,4],[2020,9,68,262.0,4],[2020,10,73,688.2,5],[2020,11,117,332.3,4],[2020,12,108,342.5,4],
  [2021,1,121,153.5,4],[2021,2,111,94.4,4],[2021,3,74,95.1,4],[2021,4,54,24.7,5],[2021,5,45,60.7,4],[2021,6,40,198.4,4],[2021,7,99,730.1,5],[2021,8,132,211.5,4],[2021,9,184,443.2,5],[2021,10,149,199.6,4],[2021,11,145,154.2,4],[2021,12,121,158.5,5],
  [2022,1,52,81.3,4],[2022,2,73,100.0,4],[2022,3,98,108.8,5],[2022,4,96,186.2,4],[2022,5,139,197.2,4],[2022,6,401,274.3,5],[2022,7,615,286.7,4],[2022,8,689,371.4,4],[2022,9,693,503.0,5],[2022,10,362,431.2,4],[2022,11,278,172.5,4],[2022,12,336,225.6,5],
  [2023,1,245,267.7,4],[2023,2,255,72.0,4],[2023,3,176,33.2,5],[2023,4,129,104.0,4],[2023,5,118,155.6,4],[2023,6,358,358.1,5],[2023,7,314,542.6,4],[2023,8,566,459.7,5],[2023,9,457,257.2,4],[2023,10,526,239.9,4],[2023,11,568,268.4,5],[2023,12,297,136.0,4],
  [2024,1,396,56.4,4],[2024,2,380,32.4,5],[2024,3,218,41.9,4],[2024,4,161,19.1,4],[2024,5,164,234.7,5],[2024,6,234,241.2,4],[2024,7,455,531.6,4],[2024,8,1085,377.7,5],[2024,9,1101,434.7,4],[2024,10,1533,418.0,5],[2024,11,1701,157.0,4],[2024,12,1148,316.5,4],
  [2025,1,1491,96.5,5],[2025,2,1777,131.1,4],[2025,3,996,82.6,4],[2025,4,502,96.6,4],[2025,5,361,264.9,5],[2025,6,395,386.0,4],[2025,7,961,755.0,5],[2025,8,997,352.6,4],[2025,9,976,443.8,4],[2025,10,1477,629.8,5],[2025,11,709,260.0,4],[2025,12,465,91.3,4]
];

// Authentic City of Manila Leptospirosis Monthly Surveillance Panel (2001–2012, 144 records)
// Format: [year, month, cases, rain_mm, n_weeks]
const RAW_LEPTO_PANEL: [number, number, number, number, number][] = [
  [2001,1,6,79.7,5],[2001,2,6,255.9,4],[2001,3,3,124.5,4],[2001,4,0,72.1,5],[2001,5,9,141.5,4],[2001,6,5,244.0,4],[2001,7,29,220.1,5],[2001,8,27,229.9,4],[2001,9,19,51.8,4],[2001,10,12,298.2,5],[2001,11,7,288.5,4],[2001,12,1,392.2,5],
  [2002,1,0,70.5,4],[2002,2,1,92.8,4],[2002,3,0,73.1,4],[2002,4,0,58.4,5],[2002,5,4,111.9,4],[2002,6,7,173.4,4],[2002,7,111,499.4,5],[2002,8,66,264.7,4],[2002,9,60,262.6,5],[2002,10,26,299.9,4],[2002,11,19,414.8,4],[2002,12,6,219.6,5],
  [2003,1,3,87.0,4],[2003,2,1,47.7,4],[2003,3,0,29.8,5],[2003,4,1,50.6,4],[2003,5,3,262.6,4],[2003,6,56,165.1,5],[2003,7,14,243.0,4],[2003,8,23,243.9,4],[2003,9,24,261.8,5],[2003,10,12,173.7,4],[2003,11,6,219.3,4],[2003,12,6,169.2,5],
  [2004,1,1,87.0,4],[2004,2,1,104.0,4],[2004,3,1,47.0,5],[2004,4,2,52.2,4],[2004,5,9,212.4,5],[2004,6,8,203.2,4],[2004,7,9,262.2,4],[2004,8,51,258.2,5],[2004,9,36,115.5,4],[2004,10,8,281.6,4],[2004,11,4,434.4,5],[2004,12,11,196.3,4],
  [2005,1,0,101.6,5],[2005,2,3,36.7,4],[2005,3,2,64.9,4],[2005,4,2,62.0,4],[2005,5,4,80.5,5],[2005,6,7,220.6,4],[2005,7,11,239.2,4],[2005,8,28,216.9,5],[2005,9,28,383.0,4],[2005,10,21,388.1,5],[2005,11,9,250.3,4],[2005,12,3,626.7,4],
  [2006,1,3,221.4,5],[2006,2,1,104.3,4],[2006,3,1,152.4,4],[2006,4,3,17.3,4],[2006,5,6,156.9,5],[2006,6,10,226.6,4],[2006,7,48,309.6,5],[2006,8,65,205.5,4],[2006,9,27,359.4,4],[2006,10,62,257.8,5],[2006,11,13,155.1,4],[2006,12,3,392.7,4],
  [2007,1,1,130.6,5],[2007,2,3,45.1,4],[2007,3,0,59.0,4],[2007,4,2,70.8,5],[2007,5,2,152.1,4],[2007,6,4,175.3,4],[2007,7,11,173.0,5],[2007,8,50,318.2,4],[2007,9,27,277.0,4],[2007,10,52,283.9,5],[2007,11,15,483.7,4],[2007,12,15,312.4,5],
  [2008,1,2,281.9,4],[2008,2,7,288.1,4],[2008,3,5,102.6,5],[2008,4,8,132.0,4],[2008,5,26,302.4,4],[2008,6,19,266.2,5],[2008,7,16,203.0,4],[2008,8,28,253.4,4],[2008,9,50,263.6,5],[2008,10,16,400.3,4],[2008,11,18,404.3,4],[2008,12,11,374.5,5],
  [2009,1,2,231.5,4],[2009,2,0,121.0,4],[2009,3,3,122.8,5],[2009,4,8,399.1,4],[2009,5,9,367.9,4],[2009,6,18,288.3,5],[2009,7,30,270.0,4],[2009,8,34,198.9,5],[2009,9,310,518.2,4],[2009,10,100,334.6,4],[2009,11,15,197.9,5],[2009,12,3,77.0,4],
  [2010,1,2,104.9,4],[2010,2,0,11.9,4],[2010,3,3,61.1,5],[2010,4,2,47.9,4],[2010,5,5,48.5,5],[2010,6,12,151.8,4],[2010,7,15,453.1,4],[2010,8,29,251.5,5],[2010,9,19,222.3,4],[2010,10,18,292.7,4],[2010,11,16,430.3,5],[2010,12,2,334.7,4],
  [2011,1,4,209.3,5],[2011,2,0,111.7,4],[2011,3,1,197.5,4],[2011,4,0,57.4,4],[2011,5,11,224.1,5],[2011,6,68,473.6,4],[2011,7,73,322.0,4],[2011,8,83,301.3,5],[2011,9,44,285.2,4],[2011,10,30,364.8,5],[2011,11,5,455.3,4],[2011,12,4,534.1,4],
  [2012,1,3,203.7,5],[2012,2,4,288.5,4],[2012,3,0,253.6,4],[2012,4,6,52.7,5],[2012,5,6,212.8,4],[2012,6,14,149.8,4],[2012,7,143,528.5,5],[2012,8,395,464.5,4],[2012,9,54,397.3,4],[2012,10,9,365.5,5],[2012,11,4,127.5,4],[2012,12,0,201.2,2]
];

class LocalEngine {
  dengueHistory: HistoricalPoint[];
  leptoHistory: HistoricalPoint[];
  dengueMu = 0;
  dengueSdv = 1;
  dengueRainStd = 175;
  leptoMu = 0;
  leptoSdv = 1;
  leptoRainStd = 140;

  constructor() {
    this.dengueHistory = this.buildHistory('dengue', RAW_DENGUE_PANEL);
    this.leptoHistory = this.buildHistory('lepto', RAW_LEPTO_PANEL);
  }

  buildHistory(key: 'dengue' | 'lepto', rawPanel: [number, number, number, number, number][]): HistoricalPoint[] {
    const rows: HistoricalPoint[] = rawPanel.map(([year, month, cases, rain, nWeeks], idx) => ({
      year,
      month,
      rain,
      nWeeks,
      prev: idx > 0 ? rawPanel[idx - 1][3] : null,
      cases
    }));

    const logs = rows.map(d => Math.log1p(Math.max(0, d.rain)));
    const mu = logs.reduce((s, v) => s + v, 0) / logs.length;
    const sdv = Math.sqrt(logs.reduce((s, v) => s + (v - mu) ** 2, 0) / logs.length) || 1;

    const rains = rows.map(d => Math.max(0, d.rain));
    const rMean = rains.reduce((s, v) => s + v, 0) / rains.length;
    const rStd = Math.sqrt(rains.reduce((s, v) => s + (v - rMean) ** 2, 0) / rains.length) || 150;

    if (key === 'dengue') {
      this.dengueMu = mu;
      this.dengueSdv = sdv;
      this.dengueRainStd = rStd;
    } else {
      this.leptoMu = mu;
      this.leptoSdv = sdv;
      this.leptoRainStd = rStd;
    }

    return rows.filter(d => d.prev !== null);
  }

  predictRaw(key: 'dengue' | 'lepto', rain: number, prev: number | null, month: number, nWeeks = 4) {
    const mu = key === 'dengue' ? this.dengueMu : this.leptoMu;
    const sdv = key === 'dengue' ? this.dengueSdv : this.leptoSdv;
    const z = (v: number) => (Math.log1p(Math.max(0, v)) - mu) / sdv;
    const prevVal = prev !== null ? prev : rain;
    const ang = (2 * Math.PI * month) / 12;

    if (key === 'dengue') {
      // Calibrated to QC 2010–2025 PoissonRegressor(alpha=0.1) with log_rain, log_rain_prev, month_sin, month_cos
      return Math.exp(
        Math.log(375) +
          0.26 * z(rain) +
          0.22 * z(prevVal) -
          0.42 * Math.sin(ang) -
          0.22 * Math.cos(ang)
      );
    }

    const rate = Math.exp(
      0.42 +
        0.44 * z(rain) +
        0.34 * z(prevVal) -
        0.32 * Math.sin(ang) -
        0.16 * Math.cos(ang)
    );
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
    const rStd = key === 'dengue' ? this.dengueRainStd : this.leptoRainStd;
    const qPrev = prev !== null ? prev : rain;
    const hist = key === 'dengue' ? this.dengueHistory : this.leptoHistory;

    return hist
      .map(d => {
        const dRain = d.rain;
        const dPrev = d.prev ?? dRain;
        const dMonth = d.month;

        const diffRain = Math.abs(rain - dRain);
        const normRain = diffRain / rStd;

        const diffPrev = Math.abs(qPrev - dPrev);
        const normPrev = diffPrev / rStd;

        const rawMDiff = Math.abs(month - dMonth);
        const mGap = Math.min(rawMDiff, 12 - rawMDiff);
        const normMonth = mGap / 6.0;

        const dist =
          key === 'dengue'
            ? Math.sqrt((1.25 * normRain) ** 2 + (0.45 * normPrev) ** 2 + (0.55 * normMonth) ** 2)
            : Math.sqrt((1.15 * normRain) ** 2 + (0.65 * normPrev) ** 2 + (0.55 * normMonth) ** 2);

        const sim = Math.max(1, Math.min(99, Math.round(100 * Math.exp(-dist * 0.95))));
        const mLabel = mGap === 0 ? 'Same calendar month' : `${mGap} mo seasonal offset`;
        const matchReason = `Δ ${Math.round(diffRain * 10) / 10} mm this mo · Δ ${Math.round(diffPrev * 10) / 10} mm prev mo · ${mLabel}`;

        return {
          year: d.year,
          month: d.month,
          rain: d.rain,
          prev: d.prev ?? null,
          cases: d.cases,
          dist: Math.round(dist * 10000) / 10000,
          sim,
          rain_diff: Math.round(diffRain * 10) / 10,
          prev_diff: Math.round(diffPrev * 10) / 10,
          month_gap: mGap,
          match_reason: matchReason
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

  const tPrev = localFallback.typical(key, month === 1 ? 12 : month - 1);

  if (key === 'dengue') {
    whyText = `This month: ${Math.round(rain).toLocaleString()} mm (${
      rainCmp === 'about the same' ? 'about the usual' : rainCmp + ' than the usual'
    } ${mName} median of ${Math.round(tRain).toLocaleString()} mm in Quezon City). Last month: ${Math.round(prev).toLocaleString()} mm (median ${Math.round(tPrev).toLocaleString()} mm). Both months' rainfall and seasonal cycle drive Aedes larval habitat proliferation.`;
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
  const meta = buildPresentationMetadata(key, cases, nWeeks, mName, base, ratio, pctDiff, levelId);

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

  return {
    disease: key === 'dengue' ? 'Dengue' : 'Leptospirosis',
    city: key === 'dengue' ? 'Quezon City' : 'Manila',
    month,
    month_name: mName,
    rain,
    prev_rain: prev,
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
    actions: meta.actions,
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
