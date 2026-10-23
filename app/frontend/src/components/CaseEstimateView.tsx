import React, { useState, useCallback } from 'react';
import {
  PredictionResult,
  getHistoricalPoints,
  MONTH_NAMES
} from '../services/api';
import { NCRCityPolygon } from './metroManilaData';
import { ScatterChart } from './ScatterChart';
import { FloodZonesCard } from './FloodZonesCard';
import { ActionSummaryReport } from './ActionSummaryReport';
import {
  CloudRain,
  History,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  MapPin,
  BarChart3,
  UploadCloud,
  X,
  Cpu,
  Clock,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  AlertTriangle,
  Activity,
  FileText
} from 'lucide-react';

interface CaseEstimateViewProps {
  activeDisease: 'dengue' | 'lepto';
  onDiseaseChange: (disease: 'dengue' | 'lepto') => void;
  month: number;
  onMonthChange: (m: number) => void;
  rainfall: number;
  onRainfallChange: (val: number) => void;
  prevRain: number;
  onPrevRainChange: (val: number) => void;
  nWeeks: number;
  onNWeeksChange: (val: number) => void;
  result: PredictionResult | null;
  inspectedCity: NCRCityPolygon | null;
  onClearCity: () => void;
  onOpenUploadForCity: () => void;
  showAnalyticsModal: boolean;
  onToggleAnalyticsModal: (show: boolean) => void;
  theme?: 'light' | 'dark';
}

