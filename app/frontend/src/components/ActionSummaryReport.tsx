import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PredictionResult, ActionItem, MONTH_NAMES } from '../services/api';
import { X, Printer, Copy, Check, CheckSquare, Square, FileText } from 'lucide-react';

interface ActionSummaryReportProps {
  result: PredictionResult;
  activeDisease: 'dengue' | 'lepto';
  checkedActions: Record<string, boolean>;
  onToggleCheck: (key: string) => void;
  onCopyBrief: () => void;
  copiedBrief: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

// Deadline buckets, in display order. Urgency strings come from the action list in services/api.ts.
const TIMELINE_GROUPS = [
  { id: 'now', label: 'Next 48 hours', match: (u: string) => /immediate|0\s*[–-]\s*(24|48)\s*h/i.test(u) },
  { id: '72h', label: 'Within 72 hours', match: (u: string) => /72/.test(u) },
  { id: 'weeks', label: 'Within 7–14 days', match: (u: string) => /\b7\b|14|day|week/i.test(u) }
];

const groupActions = (actions: ActionItem[]) => {
  const groups = TIMELINE_GROUPS.map(g => ({ ...g, items: [] as { act: ActionItem; idx: number }[] }));
  const other: { act: ActionItem; idx: number }[] = [];
  actions.forEach((act, idx) => {
    const urgency = act.urgency || 'Immediate';
    const group = groups.find(g => g.match(urgency));
    (group ? group.items : other).push({ act, idx });
  });
  const result = groups.filter(g => g.items.length > 0);
  if (other.length > 0) result.push({ id: 'other', label: 'Other actions', match: () => true, items: other });
  return result;
};

const riskChipCls = (risk: string) => {
  const r = risk.toLowerCase();
  if (r.includes('high')) return 'bg-rose-50 text-rose-800 border-rose-200';
  if (r.includes('medium') || r.includes('moderate')) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-emerald-50 text-emerald-800 border-emerald-200';
};

export const ActionSummaryReport: React.FC<ActionSummaryReportProps> = ({
  result,
  activeDisease,
  checkedActions,
  onToggleCheck,
  onCopyBrief,
  copiedBrief,
  onClose,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups = groupActions(result.actions);
  const total = result.actions.length;
  const completed = result.actions.filter((_, idx) => checkedActions[`${activeDisease}-${idx}`]).length;
  const top = result.similar_months?.[0];
  const zones = [...(result.flood_zones || [])].sort((a, b) => b.level - a.level);
  const generatedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  const pct = result.pct_diff_baseline;

  const btnCls = isDark
    ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
    : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-800 border-[#E7E1D6]';

  return createPortal(
    <div
      className={`daloy-report-portal daloy-report-backdrop-in fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto ${
        isDark ? 'bg-slate-950/85' : 'bg-stone-900/55'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="LGU action summary report"
    >
      <div className="daloy-report-panel-in w-full max-w-4xl my-auto" onClick={e => e.stopPropagation()}>
        {/* Toolbar (hidden when printing) */}
        <div className="daloy-no-print flex flex-wrap items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => window.print()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${btnCls}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            type="button"
            onClick={onCopyBrief}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${btnCls}`}
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close summary report"
            className={`p-1.5 rounded-xl border transition ${btnCls}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report sheet: always rendered as a light "paper" document so it prints cleanly */}
        <article className="daloy-report-sheet bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                <FileText className="w-3.5 h-3.5" />
                DALOY · LGU Action Summary
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                <span className="capitalize">{result.disease}</span> Nowcast · {result.city}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {result.month_name} ({result.n_weeks} case weeks) · Generated {generatedAt}
              </p>
            </div>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                result.level_id === 'high'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : result.level_id === 'up'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {result.level_label}
            </span>
          </header>

          {/* Key figures */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Predicted cases</p>
              <p className="text-2xl font-extrabold font-mono">{result.predicted_cases.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500">
                Range {result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Vs. typical {result.month_name}</p>
              <p className="text-2xl font-extrabold font-mono">
                {pct >= 0 ? '+' : ''}
                {pct}%
              </p>
              <p className="text-[11px] text-stone-500">
                Typical: {Math.round(result.baseline_cases).toLocaleString()} cases
              </p>
            </div>
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Rainfall input</p>
              <p className="text-2xl font-extrabold font-mono">{result.rain} mm</p>
              <p className="text-[11px] text-stone-500">
                {result.prev_rain !== null ? `Previous month: ${result.prev_rain} mm` : 'This month'}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Most similar past month</p>
              {top ? (
                <>
                  <p className="text-lg font-extrabold leading-tight mt-1">
                    {MONTH_NAMES[top.month - 1]} {top.year}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {top.cases.toLocaleString()} actual cases · {top.sim}% match
                  </p>
                </>
              ) : (
                <p className="text-sm text-stone-500 mt-1">Not available</p>
              )}
            </div>
          </section>

          {/* What this means */}
          <section className="p-4 rounded-xl border border-teal-200 bg-teal-50/60">
            <p className="text-sm font-extrabold text-teal-900">{result.takeaway_title || result.level_label}</p>
            <p className="text-xs text-teal-900/80 mt-1 leading-relaxed">{result.takeaway_body || result.why_text}</p>
          </section>

          {/* Action timeline */}
          <section>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wide">Action timeline</h3>
              <span className="text-[11px] font-mono text-stone-500">
                {completed} of {total} done
              </span>
            </div>

            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id} className="daloy-report-group">
                  <p className="text-xs font-extrabold text-teal-800 mb-1.5">{group.label}</p>
                  <div className="overflow-x-auto rounded-xl border border-stone-200">
                    <table className="w-full min-w-[640px] table-fixed text-left text-xs">
                      <colgroup>
                        <col className="w-12" />
                        <col className="w-[27%]" />
                        <col className="w-[28%]" />
                        <col className="w-[19%]" />
                        <col />
                      </colgroup>
                      <thead className="bg-stone-100 text-[10px] uppercase tracking-wide text-stone-600">
                        <tr>
                          <th className="px-2 py-2 w-10 text-center">Done</th>
                          <th className="px-2 py-2">Action</th>
                          <th className="px-2 py-2">Target</th>
                          <th className="px-2 py-2">Lead unit</th>
                          <th className="px-2 py-2">Priority zones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(({ act, idx }) => {
                          const key = `${activeDisease}-${idx}`;
                          const done = !!checkedActions[key];
                          return (
                            <tr key={key} className="border-t border-stone-200 align-top">
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => onToggleCheck(key)}
                                  aria-label={`Mark ${act.t} as ${done ? 'not done' : 'done'}`}
                                  className="focus:outline-none"
                                >
                                  {done ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-400" />
                                  )}
                                </button>
                              </td>
                              <td className="px-2 py-2">
                                <p className={`font-bold ${done ? 'line-through text-stone-400' : ''}`}>
                                  {idx + 1}. {act.t}
                                </p>
                                {act.urgency && <p className="text-[10px] text-stone-500 mt-0.5">{act.urgency}</p>}
                              </td>
                              <td className="px-2 py-2 font-mono">{act.metric || act.d}</td>
                              <td className="px-2 py-2">{act.w}</td>
                              <td className="px-2 py-2 text-stone-600">{act.target_zones || result.city}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Priority barangays */}
          {zones.length > 0 && (
            <section>
              <h3 className="text-sm font-extrabold uppercase tracking-wide mb-2">Flood-vulnerable barangays</h3>
              <div className="flex flex-wrap gap-1.5">
                {zones.map(z => (
                  <span
                    key={z.name}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskChipCls(z.risk)}`}
                  >
                    {z.name.replace(/^Barangay\s+/i, '')} · {z.risk}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="pt-4 border-t border-stone-200 text-[10px] leading-relaxed text-stone-500 space-y-1">
            <p>
              <strong>Nowcast, not a forecast:</strong> the estimate uses this month&apos;s rainfall, which is available
              within days, while surveillance reports arrive 2–3 weeks late.
            </p>
            <p>
              <strong>Resource targets</strong> are planning estimates scaled from the predicted monthly cases, not official
              DOH quotas. Decisions remain with LGU and DOH officers.
            </p>
            <p>
              Source: DALOY{result.model_name ? ` · ${result.model_name}` : ''} ·{' '}
              {result.is_live_backend ? 'live model backend' : 'offline client estimate'}
            </p>
          </footer>
        </article>
      </div>
    </div>,
    document.body
  );
};
