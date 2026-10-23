import React, { useState } from 'react';
import {
  PredictionResult,
  getHistoricalPoints,
  MONTH_NAMES
} from '../services/api';
import { NCRCityPolygon } from './metroManilaData';
import { ScatterChart } from './ScatterChart';
import { FloodZonesCard } from './FloodZonesCard';
import {
  CloudRain,
  History,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  MapPin,
  BarChart3,
  UploadCloud,
  X
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
  onToggleAnalyticsModal
}) => {
  const [showFormula, setShowFormula] = useState<boolean>(false);

  const history = getHistoricalPoints(activeDisease);

  const handlePreset = (multiplier: number, fixedMin?: number) => {
    const baseRain = 250;
    const computed = fixedMin ? Math.max(baseRain * multiplier, fixedMin) : baseRain * multiplier;
    onRainfallChange(Math.round(computed));
  };

  return (
    <>
      {/* LEFT FLOATING HUD DOCK: Scenario Controls & Metro Manila City Inspector */}
      <aside className="fixed top-20 left-4 z-20 w-[340px] sm:w-[375px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-3 pointer-events-auto pr-1">
        {/* Disease & Target City Switcher Card */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Metro Manila Target
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-teal-400">
              2 of 17 NCR Cities Colored
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90">
            <button
              onClick={() => onDiseaseChange('dengue')}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                activeDisease === 'dengue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Meteorological Inputs
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Updates city elevation &amp; expected cases live
              </p>
            </div>
            <CloudRain className="w-4 h-4 text-sky-500" />
          </div>

          {/* Calendar Month */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Calendar Month
            </label>
            <select
              value={month}
              onChange={e => onMonthChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                This Month&apos;s Rainfall
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={1500}
                  value={rainfall}
                  onChange={e => onRainfallChange(Number(e.target.value))}
                  className="w-18 px-2 py-0.5 text-right text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] font-semibold text-slate-400">mm</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={1200}
              step={10}
              value={rainfall}
              onChange={e => onRainfallChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />

            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              <button
                onClick={() => handlePreset(0.3)}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Dry (75)
              </button>
              <button
                onClick={() => handlePreset(1.0)}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Typical
              </button>
              <button
                onClick={() => handlePreset(1.8)}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Wet (450)
              </button>
              <button
                onClick={() => handlePreset(2.6, 680)}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition"
              >
                Typhoon
              </button>
            </div>
          </div>

          {/* Leptospirosis Lagged Rain & Case Weeks */}
          {activeDisease === 'lepto' && (
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Last Month&apos;s Rainfall
                  </label>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-300">
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
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Case Weeks:
                </span>
                <div className="flex gap-1.5">
                  {[4, 5].map(w => (
                    <button
                      key={w}
                      onClick={() => onNWeeksChange(w)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        nWeeks === w
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {w} wks
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formula Accordion */}
          <div className="pt-1">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <span>Model specification &amp; features</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showFormula ? 'rotate-180' : ''}`}
              />
            </button>
            {showFormula && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                {activeDisease === 'dengue' ? (
                  <>
                    <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      log E[cases] = β₀ + β₁ · z(rain)
                    </div>
                    <p>
                      PoissonRegressor (α = 0.1) trained on Quezon City 2010–2025 monthly surveillance.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-mono font-bold text-teal-600 dark:text-teal-400">
                      log E[rate] = α + β_c·z(rain) + β_p·z(prev) + Season
                    </div>
                    <p>
                      HistGradientBoosting / Poisson model trained on Manila 2001–2012 monthly admissions.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metro Manila City Inspector Card (Works for all 17 NCR cities) */}
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Metro Manila City Inspector
              </h3>
            </div>
            {inspectedCity && (
              <button
                onClick={onClearCity}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {inspectedCity ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {inspectedCity.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inspectedCity.focusId === 'dengue'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                      : inspectedCity.focusId === 'lepto'
                      ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {inspectedCity.isFocus ? 'In Model Scope' : 'Grayscale · Out of Scope'}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
                <span>{inspectedCity.district}</span>
                <span>{inspectedCity.areaKm2} km²</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 text-[11px] space-y-1">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Basin: </span>
                  <span className="text-slate-600 dark:text-slate-300">{inspectedCity.riverBasin}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Flood-Prone Zones: </span>
                  <span className="text-slate-600 dark:text-slate-300">{inspectedCity.floodHotspots}</span>
                </div>
              </div>

              {!inspectedCity.isFocus && (
                <button
                  onClick={onOpenUploadForCity}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload CSV for {inspectedCity.name}</span>
                </button>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Quezon City</strong> (Rose) and <strong>City of Manila</strong> (Teal) are colored with active model data. Hover or click any of the <strong>17 Metro Manila cities</strong> on the map to inspect its river basin and flood hotspots.
            </p>
          )}
        </div>
      </aside>

      {/* RIGHT FLOATING HUD DOCK: Expected Monthly Cases KPI & Similar Past Month */}
      {result && (
        <aside className="fixed top-20 right-4 z-20 w-[340px] sm:w-[385px] max-h-[calc(100vh-145px)] overflow-y-auto space-y-3 pointer-events-auto pl-1">
          {/* Expected Cases KPI Card */}
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl relative overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25"
              style={{
                backgroundColor: activeDisease === 'dengue' ? '#E11D48' : '#0D9488'
              }}
            />

            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Monthly Nowcast Estimate
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {result.city} · {result.month_name}
                </h3>
              </div>

              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                  result.level_id === 'high'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                    : result.level_id === 'up'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                }`}
              >
                {result.level_label}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                {result.predicted_cases.toLocaleString()}
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  expected {result.disease.toLowerCase()} cases
                </div>
                <div className="font-mono text-[11px]">
                  95% CI: {result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Baseline comparison bar */}
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-2 mt-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  vs. Historical {result.month_name} Mean ({Math.round(result.baseline_cases)})
                </span>
                <span
                  className={`font-mono ${
                    result.pct_diff_baseline >= 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {result.pct_diff_baseline >= 0 ? '+' : ''}
                  {result.pct_diff_baseline}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (result.predicted_cases /
                        (Math.max(result.predicted_cases, result.baseline_cases) * 1.15)) *
                        100
                    )}%`,
                    backgroundColor: activeDisease === 'dengue' ? '#E11D48' : '#0D9488'
                  }}
                />
              </div>
            </div>

            {/* Why this number */}
            <div className="mt-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-slate-800 dark:text-slate-200 space-y-1">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium leading-relaxed">{result.why_text}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{result.effect_text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Most Similar Past Month Card */}
          {result.similar_months && result.similar_months.length > 0 && (
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Most Similar Past Month
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-200 dark:border-transparent">
                  {result.similar_months[0].sim}% match
                </span>
              </div>

              {(() => {
                const top = result.similar_months[0];
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 mb-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {MONTH_NAMES[top.month - 1]} {top.year}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-teal-400">
                        {top.cases.toLocaleString()} actual cases
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
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
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[10px] border border-slate-200 dark:border-slate-800"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {MONTH_NAMES[s.month - 1].slice(0, 3)} {s.year}
                    </div>
                    <div className="font-mono text-slate-500">{s.cases} cases</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Button to Open Full Charts, Flood Zones & LGU Action Protocol Overlay */}
          <button
            onClick={() => onToggleAnalyticsModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition dark:bg-gradient-to-r dark:from-teal-600 dark:to-sky-600 dark:hover:from-teal-500 dark:hover:to-sky-500"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Open Response Curve, Flood Zones &amp; LGU Actions</span>
          </button>
        </aside>
      )}

      {/* FLOATING ANALYTICS, FLOOD ZONES & LGU ACTIONS MODAL OVERLAY */}
      {showAnalyticsModal && result && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Deep-Dive Analytics &amp; Response Protocol
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {result.disease} Nowcast · {result.city} ({result.month_name})
                </h2>
              </div>
              <button
                onClick={() => onToggleAnalyticsModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scatter Plot & Poisson Response Curve */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Rainfall vs. {result.disease} Cases in {result.city}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Historical monthly observations and fitted Poisson response curve
              </p>
              <ScatterChart
                disease={activeDisease}
                cityName={result.city}
                history={history}
                currentMonth={month}
                currentRain={rainfall}
                predictedCases={result.predicted_cases}
                topSimilar={result.similar_months[0] || null}
                predictFn={r =>
                  activeDisease === 'dengue'
                    ? Math.exp(Math.log(170) + 0.42 * ((Math.log1p(r) - 5.0) / 1.1))
                    : Math.exp(0.35 + 0.38 * ((Math.log1p(r) - 5.0) / 1.1)) * nWeeks
                }
              />
            </div>

            {/* Flood Zones & Operational Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FloodZonesCard city={result.city} zones={result.flood_zones} />

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      LGU &amp; Hospital Action Protocol
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Triggered for {result.level_label} ({result.predicted_cases} cases)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono font-bold text-xs shrink-0">
                        {act.i}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {act.t}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {act.d}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400">
                          Owner: {act.w}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
