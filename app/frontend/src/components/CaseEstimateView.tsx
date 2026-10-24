import React, { useState, useCallback } from 'react';
import {
  PredictionResult,
  getHistoricalPoints,
  MONTH_NAMES,
  MON3_NAMES
} from '../services/api';
import { NCRCityPolygon } from './metroManilaData';
import {
  ActionLayerFilter,
  getFacilitiesForCity,
  mapActionCodeToLayer
} from './actionMapData';
import { ScatterChart } from './ScatterChart';
import { FloodZonesCard } from './FloodZonesCard';
import { ActionSummaryReport } from './ActionSummaryReport';
import {
  CloudRain,
  History,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
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
  Building2,
  Cross,
  FileText,
  SlidersHorizontal,
  GitCompare,
  Layers,
  Target
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
  analyticsSection?: 'charts' | 'actions';
  onAnalyticsSectionChange?: (sec: 'charts' | 'actions') => void;
  theme?: 'light' | 'dark';
  onFocusMapTarget?: (opts: {
    layer: ActionLayerFilter;
    code: string;
    coords?: [number, number];
  }) => void;
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
  analyticsSection = 'charts',
  onAnalyticsSectionChange,
  theme = 'dark',
  onFocusMapTarget
}) => {
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [showSummaryReport, setShowSummaryReport] = useState<boolean>(false);

  // Collapsible HUD Drawer States for clean, un-crowded 3D viewport
  const [leftHudCollapsed, setLeftHudCollapsed] = useState<boolean>(false);
  const [rightHudCollapsed, setRightHudCollapsed] = useState<boolean>(false);
  const [showRightHudDetails, setShowRightHudDetails] = useState<boolean>(false);
  const [showLeftCityInspector, setShowLeftCityInspector] = useState<boolean>(false);

  // Internal fallback if parent doesn't control analyticsSection
  const [internalSection, setInternalSection] = useState<'charts' | 'actions'>('charts');
  const activeModalTab = onAnalyticsSectionChange ? analyticsSection : internalSection;
  const setModalTab = (sec: 'charts' | 'actions') => {
    if (onAnalyticsSectionChange) onAnalyticsSectionChange(sec);
    else setInternalSection(sec);
  };

  const fallbackHistory = getHistoricalPoints(activeDisease);
  const history = result?.history_points || fallbackHistory;

  const fallbackPredictFn = useCallback(
    (r: number) =>
      activeDisease === 'dengue'
        ? Math.exp(Math.log(375) + 0.26 * ((Math.log1p(r) - 5.0) / 1.1))
        : Math.exp(0.42 + 0.44 * ((Math.log1p(r) - 5.0) / 1.1)) * nWeeks,
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

  // Brand Kit aligned tokens (Slate-900 @ 88% in dark mode, Warm Alabaster #FFFDF9 @ 95% in light mode)
  const cardCls = isDark
    ? 'bg-slate-900/90 text-white border-slate-800 shadow-2xl'
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

  const getPriorityAccentBar = (priority?: string) => {
    if (priority === 'critical') return 'border-l-4 border-l-[#E11D48]';
    if (priority === 'high') return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-[#0D9488]';
  };

  return (
    <>
      {/* =====================================================================
          LEFT FLOATING HUD DOCK: Scenario Controls & Metro Manila City Inspector
          ===================================================================== */}
      <aside className="fixed top-20 left-4 z-20 w-[335px] sm:w-[365px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-2.5 pointer-events-auto pr-1">
        {leftHudCollapsed ? (
          /* Compact Collapsed Pill for Left HUD */
          <div
            onClick={() => setLeftHudCollapsed(false)}
            className={`p-3.5 rounded-2xl backdrop-blur-xl border cursor-pointer flex items-center justify-between gap-3 transition hover:scale-[1.01] ${cardCls}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  activeDisease === 'dengue'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-teal-500/20 text-teal-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-extrabold truncate ${headingCls}`}>
                    {activeDisease === 'dengue' ? 'Dengue · QC' : 'Lepto · Manila'}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${insetCls}`}>
                    {MON3_NAMES[month - 1]}
                  </span>
                </div>
                <div className={`text-[11px] font-mono ${mutedCls}`}>
                  Rain: <strong>{rainfall} mm</strong> · Prev: {prevRain} mm
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Expand Scenario Controls"
              className={`p-1.5 rounded-xl border ${insetCls}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Card 1: Disease Switcher + Scenario Controls */}
            <div className={`p-4 rounded-3xl backdrop-blur-xl border space-y-3.5 transition-colors ${cardCls}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-500" />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${headingCls}`}>
                    Scenario Cockpit
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLeftHudCollapsed(true)}
                  title="Collapse Scenario Cockpit"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-700 border-[#E7E1D6]'
                  }`}
                >
                  <span>Minimize</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>

              {/* Segmented Disease Switcher */}
              <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl border ${insetCls}`}>
                <button
                  type="button"
                  onClick={() => onDiseaseChange('dengue')}
                  className={`flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                    activeDisease === 'dengue'
                      ? 'bg-[#E11D48] text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-[#EAE3D6]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Dengue
                  </div>
                  <span className="text-[10px] opacity-85">Quezon City (2010–2025)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDiseaseChange('lepto')}
                  className={`flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                    activeDisease === 'lepto'
                      ? 'bg-[#0D9488] text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-[#EAE3D6]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Leptospirosis
                  </div>
                  <span className="text-[10px] opacity-85">Manila (2001–2012)</span>
                </button>
              </div>

              {/* Calendar Month Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${mutedCls}`}>
                    Target Calendar Month
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${headingCls}`}>
                    {MONTH_NAMES[month - 1]}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {MON3_NAMES.map((mShort, idx) => {
                    const mNum = idx + 1;
                    const isSelected = month === mNum;
                    return (
                      <button
                        key={mNum}
                        type="button"
                        onClick={() => onMonthChange(mNum)}
                        className={`py-1 rounded-lg text-[10px] font-bold transition ${
                          isSelected
                            ? isDark
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'bg-stone-900 text-white shadow-sm'
                            : isDark
                            ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                            : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6]'
                        }`}
                      >
                        {mShort}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Month Rainfall */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${mutedCls}`}>
                    This Month&apos;s Rainfall
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={1500}
                      value={rainfall}
                      onChange={e => onRainfallChange(Number(e.target.value))}
                      className={`w-16 px-2 py-0.5 text-right text-xs font-mono font-bold rounded-lg border ${
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

                <div className="grid grid-cols-4 gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => handlePreset(0.3)}
                    className={`px-1.5 py-1 text-[10px] font-semibold rounded-lg border transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                        : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                    }`}
                  >
                    Dry (75)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(1.0)}
                    className={`px-1.5 py-1 text-[10px] font-semibold rounded-lg border transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                        : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                    }`}
                  >
                    Typical
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(1.8)}
                    className={`px-1.5 py-1 text-[10px] font-semibold rounded-lg border transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                        : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] text-stone-800 border-[#E2DBD0]'
                    }`}
                  >
                    Wet (450)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(2.6, 680)}
                    className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/25 transition"
                  >
                    Typhoon
                  </button>
                </div>
              </div>

              {/* Lagged Previous Month Rainfall */}
              <div className={`pt-2.5 border-t ${borderCls} space-y-2.5`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        activeDisease === 'dengue'
                          ? isDark
                            ? 'text-rose-400'
                            : 'text-stone-700'
                          : isDark
                          ? 'text-teal-400'
                          : 'text-stone-700'
                      }`}
                    >
                      Last Month&apos;s Rainfall (Lag-1)
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        activeDisease === 'dengue'
                          ? isDark
                            ? 'text-rose-300'
                            : 'text-stone-900'
                          : isDark
                          ? 'text-teal-300'
                          : 'text-stone-900'
                      }`}
                    >
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
                        : isDark
                        ? 'accent-teal-500'
                        : 'accent-teal-700'
                    }`}
                  />
                </div>

                {activeDisease === 'lepto' && (
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedCls}`}>
                      Surveillance Weeks:
                    </span>
                    <div className="flex gap-1.5">
                      {[4, 5].map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => onNWeeksChange(w)}
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                            nWeeks === w
                              ? isDark
                                ? 'bg-teal-600 text-white'
                                : 'bg-stone-900 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6]'
                          }`}
                        >
                          {w} wks
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Formula Accordion */}
              <div className="pt-0.5">
                <button
                  type="button"
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
                  <div className={`mt-2 p-2.5 rounded-2xl text-[11px] space-y-1 border ${insetCls}`}>
                    {activeDisease === 'dengue' ? (
                      <>
                        <div className="font-mono font-bold text-rose-700 dark:text-rose-400">
                          StandardScaler + PoissonRegressor(α = 0.1)
                        </div>
                        <p>
                          Features: log(1+rain), log(1+prev_rain), sin/cos(2πm/12). Trained on Quezon City 2010–2025 monthly surveillance.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className={`font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>
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

            {/* Card 2: Collapsible Metro Manila City Inspector */}
            <div className={`p-3.5 rounded-3xl backdrop-blur-xl border transition-colors ${cardCls}`}>
              <div
                onClick={() => setShowLeftCityInspector(!showLeftCityInspector)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                    {inspectedCity ? inspectedCity.name : 'Metro Manila City Inspector'}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {inspectedCity && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onClearCity();
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-[#F4EFE6] text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Reset
                    </button>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showLeftCityInspector || inspectedCity ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {(showLeftCityInspector || inspectedCity) && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/40 dark:border-slate-800">
                  {inspectedCity ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-mono ${mutedCls}`}>
                          {inspectedCity.district} · {inspectedCity.areaKm2} km²
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inspectedCity.focusId === 'dengue'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                              : inspectedCity.focusId === 'lepto'
                              ? 'bg-teal-100 text-teal-900 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-[#F4EFE6] text-stone-700 border border-[#E7E1D6]'
                          }`}
                        >
                          {inspectedCity.isFocus ? 'In Model Scope' : 'Out of Scope'}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${insetCls}`}>
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>Basin: </span>
                          <span className={subCls}>{inspectedCity.riverBasin}</span>
                        </div>
                        <div>
                          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>Hotspots: </span>
                          <span className={subCls}>{inspectedCity.floodHotspots}</span>
                        </div>
                      </div>

                      {(() => {
                        const cityFacilities = getFacilitiesForCity(inspectedCity.name);
                        if (cityFacilities.length === 0) return null;
                        return (
                          <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${insetCls}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-sky-400' : 'text-sky-800'}`}>
                                Health Nodes ({cityFacilities.length})
                              </span>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                              {cityFacilities.map(fac => (
                                <div
                                  key={fac.id}
                                  className="flex items-center justify-between gap-1.5 py-0.5"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {fac.type === 'hospital' ? (
                                      <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                                    ) : (
                                      <Cross className="w-3 h-3 text-emerald-400 shrink-0" />
                                    )}
                                    <span className={`truncate font-semibold ${headingCls}`}>
                                      {fac.shortName}
                                    </span>
                                  </div>
                                  {onFocusMapTarget && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onFocusMapTarget({
                                          layer: fac.type === 'hospital' ? 'hospitals' : 'clinics',
                                          code: fac.id,
                                          coords: fac.coords
                                        })
                                      }
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 transition ${
                                        isDark
                                          ? 'bg-slate-900 hover:bg-sky-500/20 text-sky-300 border-slate-700'
                                          : 'bg-[#FFFDF9] hover:bg-sky-50 text-sky-800 border-[#E2DBD0]'
                                      }`}
                                    >
                                      Zoom
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {!inspectedCity.isFocus && (
                        <button
                          type="button"
                          onClick={onOpenUploadForCity}
                          className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
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
                      Click any of the <strong>17 Metro Manila cities</strong> on the 3D map to inspect its river basin, flood corridors, and tertiary referral hospitals.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* =====================================================================
          RIGHT FLOATING HUD DOCK: Streamlined & Collapsible Intelligence Card
          ===================================================================== */}
      {result && (
        <aside className="fixed top-20 right-4 z-20 w-[345px] sm:w-[385px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-2.5 pointer-events-auto pl-1">
          {rightHudCollapsed ? (
            /* Minimized Right HUD Pill */
            <div
              onClick={() => setRightHudCollapsed(false)}
              className={`p-3.5 rounded-2xl backdrop-blur-xl border cursor-pointer flex items-center justify-between gap-3 transition hover:scale-[1.01] ${cardCls}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-2xl font-black font-mono leading-none ${
                    activeDisease === 'dengue'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-teal-700 dark:text-teal-400'
                  }`}
                >
                  {result.predicted_cases.toLocaleString()}
                </span>
                <div className="min-w-0">
                  <div className={`text-xs font-extrabold truncate ${headingCls}`}>
                    {result.city} · {result.month_name}
                  </div>
                  <div className={`text-[10px] font-mono ${mutedCls}`}>
                    {result.level_label} ({result.pct_diff_baseline >= 0 ? '+' : ''}{result.pct_diff_baseline}%)
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Expand Nowcast Results"
                className={`p-1.5 rounded-xl border ${insetCls}`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className={`p-4 sm:p-5 rounded-3xl backdrop-blur-xl border relative overflow-hidden transition-colors ${cardCls}`}>
              <div
                className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25"
                style={{
                  backgroundColor: activeDisease === 'dengue' ? '#E11D48' : '#0D9488'
                }}
              />

              {/* Header + Severity Pill + Minimize Button */}
              <div className="flex items-start justify-between gap-2 mb-3">
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                      result.level_id === 'high'
                        ? 'bg-rose-500/20 text-rose-800 border-rose-300 dark:text-rose-300 dark:border-rose-500/40'
                        : result.level_id === 'up'
                        ? 'bg-amber-500/20 text-amber-800 border-amber-300 dark:text-amber-300 dark:border-amber-500/40'
                        : 'bg-teal-500/20 text-teal-800 border-teal-300 dark:text-teal-300 dark:border-teal-500/40'
                    }`}
                  >
                    {result.level_label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRightHudCollapsed(true)}
                    title="Minimize Right HUD"
                    className={`p-1.5 rounded-xl border transition ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-700 border-[#E7E1D6]'
                    }`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Hero Case Number & Confidence Interval */}
              <div className={`p-3.5 rounded-2xl border mb-3 relative overflow-hidden ${insetCls}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black tracking-tight font-mono leading-none ${
                        activeDisease === 'dengue'
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-teal-800 dark:text-teal-400'
                      }`}
                    >
                      {result.predicted_cases.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-slate-700/30 dark:border-slate-700/60 pl-3 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500 shrink-0" />
                      <span className={`text-[10px] font-black uppercase tracking-wider truncate ${headingCls}`}>
                        Expected {result.disease}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono font-semibold ${subCls}`}>
                      95% CI: <strong>{result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()}</strong>
                    </div>
                    <div className={`text-[10px] font-mono ${mutedCls}`}>
                      ~{weeklyRate} cases/wk ({result.n_weeks} wks)
                    </div>
                  </div>
                </div>

                {/* Compact Baseline Comparison Bar inside Hero Box */}
                <div className={`pt-2.5 mt-2.5 border-t ${borderCls} space-y-1.5`}>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={subCls}>
                      vs. {result.month_name} Baseline ({Math.round(result.baseline_cases)} avg)
                    </span>
                    <span
                      className={`font-mono font-extrabold ${
                        result.pct_diff_baseline > 15
                          ? 'text-rose-700 dark:text-rose-400'
                          : result.pct_diff_baseline < -15
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : headingCls
                      }`}
                    >
                      {result.pct_diff_baseline >= 0 ? '+' : ''}
                      {result.pct_diff_baseline}% ({result.ratio_to_baseline.toFixed(1)}x)
                    </span>
                  </div>
                  <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'}`}>
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
                </div>
              </div>

              {/* Concise "What This Means" Banner */}
              <div className={`p-3 rounded-2xl border mb-3 ${getTakeawayBannerStyle(result.level_id)}`}>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider opacity-85 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>What This Result Means</span>
                </div>
                <div className="text-xs font-extrabold leading-snug">
                  {result.takeaway_title || `${result.level_label} (${result.ratio_to_baseline.toFixed(1)}x Normal Load)`}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mt-0.5">
                  {result.takeaway_body || result.why_text}
                </p>
              </div>

              {/* #1 Priority Action Directive Card (High Emphasis) */}
              {result.actions && result.actions.length > 0 && (
                <div
                  className={`p-3 rounded-2xl border mb-3 ${insetCls} ${getPriorityAccentBar(
                    result.actions[0].priority
                  )}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      #1 Priority Directive [{result.actions[0].i}]
                    </span>
                    {result.actions[0].urgency && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getPriorityBadgeStyle(
                          result.actions[0].priority
                        )}`}
                      >
                        {result.actions[0].urgency}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-xs font-extrabold ${headingCls}`}>
                      {result.actions[0].t}
                    </div>
                    {onFocusMapTarget && (
                      <button
                        type="button"
                        onClick={() => {
                          const mapped = mapActionCodeToLayer(result.actions[0].i);
                          onFocusMapTarget({
                            layer: mapped.layer,
                            code: result.actions[0].i
                          });
                        }}
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          isDark
                            ? 'bg-slate-900 hover:bg-amber-500/20 text-amber-300 border-slate-700'
                            : 'bg-[#FFFDF9] hover:bg-amber-50 text-amber-900 border-[#E2DBD0]'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>3D Pin</span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-bold mt-1 ${
                      activeDisease === 'dengue'
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-teal-800 dark:text-teal-300'
                    }`}
                  >
                    {result.actions[0].metric || result.actions[0].d}
                  </div>
                </div>
              )}

              {/* Dual Primary Navigation Buttons: Separate Screens for Graph vs. Action Plan */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('charts');
                    onToggleAnalyticsModal(true);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-[11px] border flex items-center justify-center gap-1.5 transition shadow-md ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/30'
                      : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-900 border-[#E7E1D6]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Response Curve</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalTab('actions');
                    onToggleAnalyticsModal(true);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-md ${
                    isDark
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Action Plan ({result.actions.length})</span>
                </button>
              </div>

              {/* Collapsible Accordion for Historical Analogues & Model Explanation (De-clutters Right HUD) */}
              <div className={`pt-2 border-t ${borderCls}`}>
                <button
                  type="button"
                  onClick={() => setShowRightHudDetails(!showRightHudDetails)}
                  className={`w-full flex items-center justify-between text-[11px] font-bold transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Closest Historical Twin:{' '}
                      {result.similar_months?.[0]
                        ? `${MON3_NAMES[result.similar_months[0].month - 1]} ${result.similar_months[0].year} (${result.similar_months[0].sim}% match)`
                        : 'View details'}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showRightHudDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showRightHudDetails && result.similar_months && result.similar_months.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {(() => {
                      const top = result.similar_months[0];
                      return (
                        <div className={`p-3 rounded-2xl border ${insetCls}`}>
                          <div className="flex items-baseline justify-between">
                            <span className={`text-xs font-extrabold ${headingCls}`}>
                              #1 Twin: {MONTH_NAMES[top.month - 1]} {top.year}
                            </span>
                            <span className={`text-xs font-mono font-extrabold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                              {top.cases.toLocaleString()} actual cases
                            </span>
                          </div>
                          <div className={`text-[10px] mt-1 font-mono ${mutedCls}`}>
                            Rain then: <strong>{top.rain} mm</strong> (Δ {Math.round(Math.abs(top.rain - result.rain))} mm)
                            {top.prev !== null ? ` · Prev: ${top.prev} mm` : ''}
                          </div>
                          {top.match_reason && (
                            <div className={`text-[10px] mt-1 font-mono ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>
                              Why matched: {top.match_reason}
                            </div>
                          )}
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
                            #{idx + 2} {MON3_NAMES[s.month - 1]} {s.year}
                          </div>
                          <div className={`font-mono ${mutedCls}`}>{s.rain}mm · {s.cases}c</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-1.5 pt-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <span className={`leading-snug ${mutedCls}`}>{result.why_text}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* =====================================================================
          DEDICATED TWO-SCREEN ANALYTICS & ACTION PLAN WORKSPACE MODAL
          Screen 1 ('charts'): Response Curve, Seasonal Profile & Historical Twin Deep-Dive
          Screen 2 ('actions'): High-Emphasis Quantified LGU Action Plan & Flood Zones
          ===================================================================== */}
      {showAnalyticsModal && result && (
        <div
          className={`fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 pointer-events-auto transition-colors ${
            isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-stone-900/55 backdrop-blur-md'
          }`}
        >
          <div
            className={`w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 space-y-5 transition-colors ${
              isDark
                ? 'bg-slate-900 text-white border-slate-800 shadow-black/60'
                : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
            }`}
          >
            {/* Modal Header with Dedicated Screen Switcher Tabs */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${borderCls}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>
                    {activeModalTab === 'charts'
                      ? 'Screen 1 · Epidemiological Model & Historical Twin Analysis'
                      : 'Screen 2 · Tactical LGU & Hospital Action Command'}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      result.level_id === 'high'
                        ? 'bg-rose-500/20 text-rose-800 border-rose-300 dark:text-rose-300 dark:border-rose-500/40'
                        : result.level_id === 'up'
                        ? 'bg-amber-500/20 text-amber-800 border-amber-300 dark:text-amber-300 dark:border-amber-500/40'
                        : 'bg-teal-500/20 text-teal-800 border-teal-300 dark:text-teal-300 dark:border-teal-500/40'
                    }`}
                  >
                    {result.level_label}
                  </span>
                </div>
                <h2 className={`text-lg sm:text-xl font-black mt-0.5 ${headingCls}`}>
                  {result.disease} Nowcast · {result.city} ({result.month_name})
                </h2>
              </div>

              {/* Dedicated Screen Switcher (Graph Deep-Dive vs. Action Plan) + Close Button */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div
                  className={`inline-flex p-1 rounded-2xl border ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#F4EFE6] border-[#E7E1D6]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setModalTab('charts')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                      activeModalTab === 'charts'
                        ? isDark
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'bg-stone-900 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>1. Model Graph &amp; Analogues</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTab('actions')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                      activeModalTab === 'actions'
                        ? isDark
                          ? 'bg-teal-400 text-slate-950 shadow-sm'
                          : 'bg-stone-900 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>2. Action Plan &amp; Flood Zones</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAnalyticsModal(false)}
                  aria-label="Close modal"
                  className={`p-2 rounded-xl border transition ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent'
                      : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6] border-[#E7E1D6]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 4-Card Executive KPI Strip (Always visible for context) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  Predicted Monthly Burden
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${headingCls}`}>
                    {result.predicted_cases.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold ${mutedCls}`}>cases</span>
                </div>
                <span className={`text-[11px] font-mono block mt-0.5 ${mutedCls}`}>
                  95% CI: {result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  Weekly Admission Velocity
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                      activeDisease === 'dengue' ? 'text-rose-700 dark:text-rose-400' : 'text-teal-800 dark:text-teal-300'
                    }`}
                  >
                    ~{weeklyRate}
                  </span>
                  <span className={`text-xs font-bold ${mutedCls}`}>cases / week</span>
                </div>
                <span className={`text-[11px] block mt-0.5 ${mutedCls}`}>
                  Across {result.n_weeks} surveillance weeks in {result.month_name}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${insetCls}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  vs. Historical {result.month_name} Baseline
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                      result.pct_diff_baseline > 15
                        ? 'text-rose-700 dark:text-rose-400'
                        : result.pct_diff_baseline < -15
                        ? 'text-emerald-700 dark:text-emerald-400'
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
                <span className={`text-[11px] block mt-0.5 ${mutedCls}`}>
                  Historical {result.month_name} mean: {Math.round(result.baseline_cases).toLocaleString()} cases
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${getTakeawayBannerStyle(result.level_id)}`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Marginal Rainfall Effect
                </span>
                <div className="text-xs font-extrabold mt-1 leading-snug">
                  {result.takeaway_title || result.level_label}
                </div>
                <p className="text-[11px] mt-0.5 leading-snug opacity-90">
                  {result.effect_text}
                </p>
              </div>
            </div>

            {/* =====================================================================
                SCREEN 1: DEDICATED GRAPH & HISTORICAL ANALOGUE DEEP-DIVE
                ===================================================================== */}
            {activeModalTab === 'charts' ? (
              <div className="space-y-5">
                {/* Interactive Live Sliders Bar right above the chart so users can test how the curve & twin respond */}
                <div
                  className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#F4EFE6] border-[#E7E1D6]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-sky-500" />
                    <span className={`text-xs font-extrabold ${headingCls}`}>
                      Interactive Scenario Explorer:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${mutedCls}`}>Month:</span>
                      <select
                        value={month}
                        onChange={e => onMonthChange(Number(e.target.value))}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#FFFDF9] border-[#E7E1D6] text-stone-900'
                        }`}
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className={`text-[11px] font-bold ${mutedCls}`}>This Mo Rain:</span>
                      <input
                        type="range"
                        min={0}
                        max={1200}
                        step={10}
                        value={rainfall}
                        onChange={e => onRainfallChange(Number(e.target.value))}
                        className="w-28 h-1.5 rounded-lg cursor-pointer accent-sky-500"
                      />
                      <span className="text-xs font-mono font-extrabold w-14 text-right">{rainfall} mm</span>
                    </div>

                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className={`text-[11px] font-bold ${mutedCls}`}>Prev Mo Rain:</span>
                      <input
                        type="range"
                        min={0}
                        max={1200}
                        step={10}
                        value={prevRain}
                        onChange={e => onPrevRainChange(Number(e.target.value))}
                        className="w-28 h-1.5 rounded-lg cursor-pointer accent-teal-500"
                      />
                      <span className="text-xs font-mono font-extrabold w-14 text-right">{prevRain} mm</span>
                    </div>
                  </div>
                </div>

                {/* Main Response Curve / Seasonal Profile Chart with Built-in 3-Card Interpretation Guide */}
                <div
                  className={`p-5 rounded-3xl border ${
                    isDark
                      ? 'bg-slate-800/40 border-slate-800 text-white'
                      : 'bg-[#F4EFE6]/70 border-[#E7E1D6] text-stone-900'
                  }`}
                >
                  <ScatterChart
                    disease={activeDisease}
                    cityName={result.city}
                    history={history}
                    currentMonth={month}
                    currentRain={rainfall}
                    prevRain={prevRain}
                    predictedCases={result.predicted_cases}
                    ciLower={result.ci_lower}
                    ciUpper={result.ci_upper}
                    baselineCases={result.baseline_cases}
                    topSimilar={result.similar_months[0] || null}
                    similarMonths={result.similar_months}
                    responseCurve={result.response_curve}
                    seasonalProfile={result.seasonal_profile}
                    theme={theme}
                    predictFn={fallbackPredictFn}
                    showInterpretationGuide={true}
                  />
                </div>

                {/* Top 4 Historical Outbreak Analogues Comparison Table */}
                {result.similar_months && result.similar_months.length > 0 && (
                  <div className={`p-5 rounded-3xl border ${cardCls}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-amber-500" />
                        <h3 className={`text-sm font-extrabold ${headingCls}`}>
                          Top 4 Closest Historical Outbreak Analogues ({result.city})
                        </h3>
                      </div>
                      <span className={`text-[11px] font-mono ${mutedCls}`}>
                        Ranked by Euclidean distance in (Current Rain, Prev Rain, Circular Season)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {result.similar_months.map((sim, idx) => (
                        <div
                          key={`${sim.year}-${sim.month}`}
                          className={`p-3.5 rounded-2xl border relative ${
                            idx === 0
                              ? isDark
                                ? 'bg-amber-950/30 border-amber-500/50'
                                : 'bg-amber-50/80 border-amber-300'
                              : insetCls
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                              #{idx + 1} Match · {sim.sim}%
                            </span>
                            <span className={`text-xs font-mono font-bold ${mutedCls}`}>
                              dist={sim.dist.toFixed(2)}
                            </span>
                          </div>
                          <div className={`text-sm font-extrabold mt-1 ${headingCls}`}>
                            {MONTH_NAMES[sim.month - 1]} {sim.year}
                          </div>
                          <div
                            className={`text-base font-black font-mono mt-0.5 ${
                              activeDisease === 'dengue'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-teal-800 dark:text-teal-300'
                            }`}
                          >
                            {sim.cases.toLocaleString()} actual cases
                          </div>
                          <div className={`text-[11px] font-mono mt-1.5 pt-1.5 border-t ${borderCls} ${mutedCls}`}>
                            <div>
                              This Mo: <strong>{sim.rain} mm</strong> (Δ {Math.round(Math.abs(sim.rain - rainfall))} mm)
                            </div>
                            {sim.prev != null && (
                              <div>
                                Prev Mo: <strong>{sim.prev} mm</strong> (Δ {Math.round(Math.abs(sim.prev - prevRain))} mm)
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom CTA to switch to Screen 2: Action Plan */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalTab('actions')}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition shadow-lg ${
                      isDark
                        ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Proceed to Quantified LGU Action Plan &amp; Flood Zones →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* =====================================================================
                 SCREEN 2: HIGH-EMPHASIS QUANTIFIED ACTION PLAN & FLOOD ZONES
                 ===================================================================== */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: High-Emphasis Quantified LGU & Hospital Action Cards */}
                <div
                  className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border shadow-sm transition-colors ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-[#EAE3D6] text-stone-800'
                        }`}
                      >
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

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSummaryReport(true)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isDark
                            ? 'bg-teal-900/60 hover:bg-teal-800/70 text-teal-100 border-teal-700/60'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Summary Brief</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyBrief}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
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
                            <span>Copy Brief</span>
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
                      <div className={`p-3.5 rounded-2xl border mb-4 ${insetCls}`}>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-teal-500" />
                            <span>LGU Incident Readiness Verification</span>
                          </span>
                          <span className="font-mono font-extrabold">
                            {completed} of {total} directives verified ({pct}%)
                          </span>
                        </div>
                        <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-[#E5DFD4]'}`}>
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* High-Emphasis Action Directive Cards */}
                  <div className="space-y-3.5">
                    {result.actions.map((act, i) => {
                      const checkKey = `${activeDisease}-${i}`;
                      const isChecked = !!checkedActions[checkKey];
                      return (
                        <div
                          key={i}
                          onClick={() => toggleActionCheck(checkKey)}
                          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${getPriorityAccentBar(
                            act.priority
                          )} ${
                            isChecked
                              ? isDark
                                ? 'bg-emerald-950/25 border-emerald-700/50 opacity-85'
                                : 'bg-emerald-50/70 border-emerald-300 opacity-90'
                              : isDark
                              ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                              : 'bg-[#FFFDF9] border-[#E7E1D6] hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Step Rank + Checkbox */}
                            <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                              <span
                                className={`w-6 h-6 rounded-full text-[11px] font-mono font-black flex items-center justify-center ${
                                  isChecked
                                    ? 'bg-emerald-500 text-slate-950'
                                    : act.priority === 'critical'
                                    ? 'bg-[#E11D48] text-white'
                                    : 'bg-[#0D9488] text-white'
                                }`}
                              >
                                {i + 1}
                              </span>
                              <button
                                type="button"
                                className="focus:outline-none"
                                aria-label={`Mark ${act.t} as completed`}
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className={`w-5 h-5 ${mutedCls}`} />
                                )}
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Top Row: Code Badge, Action Title, and SLA Urgency Pill */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-mono font-black text-xs border ${
                                      isDark
                                        ? 'bg-slate-950 text-teal-300 border-teal-500/40'
                                        : 'bg-[#F4EFE6] text-stone-900 border-[#E7E1D6]'
                                    }`}
                                  >
                                    {act.i}
                                  </span>
                                  <h4
                                    className={`text-sm sm:text-base font-extrabold ${headingCls} ${
                                      isChecked ? 'line-through opacity-75' : ''
                                    }`}
                                  >
                                    {act.t}
                                  </h4>
                                </div>

                                {act.urgency && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                                      act.priority
                                    )}`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {act.urgency}
                                  </span>
                                )}
                              </div>

                              {/* HIGH-EMPHASIS QUANTIFIED TARGET CALLOUT BANNER */}
                              {act.metric && (
                                <div
                                  className={`my-2 p-3 rounded-xl border flex items-center gap-2.5 ${
                                    act.priority === 'critical'
                                      ? isDark
                                        ? 'bg-rose-950/45 border-rose-500/40 text-rose-200'
                                        : 'bg-rose-50/90 border-rose-200 text-rose-950'
                                      : isDark
                                      ? 'bg-slate-950/90 border-teal-500/35 text-teal-200'
                                      : 'bg-[#F4EFE6] border-[#E2DBD0] text-stone-900'
                                  }`}
                                >
                                  <Target
                                    className={`w-4 h-4 shrink-0 ${
                                      act.priority === 'critical' ? 'text-rose-500' : 'text-teal-500'
                                    }`}
                                  />
                                  <div className="text-xs sm:text-sm font-mono font-extrabold leading-snug">
                                    {act.metric}
                                  </div>
                                </div>
                              )}

                              <p className={`text-xs leading-relaxed ${subCls}`}>
                                {act.d}
                              </p>

                              {/* Bottom Metadata Strip: Lead Unit, Target Zones, and 1-Click 3D Map Pin */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/30 dark:border-slate-700/50 text-[11px]">
                                <div className="space-y-0.5">
                                  <div className={subCls}>
                                    <span className={`font-semibold ${mutedCls}`}>Lead Unit: </span>
                                    <strong className={headingCls}>{act.w}</strong>
                                  </div>
                                  {act.target_zones && (
                                    <div className={`font-mono text-[10px] ${mutedCls}`}>
                                      Priority Zones: <strong className={subCls}>{act.target_zones}</strong>
                                    </div>
                                  )}
                                </div>

                                {onFocusMapTarget && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      const mapped = mapActionCodeToLayer(act.i);
                                      onFocusMapTarget({
                                        layer: mapped.layer,
                                        code: act.i
                                      });
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition shadow-sm ${
                                      isDark
                                        ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border-teal-500/40'
                                        : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-900'
                                    }`}
                                    title="Close modal and highlight target layer on the 3D map"
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Locate on 3D Map</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Methodology & Basis Note */}
                  <div className={`mt-4 p-3.5 rounded-2xl border text-[11px] leading-relaxed ${insetCls}`}>
                    <span className={`font-extrabold ${headingCls}`}>Basis of Quantified Targets: </span>
                    <span className={mutedCls}>
                      Action categories follow <strong>DOH Philippines</strong> (4S Dengue Strategy &amp; Post-Flood Doxycycline PEP) and <strong>NKTI</strong> renal triage directives, linked to <strong>UP NOAH / MGB</strong> flood-prone barangays. Resource volumes are decision-support planning heuristics scaled from the model&apos;s predicted monthly case burden.
                    </span>
                  </div>
                </div>

                {/* Right 5 Cols: Flood-Vulnerable Barangays & Health Facilities Card */}
                <div className="lg:col-span-5">
                  <FloodZonesCard
                    city={result.city}
                    zones={result.flood_zones}
                    theme={theme}
                    onFocusMapTarget={onFocusMapTarget}
                  />
                </div>
              </div>
            )}
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