export const CaseEstimateView: React.FC<CaseEstimateViewProps> = ({
  activeDisease,
  onDiseaseChange,
  month,
  onMonthChange,
  rainfall,
  onRainfallChange,
  prevRain,
  onPrevRainChange,
  nWeeks,
  onNWeeksChange,
  result,
  inspectedCity,
  onClearCity,
  onOpenUploadForCity,
  showAnalyticsModal,
  onToggleAnalyticsModal,
  theme = 'dark'
}) => {
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [showSummaryReport, setShowSummaryReport] = useState<boolean>(false);

  const fallbackHistory = getHistoricalPoints(activeDisease);
  const history = result?.history_points || fallbackHistory;

  const fallbackPredictFn = useCallback(
    (r: number) =>
      activeDisease === 'dengue'
        ? Math.exp(Math.log(170) + 0.42 * ((Math.log1p(r) - 5.0) / 1.1))
        : Math.exp(0.35 + 0.38 * ((Math.log1p(r) - 5.0) / 1.1)) * nWeeks,
    [activeDisease, nWeeks]
  );

  const handlePreset = (multiplier: number, fixedMin?: number) => {
    const baseRain = 250;
    const computed = fixedMin ? Math.max(baseRain * multiplier, fixedMin) : baseRain * multiplier;
    onRainfallChange(Math.round(computed));
  };

  const toggleActionCheck = (key: string) => {
    setCheckedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyBrief = () => {
    if (!result) return;
    const weekly = result.weekly_rate ?? Math.round((result.predicted_cases / Math.max(1, result.n_weeks)) * 10) / 10;
    const lines = [
      `DALOY SITUATION BRIEF — ${result.disease.toUpperCase()} NOWCAST`,
      `Target LGU: ${result.city} | Period: ${result.month_name} (${result.n_weeks} case weeks)`,
      `Meteorological Input: ${result.rain} mm${result.prev_rain !== null ? ` (Prev month: ${result.prev_rain} mm)` : ''}`,
      `----------------------------------------`,
      `MODEL PREDICTION: ${result.predicted_cases.toLocaleString()} cases (95% CI: ${result.ci_lower}–${result.ci_upper})`,
      `Weekly Velocity: ~${weekly} cases/week`,
      `Risk Tier: ${result.level_label.toUpperCase()} (${result.pct_diff_baseline >= 0 ? '+' : ''}${result.pct_diff_baseline}% vs. ${result.month_name} mean of ${Math.round(result.baseline_cases)})`,
      `What This Means: ${result.takeaway_title || result.level_label} — ${result.takeaway_body || result.why_text}`,
      `----------------------------------------`,
      `OPERATIONAL ACTION PROTOCOL:`,
      ...result.actions.map(
        (a, idx) =>
          `${idx + 1}. [${a.urgency || 'Immediate'}] ${a.t} (${a.w})\n   Target: ${a.metric || a.d}\n   Hotspots: ${a.target_zones || result.city}`
      )
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2200);
  };

  const isDark = theme === 'dark';

  // Dynamic theme classes matching bottom dock pattern
  const cardCls = isDark
    ? 'bg-slate-900/90 text-white border-slate-700/80 shadow-2xl'
    : 'bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-xl';

  const insetCls = isDark
    ? 'bg-slate-800/70 text-slate-200 border-slate-700/60'
    : 'bg-[#F4EFE6] text-stone-800 border-[#E7E1D6]';

  const headingCls = isDark ? 'text-white' : 'text-stone-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-stone-600';
  const subCls = isDark ? 'text-slate-300' : 'text-stone-700';
  const borderCls = isDark ? 'border-slate-800' : 'border-[#E7E1D6]';

  const weeklyRate = result
    ? result.weekly_rate ?? Math.round((result.predicted_cases / Math.max(1, result.n_weeks)) * 10) / 10
    : 0;

  const getTakeawayBannerStyle = (levelId: string) => {
    if (levelId === 'high') {
      return isDark
        ? 'bg-rose-950/65 border-rose-500/40 text-rose-100'
        : 'bg-rose-50 border-rose-300 text-rose-950';
    }
    if (levelId === 'up') {
      return isDark
        ? 'bg-amber-950/60 border-amber-500/40 text-amber-100'
        : 'bg-amber-50 border-amber-300 text-amber-950';
    }
    return isDark
      ? 'bg-teal-950/55 border-teal-500/35 text-teal-100'
      : 'bg-teal-50/90 border-teal-300 text-teal-950';
  };

  const getPriorityBadgeStyle = (priority?: string) => {
    if (priority === 'critical') {
      return isDark
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        : 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (priority === 'high') {
      return isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-900 border-amber-300';
    }
    return isDark
      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      : 'bg-teal-100 text-teal-900 border-teal-300';
  };

  return (
    <>
      {/* LEFT FLOATING HUD DOCK: Scenario Controls & Metro Manila City Inspector */}
      <aside className="fixed top-20 left-4 z-20 w-[340px] sm:w-[375px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-3 pointer-events-auto pr-1">
        {/* Disease & Target City Switcher Card */}
        <div className={`p-4 rounded-3xl backdrop-blur-xl border transition-colors ${cardCls}`}>
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
              Active Metro Manila Target
            </span>
            <span className={`text-[10px] font-mono font-semibold ${isDark ? 'text-teal-400' : 'text-stone-600'}`}>
              2 of 17 NCR Cities Colored
            </span>
          </div>

          <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${insetCls}`}>
            <button
              onClick={() => onDiseaseChange('dengue')}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                activeDisease === 'dengue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700/60' : 'text-stone-700 hover:text-stone-900 hover:bg-[#EAE3D6]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Dengue
              </div>
              <span className="text-[10px] opacity-85">Quezon City (2010–2025)</span>
            </button>

            <button
              onClick={() => onDiseaseChange('lepto')}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                activeDisease === 'lepto'
                  ? 'bg-teal-700 text-white shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700/60' : 'text-stone-700 hover:text-stone-900 hover:bg-[#EAE3D6]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Leptospirosis
              </div>
              <span className="text-[10px] opacity-85">City of Manila (2001–2012)</span>
            </button>
          </div>
        </div>

        {/* Scenario Inputs Card */}
        <div className={`p-5 rounded-3xl backdrop-blur-xl border space-y-4 transition-colors ${cardCls}`}>
          <div className={`flex items-center justify-between pb-3 border-b ${borderCls}`}>
            <div>
              <h2 className={`text-sm font-extrabold ${headingCls}`}>
                Meteorological Inputs
              </h2>
              <p className={`text-[11px] ${mutedCls}`}>
                Updates city elevation &amp; expected cases live
              </p>
            </div>
            <CloudRain className="w-4 h-4 text-sky-500" />
          </div>

          {/* Calendar Month */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${mutedCls}`}>
              Calendar Month
            </label>
            <select
              value={month}
              onChange={e => onMonthChange(Number(e.target.value))}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-white'
                  : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900'
              }`}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Current Month Rainfall */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${mutedCls}`}>
                This Month&apos;s Rainfall
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={1500}
                  value={rainfall}
                  onChange={e => onRainfallChange(Number(e.target.value))}
                  className={`w-18 px-2 py-0.5 text-right text-xs font-mono font-bold rounded-lg border ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900'
                  }`}
                />
                <span className={`text-[11px] font-semibold ${mutedCls}`}>mm</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={1200}
              step={10}
              value={rainfall}
              onChange={e => onRainfallChange(Number(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'
              } ${
                activeDisease === 'dengue' ? 'accent-rose-600' : isDark ? 'accent-teal-500' : 'accent-teal-700'
              }`}
            />

            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              <button
                onClick={() => handlePreset(0.3)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                    : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                }`}
              >
                Dry (75)
              </button>
              <button
                onClick={() => handlePreset(1.0)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                    : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                }`}
              >
                Typical
              </button>
              <button
                onClick={() => handlePreset(1.8)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                    : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                }`}
              >
                Wet (450)
              </button>
              <button
                onClick={() => handlePreset(2.6, 680)}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/25 transition"
              >
                Typhoon
              </button>
            </div>
          </div>

          {/* Lagged Previous Month Rainfall (used by both Dengue & Leptospirosis models) */}
          <div className={`pt-3 border-t ${borderCls} space-y-3`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${
                  activeDisease === 'dengue'
                    ? isDark ? 'text-rose-400' : 'text-stone-700'
                    : isDark ? 'text-teal-400' : 'text-stone-700'
                }`}>
                  Last Month&apos;s Rainfall
                </label>
                <span className={`text-xs font-mono font-bold ${
                  activeDisease === 'dengue'
                    ? isDark ? 'text-rose-300' : 'text-stone-900'
                    : isDark ? 'text-teal-300' : 'text-stone-900'
                }`}>
                  {prevRain} mm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1200}
                step={10}
                value={prevRain}
                onChange={e => onPrevRainChange(Number(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                  isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'
                } ${
                  activeDisease === 'dengue'
                    ? 'accent-rose-600'
                    : isDark ? 'accent-teal-500' : 'accent-teal-700'
                }`}
              />
            </div>

            {activeDisease === 'lepto' && (
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${mutedCls}`}>
                  Case Weeks:
                </span>
                <div className="flex gap-1.5">
                  {[4, 5].map(w => (
                    <button
                      key={w}
                      onClick={() => onNWeeksChange(w)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        nWeeks === w
                          ? isDark ? 'bg-teal-600 text-white' : 'bg-stone-900 text-white'
                          : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6]'
                      }`}
                    >
                      {w} wks
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formula Accordion */}
          <div className="pt-1">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className={`flex items-center justify-between w-full text-[11px] font-semibold transition ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Model specification &amp; features</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showFormula ? 'rotate-180' : ''}`}
              />
            </button>
            {showFormula && (
              <div className={`mt-2 p-3 rounded-2xl text-[11px] space-y-1 border ${insetCls}`}>
                {activeDisease === 'dengue' ? (
                  <>
                    <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      StandardScaler + PoissonRegressor(α = 0.1)
                    </div>
                    <p>
                      Features: log(1+rain), log(1+prev_rain), sin/cos(2πm/12). Trained on Quezon City 2010–2025 monthly surveillance.
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                      HistGradientBoostingRegressor(loss=&quot;poisson&quot;)
                    </div>
                    <p>
                      Features: log(1+rain), log(1+prev_rain), sin/cos(2πm/12) × case weeks. Trained on Manila 2001–2012 monthly admissions.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metro Manila City Inspector Card (Works for all 17 NCR cities) */}
        <div className={`p-4 rounded-3xl backdrop-blur-xl border transition-colors ${cardCls}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                Metro Manila City Inspector
              </h3>
            </div>
            {inspectedCity && (
              <button
                onClick={onClearCity}
                className={`text-[11px] ${isDark ? 'text-slate-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Reset
              </button>
            )}
          </div>

          {inspectedCity ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-extrabold text-sm ${headingCls}`}>
                  {inspectedCity.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inspectedCity.focusId === 'dengue'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                      : inspectedCity.focusId === 'lepto'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                      : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-[#F4EFE6] text-stone-700 border border-[#E7E1D6]'
                  }`}
                >
                  {inspectedCity.isFocus ? 'In Model Scope' : 'Grayscale · Out of Scope'}
                </span>
              </div>

              <div className={`text-[11px] flex items-center justify-between font-mono ${mutedCls}`}>
                <span>{inspectedCity.district}</span>
                <span>{inspectedCity.areaKm2} km²</span>
              </div>

              <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${insetCls}`}>
                <div>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>Basin: </span>
                  <span className={subCls}>{inspectedCity.riverBasin}</span>
                </div>
                <div>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>Flood-Prone Zones: </span>
                  <span className={subCls}>{inspectedCity.floodHotspots}</span>
                </div>
              </div>

              {!inspectedCity.isFocus && (
                <button
                  onClick={onOpenUploadForCity}
                  className={`w-full mt-1 py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload CSV for {inspectedCity.name}</span>
                </button>
              )}
            </div>
          ) : (
            <p className={`text-[11px] leading-relaxed ${mutedCls}`}>
              <strong>Quezon City</strong> (Rose) and <strong>City of Manila</strong> (Teal) are colored with active model data. Hover or click any of the <strong>17 Metro Manila cities</strong> on the map to inspect its river basin and flood hotspots.
            </p>
          )}
        </div>
      </aside>

      {/* RIGHT FLOATING HUD DOCK: Emphasized Model Results, Clinical Meaning & Priority Action */}
      {result && (
        <aside className="fixed top-20 right-4 z-20 w-[350px] sm:w-[400px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-3 pointer-events-auto pl-1">
          {/* Primary Model Results & "What This Means" Card */}
          <div className={`p-5 rounded-3xl backdrop-blur-xl border relative overflow-hidden transition-colors ${cardCls}`}>
            <div
              className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25"
              style={{
                backgroundColor: activeDisease === 'dengue' ? '#E11D48' : '#0D9488'
              }}
            />

            {/* Header & Severity Pill */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Cpu className={`w-3.5 h-3.5 ${activeDisease === 'dengue' ? 'text-rose-500' : 'text-teal-500'}`} />
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    {result.model_name || (activeDisease === 'dengue' ? 'Poisson GLM Nowcast' : 'HistGradientBoosting ML')}
                  </span>
                </div>
                <h3 className={`text-base font-extrabold mt-0.5 ${headingCls}`}>
                  {result.city} · {result.month_name}
                </h3>
              </div>

              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 border ${
                  result.level_id === 'high'
                    ? 'bg-rose-500/20 text-rose-700 border-rose-300 dark:text-rose-300 dark:border-rose-500/40'
                    : result.level_id === 'up'
                    ? 'bg-amber-500/20 text-amber-800 border-amber-300 dark:text-amber-300 dark:border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-800 border-emerald-300 dark:text-teal-300 dark:border-teal-500/40'
                }`}
              >
                {result.level_label}
              </span>
            </div>

            {/* Hero Case Number & Model Array Output */}
            <div className={`p-3.5 rounded-2xl border mb-3 ${insetCls}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2.5">
                  <span className={`text-5xl font-extrabold tracking-tight font-mono leading-none ${headingCls}`}>
                    {result.predicted_cases.toLocaleString()}
                  </span>
                  <div>
                    <div className={`text-xs font-extrabold ${headingCls}`}>
                      predicted {result.disease.toLowerCase()} cases
                    </div>
                    <div className={`font-mono text-[11px] ${mutedCls}`}>
                      95% CI: {result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()} cases
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Output Breakdown Strip (Weekly Velocity & Raw Array Output) */}
              <div className={`grid grid-cols-2 gap-2 pt-2.5 mt-2.5 border-t ${borderCls} text-[11px]`}>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${mutedCls}`}>
                    Weekly Admission Velocity
                  </span>
                  <span className={`font-mono font-extrabold ${headingCls}`}>
                    ~{weeklyRate} cases/wk{' '}
                    <span className={`font-normal ${mutedCls}`}>({result.n_weeks} wks)</span>
                  </span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${mutedCls}`}>
                    Raw Model Output
                  </span>
                  <span className={`font-mono font-extrabold ${activeDisease === 'dengue' ? 'text-rose-600 dark:text-rose-400' : 'text-teal-700 dark:text-teal-300'}`}>
                    [{result.predicted_cases}.] → {result.predicted_cases} cases
                  </span>
                </div>
              </div>
            </div>

            {/* BOLD "WHAT THIS MEANS" CLINICAL & OPERATIONAL TAKEAWAY BANNER */}
            <div className={`p-3.5 rounded-2xl border mb-3 ${getTakeawayBannerStyle(result.level_id)}`}>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider opacity-85 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>What This Result Means</span>
              </div>
              <div className="text-xs font-extrabold leading-snug mb-1">
                {result.takeaway_title || `${result.level_label} (${result.ratio_to_baseline.toFixed(1)}x Normal Load)`}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {result.takeaway_body || result.why_text}
              </p>
            </div>

            {/* Baseline comparison bar */}
            <div className={`p-3 rounded-2xl border space-y-2 ${insetCls}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={subCls}>
                  vs. {result.month_name} Baseline ({Math.round(result.baseline_cases)} avg)
                </span>
                <span
                  className={`font-mono font-extrabold ${
                    result.pct_diff_baseline > 15
                      ? 'text-rose-600 dark:text-rose-400'
                      : result.pct_diff_baseline < -15
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : headingCls
                  }`}
                >
                  {result.pct_diff_baseline >= 0 ? '+' : ''}
                  {result.pct_diff_baseline}% ({result.ratio_to_baseline.toFixed(1)}x)
                </span>
              </div>
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'}`}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (result.predicted_cases /
                        (Math.max(result.predicted_cases, result.baseline_cases, 1) * 1.15)) *
                        100
                    )}%`,
                    backgroundColor: activeDisease === 'dengue' ? '#E11D48' : '#0D9488'
                  }}
                />
              </div>
              <div className="flex items-start gap-1.5 pt-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <span className={`leading-snug ${mutedCls}`}>
                  {result.why_text}
                </span>
              </div>
            </div>

            {/* #1 Priority Action Preview directly on Right HUD */}
            {result.actions && result.actions.length > 0 && (
              <div className={`mt-3 p-3 rounded-2xl border ${insetCls}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    #1 Priority Action Directive
                  </span>
                  {result.actions[0].urgency && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getPriorityBadgeStyle(result.actions[0].priority)}`}>
                      {result.actions[0].urgency}
                    </span>
                  )}
                </div>
                <div className={`text-xs font-extrabold ${headingCls}`}>
                  {result.actions[0].t}
                </div>
                <div className={`text-[11px] font-mono font-semibold mt-0.5 ${activeDisease === 'dengue' ? 'text-rose-600 dark:text-rose-400' : 'text-teal-700 dark:text-teal-300'}`}>
                  {result.actions[0].metric || result.actions[0].d}
                </div>
              </div>
            )}
          </div>

          {/* Button to Open Full Charts, Flood Zones & LGU Action Protocol Overlay */}
          <button
            onClick={() => onToggleAnalyticsModal(true)}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition ${
              isDark
                ? 'bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white shadow-teal-500/20'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-300/40'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${isDark ? 'text-sky-300' : 'text-amber-300'}`} />
            <span>Open Response Curve, Seasonal Profile &amp; Action Plan</span>
          </button>

          {/* Most Similar Past Month Card */}
          {result.similar_months && result.similar_months.length > 0 && (
            <div className={`p-4 rounded-3xl backdrop-blur-xl border transition-colors ${cardCls}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                    Historical Outbreak Analogues
                  </h3>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'text-amber-300 bg-amber-500/15 border-transparent'
                    : 'text-amber-800 bg-amber-100 border-amber-200'
                }`}>
                  {result.similar_months[0].sim}% match
                </span>
              </div>

              {(() => {
                const top = result.similar_months[0];
                return (
                  <div className={`p-3 rounded-2xl border mb-2 ${insetCls}`}>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-sm font-extrabold ${headingCls}`}>
                        {MONTH_NAMES[top.month - 1]} {top.year}
                      </span>
                      <span className={`text-xs font-mono font-extrabold ${isDark ? 'text-teal-400' : 'text-stone-900'}`}>
                        {top.cases.toLocaleString()} actual cases
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 font-mono ${mutedCls}`}>
                      Rain: {top.rain} mm
                      {top.prev !== null ? ` · Prev: ${top.prev} mm` : ''}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-1.5">
                {result.similar_months.slice(1).map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-[10px] border ${
                      isDark
                        ? 'bg-slate-800/50 text-slate-300 border-slate-800'
                        : 'bg-[#F4EFE6] text-stone-800 border-[#E7E1D6]'
                    }`}
                  >
                    <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>
                      {MONTH_NAMES[s.month - 1].slice(0, 3)} {s.year}
                    </div>
                    <div className={`font-mono ${mutedCls}`}>{s.cases} cases</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* FLOATING ANALYTICS, FLOOD ZONES & LGU ACTIONS MODAL OVERLAY */}
      {showAnalyticsModal && result && (
        <div className={`fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pointer-events-auto transition-colors ${
          isDark ? 'bg-slate-950/85' : 'bg-stone-900/55'
        }`}>
          <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 transition-colors ${
            isDark
              ? 'bg-slate-900 text-white border-slate-800 shadow-black/60'
              : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-start justify-between gap-4 pb-4 border-b ${borderCls}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-teal-400' : 'text-stone-500'}`}>
                    Deep-Dive Analytics &amp; Operational Action Protocol
                  </span>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      result.level_id === 'high'
                        ? 'bg-rose-500/20 text-rose-700 border-rose-300 dark:text-rose-300 dark:border-rose-500/40'
                        : result.level_id === 'up'
                        ? 'bg-amber-500/20 text-amber-800 border-amber-300 dark:text-amber-300 dark:border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-800 border-emerald-300 dark:text-teal-300 dark:border-teal-500/40'
                    }`}
                  >
                    {result.level_label}
                  </span>
                </div>
                <h2 className={`text-xl font-extrabold mt-1 ${headingCls}`}>
                  {result.disease} Nowcast · {result.city} ({result.month_name})
                </h2>
              </div>
              <button
                onClick={() => onToggleAnalyticsModal(false)}
                className={`p-2 rounded-xl border transition ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent'
                    : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6] border-[#E7E1D6]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Card Executive Model Result Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className={`p-4 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  Predicted Monthly Burden
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-extrabold font-mono ${headingCls}`}>
                    {result.predicted_cases.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold ${mutedCls}`}>cases</span>
                </div>
                <span className={`text-[11px] font-mono block mt-1 ${mutedCls}`}>
                  95% CI: {result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()} · Raw: [{result.predicted_cases}.]
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  Weekly Admission Velocity
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-extrabold font-mono ${activeDisease === 'dengue' ? 'text-rose-600 dark:text-rose-400' : 'text-teal-700 dark:text-teal-300'}`}>
                    ~{weeklyRate}
                  </span>
                  <span className={`text-xs font-bold ${mutedCls}`}>cases / week</span>
                </div>
                <span className={`text-[11px] block mt-1 ${mutedCls}`}>
                  Across {result.n_weeks} surveillance weeks in {result.month_name}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  vs. Historical {result.month_name} Baseline
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-3xl font-extrabold font-mono ${
                      result.pct_diff_baseline > 15
                        ? 'text-rose-600 dark:text-rose-400'
                        : result.pct_diff_baseline < -15
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : headingCls
                    }`}
                  >
                    {result.pct_diff_baseline >= 0 ? '+' : ''}
                    {result.pct_diff_baseline}%
                  </span>
                  <span className={`text-xs font-mono font-bold ${mutedCls}`}>
                    ({result.ratio_to_baseline.toFixed(2)}x)
                  </span>
                </div>
                <span className={`text-[11px] block mt-1 ${mutedCls}`}>
                  Historical {result.month_name} mean: {Math.round(result.baseline_cases).toLocaleString()} cases
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${getTakeawayBannerStyle(result.level_id)}`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Clinical &amp; Operational Meaning
                </span>
                <div className="text-xs font-extrabold mt-1 leading-snug">
                  {result.takeaway_title || result.level_label}
                </div>
                <p className="text-[11px] mt-1 leading-snug opacity-90">
                  {result.effect_text}
                </p>
              </div>
            </div>

            {/* Dual-Tab Response Curve & 12-Month Seasonal Profile Chart */}
            <div className={`p-5 rounded-3xl border ${
              isDark
                ? 'bg-slate-800/50 border-slate-800 text-white'
                : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900'
            }`}>
              <ScatterChart
                disease={activeDisease}
                cityName={result.city}
                history={history}
                currentMonth={month}
                currentRain={rainfall}
                predictedCases={result.predicted_cases}
                ciLower={result.ci_lower}
                ciUpper={result.ci_upper}
                baselineCases={result.baseline_cases}
                topSimilar={result.similar_months[0] || null}
                responseCurve={result.response_curve}
                seasonalProfile={result.seasonal_profile}
                theme={theme}
                predictFn={fallbackPredictFn}
              />
            </div>

            {/* Operational Action Protocol & Flood-Vulnerable Barangays */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upgraded LGU & Hospital Operational Action Protocol (7 cols) */}
              <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-sm transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-[#EAE3D6] text-stone-800'}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-extrabold ${headingCls}`}>
                        Quantified LGU &amp; Hospital Action Plan
                      </h3>
                      <p className={`text-xs ${mutedCls}`}>
                        Resource targets scaled dynamically for{' '}
                        <strong>{result.predicted_cases.toLocaleString()} cases</strong> ({result.level_label})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => setShowSummaryReport(true)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isDark
                          ? 'bg-teal-900/60 hover:bg-teal-800/70 text-teal-100 border-teal-700/60'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyBrief}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-800 border-[#E7E1D6]'
                      }`}
                    >
                      {copiedBrief ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Brief Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Situation Brief</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Readiness Checklist Progress Bar */}
                {(() => {
                  const total = result.actions.length;
                  const completed = result.actions.filter((_, idx) => checkedActions[`${activeDisease}-${idx}`]).length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div className={`p-3 rounded-2xl border mb-4 ${insetCls}`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-teal-500" />
                          <span>LGU Incident Readiness Checklist</span>
                        </span>
                        <span className="font-mono">
                          {completed} of {total} directives verified ({pct}%)
                        </span>
                      </div>
                      <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'}`}>
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Enriched Action Directive Cards */}
                <div className="space-y-3">
                  {result.actions.map((act, i) => {
                    const checkKey = `${activeDisease}-${i}`;
                    const isChecked = !!checkedActions[checkKey];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleActionCheck(checkKey)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? isDark
                              ? 'bg-emerald-950/25 border-emerald-700/50 opacity-85'
                              : 'bg-emerald-50/70 border-emerald-300 opacity-90'
                            : insetCls
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 focus:outline-none"
                            aria-label={`Mark ${act.t} as completed`}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className={`w-5 h-5 ${mutedCls}`} />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[11px] ${
                                    isDark ? 'bg-teal-950 text-teal-300' : 'bg-[#E5DFD4] text-stone-900'
                                  }`}
                                >
                                  {act.i}
                                </span>
                                <h4
                                  className={`text-sm font-extrabold ${headingCls} ${
                                    isChecked ? 'line-through opacity-75' : ''
                                  }`}
                                >
                                  {act.t}
                                </h4>
                              </div>

                              {act.urgency && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                                    act.priority
                                  )}`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {act.urgency}
                                </span>
                              )}
                            </div>

                            {/* Quantified Target Metric Callout */}
                            {act.metric && (
                              <div
                                className={`mt-1.5 mb-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                                  isDark
                                    ? 'bg-slate-900/80 border-slate-700 text-sky-300'
                                    : 'bg-[#FFFDF9] border-[#E2DBD0] text-stone-900'
                                }`}
                              >
                                Target: {act.metric}
                              </div>
                            )}

                            <p className={`text-xs leading-relaxed ${mutedCls}`}>
                              {act.d}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-700/30 dark:border-slate-700/50 text-[11px]">
                              <span className={`font-semibold ${subCls}`}>
                                Lead Unit: <strong>{act.w}</strong>
                              </span>
                              {act.target_zones && (
                                <span className={`font-mono text-[10px] ${mutedCls}`}>
                                  Priority Zones: {act.target_zones}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Methodology & Basis Note */}
                <div className={`mt-4 p-3 rounded-2xl border text-[11px] leading-relaxed ${insetCls}`}>
                  <span className={`font-extrabold ${headingCls}`}>Basis of Quantified Targets: </span>
                  <span className={mutedCls}>
                    Action categories follow <strong>DOH Philippines</strong> (4S Dengue Strategy &amp; Post-Flood Doxycycline PEP) and <strong>NKTI</strong> renal triage directives, linked to <strong>UP NOAH / MGB</strong> flood-prone barangays. Resource volumes are decision-support planning heuristics scaled from the model&apos;s predicted monthly case burden.
                  </span>
                </div>
              </div>

              {/* Flood-Vulnerable Barangays Card (5 cols) */}
              <div className="lg:col-span-5">
                <FloodZonesCard city={result.city} zones={result.flood_zones} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showSummaryReport && result && (
        <ActionSummaryReport
          result={result}
          activeDisease={activeDisease}
          checkedActions={checkedActions}
          onToggleCheck={toggleActionCheck}
          onCopyBrief={handleCopyBrief}
          copiedBrief={copiedBrief}
          onClose={() => setShowSummaryReport(false)}
          theme={theme}
        />
      )}
    </>
  );
};
