import React, { useState, useMemo } from 'react';
import {
  SimilarMonth,
  ResponseCurvePoint,
  SeasonalProfilePoint,
  HistoricalPoint,
  MON3_NAMES,
  MONTH_NAMES
} from '../services/api';

interface ScatterChartProps {
  disease: 'dengue' | 'lepto';
  cityName: string;
  history: HistoricalPoint[];
  currentMonth: number;
  currentRain: number;
  predictedCases: number;
  ciLower?: number;
  ciUpper?: number;
  baselineCases?: number;
  topSimilar: SimilarMonth | null;
  responseCurve?: ResponseCurvePoint[];
  seasonalProfile?: SeasonalProfilePoint[];
  predictFn: (rain: number) => number;
  theme?: 'light' | 'dark';
}

function niceMax(v: number): number {
  if (v <= 0) return 10;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1.2 ? 1.2 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

const ScatterChartInner: React.FC<ScatterChartProps> = ({
  disease,
  cityName,
  history,
  currentMonth,
  currentRain,
  predictedCases,
  ciUpper,
  baselineCases = 50,
  topSimilar,
  responseCurve,
  seasonalProfile,
  predictFn,
  theme = 'dark'
}) => {
  const [activeTab, setActiveTab] = useState<'curve' | 'seasonal'>('curve');
  const [hoveredPoint, setHoveredPoint] = useState<{
    title: string;
    subtitle: string;
    x: number;
    y: number;
  } | null>(null);

  const isDark = theme === 'dark';
  const accentColor = disease === 'dengue' ? '#E11D48' : '#0D9488';

  const W = 760;
  const H = 340;
  const m = { l: 58, r: 28, t: 24, b: 48 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;

  const curveData: ResponseCurvePoint[] = useMemo(() => {
    if (responseCurve && responseCurve.length > 1) {
      return responseCurve;
    }
    const maxR = Math.max(600, currentRain * 1.15, ...history.map(d => d.rain));
    const pts: ResponseCurvePoint[] = [];
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const rx = (maxR / steps) * i;
      const cy = predictFn(rx);
      const margin = 1.96 * Math.sqrt(Math.max(cy, 1));
      pts.push({
        rain: Math.round(rx * 10) / 10,
        cases: Math.round(cy),
        ci_lower: Math.max(0, Math.round(cy - margin)),
        ci_upper: Math.round(cy + margin)
      });
    }
    return pts;
  }, [responseCurve, currentRain, history, predictFn]);

  const { xMax, yMax } = useMemo(() => {
    const maxDataRain = Math.max(
      currentRain,
      ...history.map(d => d.rain),
      ...curveData.map(d => d.rain)
    );
    const maxDataCases = Math.max(
      predictedCases,
      ciUpper ?? predictedCases,
      baselineCases * 1.75,
      ...history.map(d => d.cases),
      ...curveData.map(d => d.ci_upper || d.cases)
    );
    return {
      xMax: niceMax(maxDataRain * 1.04),
      yMax: niceMax(maxDataCases * 1.08)
    };
  }, [currentRain, predictedCases, ciUpper, baselineCases, history, curveData]);

  const X = (v: number) => m.l + (Math.min(Math.max(0, v), xMax) / xMax) * iw;
  const Y = (v: number) => m.t + ih - (Math.min(Math.max(0, v), yMax) / yMax) * ih;

  const { curvePath, ciAreaPath } = useMemo(() => {
    const cPath = curveData
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.rain).toFixed(1)} ${Y(p.cases).toFixed(1)}`)
      .join(' ');

    if (curveData.length < 2) return { curvePath: cPath, ciAreaPath: '' };
    const upper = curveData.map(
      (p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.rain).toFixed(1)} ${Y(p.ci_upper).toFixed(1)}`
    );
    const lower = [...curveData]
      .reverse()
      .map(p => `L ${X(p.rain).toFixed(1)} ${Y(p.ci_lower).toFixed(1)}`);
    return {
      curvePath: cPath,
      ciAreaPath: `${upper.join(' ')} ${lower.join(' ')} Z`
    };
  }, [curveData, xMax, yMax]);

  const watchThreshold = Math.round(baselineCases * 1.2);
  const outbreakThreshold = Math.round(baselineCases * 1.6);

  const yWatch = Y(watchThreshold);
  const yOutbreak = Y(outbreakThreshold);
  const yBottom = m.t + ih;
  const ticks = 5;

  // Memoize the 180 historical SVG circles so hovering tooltips never re-renders them
  const historicalCircles = useMemo(() => {
    return history.map((d, i) => {
      const isSameMonth = d.month === currentMonth;
      const cx = X(d.rain);
      const cy = Y(d.cases);
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={isSameMonth ? 5 : 3.2}
          fill={
            isSameMonth
              ? '#0EA5E9'
              : isDark
              ? 'rgba(148, 163, 184, 0.45)'
              : 'rgba(120, 113, 108, 0.45)'
          }
          stroke={isSameMonth ? (isDark ? '#0F172A' : '#FFFDF9') : 'none'}
          strokeWidth={isSameMonth ? 1.5 : 0}
          className="cursor-pointer"
          onMouseEnter={() =>
            setHoveredPoint({
              title: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
              subtitle: `${d.rain} mm rain → ${d.cases.toLocaleString()} actual cases`,
              x: cx,
              y: cy
            })
          }
        />
      );
    });
  }, [history, currentMonth, xMax, yMax, isDark]);

  // Seasonal profile data (12 months)
  const seasonalData: SeasonalProfilePoint[] = useMemo(() => {
    if (seasonalProfile && seasonalProfile.length === 12) {
      return seasonalProfile;
    }
    return MONTH_NAMES.map((mName, idx) => {
      const mNum = idx + 1;
      const subset = history.filter(d => d.month === mNum);
      const meanCases =
        subset.reduce((s, d) => s + d.cases, 0) / Math.max(1, subset.length);
      const sortedRain = subset.map(d => d.rain).sort((a, b) => a - b);
      const medRain = sortedRain[Math.floor(sortedRain.length / 2)] || 0;
      return {
        month: mNum,
        month_name: mName,
        short_name: MON3_NAMES[idx],
        baseline_cases: Math.round(meanCases * 10) / 10,
        typical_rain: Math.round(medRain * 10) / 10
      };
    });
  }, [seasonalProfile, history]);

  const maxSeasonalCases = niceMax(
    Math.max(
      predictedCases * 1.15,
      ...seasonalData.map(s => s.baseline_cases * 1.35)
    )
  );

  return (
    <div className="w-full select-none space-y-3">
      {/* Header & Chart Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {activeTab === 'curve'
              ? `Rainfall vs. ${disease === 'dengue' ? 'Dengue' : 'Leptospirosis'} Response Curve (${cityName})`
              : `12-Month Seasonal Baseline vs. Active ${MONTH_NAMES[currentMonth - 1]} Scenario`}
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            {activeTab === 'curve'
              ? `Fitted ML response curve with 95% confidence band, outbreak risk thresholds, and ${history.length} historical monthly records`
              : `Compares your ${MONTH_NAMES[currentMonth - 1]} forecast (${predictedCases.toLocaleString()} cases) against ${cityName}'s year-round historical monthly average`}
          </p>
        </div>

        <div
          className={`inline-flex p-1 rounded-xl border self-start ${
            isDark
              ? 'bg-slate-900/90 border-slate-700/80'
              : 'bg-[#FFFDF9] border-[#E7E1D6]'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('curve');
              setHoveredPoint(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'curve'
                ? isDark
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-stone-900 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Response Curve &amp; Thresholds
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('seasonal');
              setHoveredPoint(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'seasonal'
                ? isDark
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-stone-900 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            12-Month Seasonal Profile
          </button>
        </div>
      </div>

      {/* TAB 1: RESPONSE CURVE & RISK ZONES */}
      {activeTab === 'curve' ? (
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto max-h-[360px]"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Shaded Epidemiological Risk Zones */}
            {outbreakThreshold < yMax && (
              <rect
                x={m.l}
                y={m.t}
                width={iw}
                height={Math.max(0, yOutbreak - m.t)}
                fill={isDark ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.07)'}
              />
            )}
            {watchThreshold < yMax && (
              <rect
                x={m.l}
                y={Math.max(m.t, yOutbreak)}
                width={iw}
                height={Math.max(0, yWatch - Math.max(m.t, yOutbreak))}
                fill={isDark ? 'rgba(245, 158, 11, 0.07)' : 'rgba(245, 158, 11, 0.08)'}
              />
            )}
            <rect
              x={m.l}
              y={Math.max(m.t, yWatch)}
              width={iw}
              height={Math.max(0, yBottom - Math.max(m.t, yWatch))}
              fill={isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.05)'}
            />

            {/* Grid lines and ticks */}
            {Array.from({ length: ticks + 1 }).map((_, i) => {
              const yv = (yMax / ticks) * i;
              const xv = (xMax / ticks) * i;
              const yPos = Y(yv);
              const xPos = X(xv);

              return (
                <g key={i}>
                  <line
                    x1={m.l}
                    x2={W - m.r}
                    y1={yPos}
                    y2={yPos}
                    stroke={isDark ? '#334155' : '#DDD6C7'}
                    strokeOpacity={i === 0 ? 0.9 : 0.55}
                    strokeDasharray={i === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={m.l - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill={isDark ? '#94A3B8' : '#57534E'}
                    className="text-[11px] font-mono"
                  >
                    {Math.round(yv).toLocaleString()}
                  </text>
                  <text
                    x={xPos}
                    y={H - m.b + 18}
                    textAnchor="middle"
                    fill={isDark ? '#94A3B8' : '#57534E'}
                    className="text-[11px] font-mono"
                  >
                    {Math.round(xv).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Outbreak & Watch Threshold Reference Lines */}
            {outbreakThreshold > 0 && outbreakThreshold < yMax * 0.95 && (
              <g>
                <line
                  x1={m.l}
                  x2={W - m.r}
                  y1={yOutbreak}
                  y2={yOutbreak}
                  stroke="#F43F5E"
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                  strokeOpacity="0.8"
                />
                <text
                  x={W - m.r - 6}
                  y={yOutbreak - 5}
                  textAnchor="end"
                  fill={isDark ? '#FDA4AF' : '#BE123C'}
                  className="text-[10px] font-mono font-bold"
                >
                  Outbreak Threshold (1.6x · {outbreakThreshold} cases)
                </text>
              </g>
            )}

            {watchThreshold > 0 && watchThreshold < yMax * 0.92 && (
              <g>
                <line
                  x1={m.l}
                  x2={W - m.r}
                  y1={yWatch}
                  y2={yWatch}
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeOpacity="0.75"
                />
                <text
                  x={W - m.r - 6}
                  y={yWatch - 5}
                  textAnchor="end"
                  fill={isDark ? '#FCD34D' : '#B45309'}
                  className="text-[10px] font-mono font-semibold"
                >
                  Watch Threshold (1.2x · {watchThreshold} cases)
                </text>
              </g>
            )}

            {/* Axis titles */}
            <text
              x={m.l + iw / 2}
              y={H - 8}
              textAnchor="middle"
              fill={isDark ? '#CBD5E1' : '#44403C'}
              className="text-xs font-bold"
            >
              Monthly Rainfall (mm)
            </text>
            <text
              transform={`translate(16, ${m.t + ih / 2}) rotate(-90)`}
              textAnchor="middle"
              fill={isDark ? '#CBD5E1' : '#44403C'}
              className="text-xs font-bold"
            >
              Monthly Cases
            </text>

            {/* 95% Confidence Interval Band */}
            {ciAreaPath && (
              <path
                d={ciAreaPath}
                fill={accentColor}
                fillOpacity={isDark ? 0.16 : 0.14}
              />
            )}

            {/* Memoized Historical observations points */}
            {historicalCircles}

            {/* Fitted ML Model Regression Curve */}
            <path
              d={curvePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Most Similar Historical Month Marker */}
            {topSimilar && (() => {
              const sx = X(topSimilar.rain);
              const sy = Y(topSimilar.cases);
              return (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      title: `Most Similar: ${MONTH_NAMES[topSimilar.month - 1]} ${topSimilar.year} (${topSimilar.sim}% match)`,
                      subtitle: `${topSimilar.rain} mm rain → ${topSimilar.cases.toLocaleString()} cases`,
                      x: sx,
                      y: sy
                    })
                  }
                >
                  <circle
                    cx={sx}
                    cy={sy}
                    r="11"
                    fill="rgba(245, 158, 11, 0.15)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                  <circle
                    cx={sx}
                    cy={sy}
                    r="5"
                    fill="#F59E0B"
                    stroke={isDark ? '#0F172A' : '#FFFDF9'}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })()}

            {/* Active Scenario Pin (Directly on Model Curve) */}
            {(() => {
              const ux = X(currentRain);
              const uy = Y(predictedCases);
              const isRight = ux > W - 185;
              const isTop = uy < m.t + 36;
              const boxX = isRight ? ux - 166 : ux + 12;
              const boxY = isTop ? uy + 8 : uy - 34;

              return (
                <g>
                  <line
                    x1={ux}
                    x2={ux}
                    y1={yBottom}
                    y2={uy}
                    stroke={accentColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={m.l}
                    x2={ux}
                    y1={uy}
                    y2={uy}
                    stroke={accentColor}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />

                  <circle
                    cx={ux}
                    cy={uy}
                    r="12"
                    fill={accentColor}
                    fillOpacity="0.2"
                  />
                  <circle
                    cx={ux}
                    cy={uy}
                    r="6.5"
                    fill={accentColor}
                    stroke={isDark ? '#0F172A' : '#FFFDF9'}
                    strokeWidth="2.5"
                  />

                  <rect
                    x={boxX}
                    y={boxY}
                    width="154"
                    height="28"
                    rx="8"
                    fill={isDark ? '#0F172A' : '#1C1917'}
                    stroke={accentColor}
                    strokeWidth="1.5"
                  />
                  <text
                    x={boxX + 77}
                    y={boxY + 18}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="text-[11px] font-mono font-extrabold"
                  >
                    {`Nowcast: ${predictedCases.toLocaleString()} cases`}
                  </text>
                </g>
              );
            })()}

            {/* Hover Tooltip Overlay inside SVG */}
            {hoveredPoint && (() => {
              const tx = Math.min(Math.max(hoveredPoint.x - 95, m.l + 4), W - m.r - 195);
              const ty = Math.max(hoveredPoint.y - 48, m.t + 4);
              return (
                <g pointerEvents="none">
                  <rect
                    x={tx}
                    y={ty}
                    width="190"
                    height="38"
                    rx="8"
                    fill={isDark ? '#1E293B' : '#292524'}
                    stroke={isDark ? '#475569' : '#57534E'}
                    strokeWidth="1"
                  />
                  <text
                    x={tx + 10}
                    y={ty + 15}
                    fill="#F8FAFC"
                    className="text-[10px] font-bold"
                  >
                    {hoveredPoint.title}
                  </text>
                  <text
                    x={tx + 10}
                    y={ty + 29}
                    fill="#38BDF8"
                    className="text-[10px] font-mono"
                  >
                    {hoveredPoint.subtitle}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Legend */}
          <div
            className={`flex flex-wrap items-center justify-center gap-5 mt-2 text-xs ${
              isDark ? 'text-slate-300' : 'text-stone-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-4 h-1 rounded-full inline-block"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-semibold">ML Response Curve (+95% CI Band)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block border-2 border-white dark:border-slate-900"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-semibold">
                Your Scenario ({Math.round(currentRain)} mm → {predictedCases.toLocaleString()} cases)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
              <span>Same Month ({MON3_NAMES[currentMonth - 1]} History)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400/70 inline-block" />
              <span>Other Historical Months</span>
            </div>
            {topSimilar && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-500/30 inline-block" />
                <span>
                  Closest Analogue ({MON3_NAMES[topSimilar.month - 1]} {topSimilar.year}: {topSimilar.cases} cases)
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: 12-MONTH SEASONAL BASELINE VS ACTIVE SCENARIO */
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto max-h-[360px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {Array.from({ length: ticks + 1 }).map((_, i) => {
              const yv = (maxSeasonalCases / ticks) * i;
              const yPos = m.t + ih - (yv / maxSeasonalCases) * ih;
              return (
                <g key={i}>
                  <line
                    x1={m.l}
                    x2={W - m.r}
                    y1={yPos}
                    y2={yPos}
                    stroke={isDark ? '#334155' : '#DDD6C7'}
                    strokeOpacity={i === 0 ? 0.9 : 0.55}
                    strokeDasharray={i === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={m.l - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill={isDark ? '#94A3B8' : '#57534E'}
                    className="text-[11px] font-mono"
                  >
                    {Math.round(yv).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {seasonalData.map((s, idx) => {
              const colW = iw / 12;
              const centerX = m.l + colW * idx + colW / 2;
              const isSelected = s.month === currentMonth;
              const baseH = (s.baseline_cases / maxSeasonalCases) * ih;
              const baseY = m.t + ih - baseH;

              const scenH = isSelected ? (predictedCases / maxSeasonalCases) * ih : 0;
              const scenY = m.t + ih - scenH;

              return (
                <g key={s.month}>
                  {isSelected && (
                    <rect
                      x={m.l + colW * idx + 4}
                      y={m.t}
                      width={colW - 8}
                      height={ih}
                      rx="8"
                      fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.04)'}
                    />
                  )}

                  <rect
                    x={isSelected ? centerX - 18 : centerX - 12}
                    y={baseY}
                    width={isSelected ? 16 : 24}
                    height={Math.max(2, baseH)}
                    rx="4"
                    fill={isDark ? '#475569' : '#A8A29E'}
                  />

                  {isSelected && (
                    <>
                      <rect
                        x={centerX + 2}
                        y={scenY}
                        width={18}
                        height={Math.max(4, scenH)}
                        rx="4"
                        fill={accentColor}
                      />
                      <text
                        x={centerX + 11}
                        y={Math.max(m.t + 12, scenY - 6)}
                        textAnchor="middle"
                        fill={accentColor}
                        className="text-[11px] font-mono font-extrabold"
                      >
                        {predictedCases.toLocaleString()}
                      </text>
                    </>
                  )}

                  {!isSelected && (
                    <text
                      x={centerX}
                      y={Math.max(m.t + 12, baseY - 5)}
                      textAnchor="middle"
                      fill={isDark ? '#94A3B8' : '#78716C'}
                      className="text-[9px] font-mono"
                    >
                      {Math.round(s.baseline_cases)}
                    </text>
                  )}

                  <text
                    x={centerX}
                    y={H - m.b + 18}
                    textAnchor="middle"
                    fill={
                      isSelected
                        ? accentColor
                        : isDark
                        ? '#CBD5E1'
                        : '#44403C'
                    }
                    className={`text-[11px] font-mono ${
                      isSelected ? 'font-extrabold' : 'font-semibold'
                    }`}
                  >
                    {s.short_name}
                  </text>
                  <text
                    x={centerX}
                    y={H - m.b + 32}
                    textAnchor="middle"
                    fill={isDark ? '#64748B' : '#78716C'}
                    className="text-[9px] font-mono"
                  >
                    {Math.round(s.typical_rain)}mm
                  </text>
                </g>
              );
            })}

            <text
              transform={`translate(16, ${m.t + ih / 2}) rotate(-90)`}
              textAnchor="middle"
              fill={isDark ? '#CBD5E1' : '#44403C'}
              className="text-xs font-bold"
            >
              Monthly Cases
            </text>
          </svg>

          <div
            className={`flex flex-wrap items-center justify-center gap-6 mt-2 text-xs ${
              isDark ? 'text-slate-300' : 'text-stone-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-stone-400 dark:bg-slate-600 inline-block" />
              <span>Historical Monthly Baseline Cases (with median rain below month)</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded inline-block"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-bold">
                Active {MONTH_NAMES[currentMonth - 1]} Scenario ({predictedCases.toLocaleString()} cases vs.{' '}
                {Math.round(baselineCases).toLocaleString()} avg)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ScatterChart = React.memo(ScatterChartInner);
