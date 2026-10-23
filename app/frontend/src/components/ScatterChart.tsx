import React from 'react';
import { SimilarMonth } from '../services/api';

interface Point {
  year: number;
  month: number;
  rain: number;
  cases: number;
}

interface ScatterChartProps {
  disease: 'dengue' | 'lepto';
  cityName: string;
  history: Point[];
  currentMonth: number;
  currentRain: number;
  predictedCases: number;
  topSimilar: SimilarMonth | null;
  predictFn: (rain: number) => number;
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  disease,
  cityName,
  history,
  currentMonth,
  currentRain,
  predictedCases,
  topSimilar,
  predictFn
}) => {
  const W = 720;
  const H = 320;
  const m = { l: 56, r: 24, t: 20, b: 46 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;

  const maxDataRain = Math.max(currentRain, ...history.map(d => d.rain));
  const maxDataCases = Math.max(predictedCases, ...history.map(d => d.cases));

  const xMax = niceMax(maxDataRain * 1.05);
  const yMax = niceMax(maxDataCases * 1.08);

  const X = (v: number) => m.l + (v / xMax) * iw;
  const Y = (v: number) => m.t + ih - (v / yMax) * ih;

  // Generate model curve
  const curvePoints: { x: number; y: number }[] = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const rx = (xMax / steps) * i;
    const cy = predictFn(rx);
    curvePoints.push({ x: rx, y: cy });
  }

  const curvePath = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.x).toFixed(1)} ${Y(Math.min(p.y, yMax)).toFixed(1)}`)
    .join(' ');

  const ticks = 5;

  return (
    <div className="w-full overflow-x-auto select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-h-[340px]"
        preserveAspectRatio="xMidYMid meet"
      >
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
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray={i === 0 ? 'none' : '3 3'}
              />
              <text
                x={m.l - 10}
                y={yPos + 4}
                textAnchor="end"
                className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
              >
                {Math.round(yv).toLocaleString()}
              </text>
              <text
                x={xPos}
                y={H - m.b + 18}
                textAnchor="middle"
                className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500"
              >
                {Math.round(xv).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Axis titles */}
        <text
          x={m.l + iw / 2}
          y={H - 8}
          textAnchor="middle"
          className="text-xs font-semibold fill-slate-600 dark:fill-slate-300"
        >
          Monthly rainfall (mm)
        </text>
        <text
          transform={`translate(16, ${m.t + ih / 2}) rotate(-90)`}
          textAnchor="middle"
          className="text-xs font-semibold fill-slate-600 dark:fill-slate-300"
        >
          Reported monthly cases
        </text>

        {/* Historical observations points */}
        {history.map((d, i) => {
          const isSameMonth = d.month === currentMonth;
          return (
            <circle
              key={i}
              cx={X(Math.min(d.rain, xMax))}
              cy={Y(Math.min(d.cases, yMax))}
              r={isSameMonth ? 4.5 : 3}
              className={`transition-all ${
                isSameMonth
                  ? 'fill-teal-500/80 stroke-white dark:stroke-slate-900 stroke-1'
                  : 'fill-slate-300/60 dark:fill-slate-600/60'
              }`}
            >
              <title>{`${d.month}/${d.year}: ${d.rain} mm, ${d.cases} cases`}</title>
            </circle>
          );
        })}

        {/* Model Regression Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke={disease === 'dengue' ? '#E11D48' : '#0D9488'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Similar Month Marker */}
        {topSimilar && (
          <g>
            <circle
              cx={X(Math.min(topSimilar.rain, xMax))}
              cy={Y(Math.min(topSimilar.cases, yMax))}
              r="10"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="animate-spin"
            />
            <circle
              cx={X(Math.min(topSimilar.rain, xMax))}
              cy={Y(Math.min(topSimilar.cases, yMax))}
              r="4"
              fill="#F59E0B"
            >
              <title>{`Most similar: ${topSimilar.month}/${topSimilar.year}`}</title>
            </circle>
          </g>
        )}

        {/* User Input Pin */}
        {(() => {
          const ux = X(Math.min(currentRain, xMax));
          const uy = Y(Math.min(predictedCases, yMax));
          const isRight = ux > W - 160;
          return (
            <g>
              <line
                x1={ux}
                x2={ux}
                y1={H - m.b}
                y2={uy}
                stroke={disease === 'dengue' ? '#E11D48' : '#0D9488'}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={ux}
                cy={uy}
                r="7"
                fill={disease === 'dengue' ? '#E11D48' : '#0D9488'}
                className="stroke-white dark:stroke-slate-900 stroke-2"
              />
              <rect
                x={isRight ? ux - 135 : ux + 12}
                y={uy - 14}
                width="125"
                height="22"
                rx="6"
                className="fill-slate-900/90 dark:fill-slate-100/95"
              />
              <text
                x={isRight ? ux - 72 : ux + 74}
                y={uy + 1}
                textAnchor="middle"
                className="text-[11px] font-bold fill-white dark:fill-slate-900"
              >
                {`Scenario: ${predictedCases.toLocaleString()} cases`}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Past observations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span>Same calendar month</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-1 rounded"
            style={{ backgroundColor: disease === 'dengue' ? '#E11D48' : '#0D9488' }}
          />
          <span>Model response curve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-500/20" />
          <span>Most similar past month</span>
        </div>
      </div>
    </div>
  );
};
