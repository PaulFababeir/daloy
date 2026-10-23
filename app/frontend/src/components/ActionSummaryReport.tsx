import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PredictionResult, ActionItem, MONTH_NAMES } from '../services/api';
import {
  X,
  Printer,
  Copy,
  Check,
  CheckSquare,
  Square,
  FileText,
  ChevronDown
} from 'lucide-react';

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
  { id: 'now', label: 'Do now', sub: '48 h', match: (u: string) => /immediate|0\s*[–-]\s*(24|48)\s*h/i.test(u) },
  { id: '72h', label: 'This week', sub: '72 h', match: (u: string) => /72/.test(u) },
  { id: 'weeks', label: 'Within 14 days', sub: '7–14 d', match: (u: string) => /\b7\b|14|day|week/i.test(u) }
];

type GroupedAction = { act: ActionItem; idx: number };

const groupActions = (actions: ActionItem[]) => {
  const groups = TIMELINE_GROUPS.map(g => ({ ...g, items: [] as GroupedAction[] }));
  const other: GroupedAction[] = [];
  actions.forEach((act, idx) => {
    const group = groups.find(g => g.match(act.urgency || 'Immediate'));
    (group ? group.items : other).push({ act, idx });
  });
  const result = groups.filter(g => g.items.length > 0);
  if (other.length > 0) result.push({ id: 'other', label: 'Other', sub: '', match: () => true, items: other });
  return result;
};

// One-line verdict per risk level. Wording is ours (decision support), not an official DOH tier.
const VERDICT: Record<string, { text: string; cls: string }> = {
  low: { text: 'Routine readiness: no surge response needed.', cls: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  typ: { text: 'Normal season: keep standard readiness.', cls: 'bg-teal-50 text-teal-900 border-teal-200' },
  up: { text: 'Above typical: prepare supplies and staff now.', cls: 'bg-amber-50 text-amber-900 border-amber-200' },
  high: { text: 'High: activate surge response.', cls: 'bg-rose-50 text-rose-900 border-rose-200' }
};

const DISEASE_LABEL: Record<string, string> = { dengue: 'dengue', lepto: 'leptospirosis' };

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

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
  const [showFull, setShowFull] = useState(false);

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
  const pct = result.pct_diff_baseline;
  const verdict = VERDICT[result.level_id] || VERDICT.typ;
  const diseaseName = DISEASE_LABEL[activeDisease] || result.disease.toLowerCase();
  const generatedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

  // Hotspots: high-risk areas only; if none are high, the top two by level.
  const sortedZones = [...(result.flood_zones || [])].sort((a, b) => b.level - a.level);
  const highZones = sortedZones.filter(z => /high/i.test(z.risk));
  const hotspots = (highZones.length > 0 ? highZones : sortedZones.slice(0, 2)).map(z =>
    z.name.replace(/^Barangay\s+/i, '')
  );
  const hotspotNote = highZones.length > 0 ? 'high flood risk' : 'highest flood risk listed';

  const comparison =
    pct === 0
      ? `in line with a typical ${result.month_name}`
      : `${Math.abs(pct)}% ${pct < 0 ? 'below' : 'above'} a typical ${result.month_name}`;

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
      aria-label="LGU action summary"
    >
      <div className="daloy-report-panel-in w-full max-w-3xl my-auto" onClick={e => e.stopPropagation()}>
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
            aria-label="Close summary"
            className={`p-1.5 rounded-xl border transition ${btnCls}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report sheet: always a light "paper" document so it prints cleanly */}
        <article className="daloy-report-sheet bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-7 space-y-5">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                <FileText className="w-3.5 h-3.5" />
                DALOY · LGU Action Summary
              </p>
              <h2 className="text-lg font-extrabold mt-1 uppercase tracking-wide">
                {diseaseName} · {result.city} · {result.month_name}
              </h2>
              <p className="text-[11px] text-stone-500">Generated {generatedAt}</p>
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

          {/* Headline + verdict */}
          <section className="space-y-2">
            <p className="text-base sm:text-lg leading-snug">
              <strong className="font-extrabold">~{result.predicted_cases.toLocaleString()} {diseaseName} cases</strong>{' '}
              expected ({result.ci_lower.toLocaleString()}–{result.ci_upper.toLocaleString()}), {comparison}.
            </p>
            <p className={`inline-block text-sm font-bold px-3 py-1.5 rounded-lg border ${verdict.cls}`}>
              → {verdict.text}
            </p>
          </section>

          {/* One line per deadline */}
          <section className="border-y border-stone-200 divide-y divide-stone-100">
            {groups.map(group => (
              <div key={group.id} className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[8.5rem_1fr_11rem] gap-x-4 gap-y-1 py-2.5">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-teal-800">{group.label}</p>
                  {group.sub && <p className="text-[10px] font-mono text-stone-500">{group.sub}</p>}
                </div>
                <ul className="space-y-0.5 text-sm">
                  {group.items.map(({ act, idx }) => {
                    const done = !!checkedActions[`${activeDisease}-${idx}`];
                    return (
                      <li key={idx} className={done ? 'line-through text-stone-400' : ''}>
                        <span className="font-semibold">{act.t}</span>
                        {act.metric && <span className="text-stone-500">: {act.metric}</span>}
                      </li>
                    );
                  })}
                </ul>
                <p className="col-start-2 sm:col-start-auto text-xs text-stone-600 sm:text-right">
                  {unique(group.items.map(g => g.act.w)).join(' · ')}
                </p>
              </div>
            ))}
          </section>

          {/* Where + historical match */}
          <section className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[8.5rem_1fr] gap-x-4 gap-y-2 text-sm">
            {hotspots.length > 0 && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-wide text-teal-800 pt-0.5">Hotspots</p>
                <p>
                  <span className="font-semibold">{hotspots.join(' · ')}</span>{' '}
                  <span className="text-stone-500">({hotspotNote})</span>
                </p>
              </>
            )}
            {top && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-wide text-teal-800 pt-0.5">Similar rain</p>
                <p>
                  <span className="font-semibold">
                    {MONTH_NAMES[top.month - 1]} {top.year}
                  </span>{' '}
                  <span className="text-stone-500">
                    ({top.rain.toLocaleString()} mm rain; {top.cases.toLocaleString()} actual cases)
                  </span>
                </p>
              </>
            )}
          </section>

          {/* Full action table (optional; printed only when open) */}
          <div className="daloy-no-print">
            <button
              type="button"
              onClick={() => setShowFull(v => !v)}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
              aria-expanded={showFull}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFull ? 'rotate-180' : ''}`} />
              {showFull ? 'Hide full action table' : 'Show full action table'}
              <span className="font-mono font-normal text-stone-500 ml-1">
                ({completed} of {total} done)
              </span>
            </button>
          </div>

          {showFull && (
            <section className="overflow-x-auto rounded-xl border border-stone-200">
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
                    <th className="px-2 py-2 text-center">Done</th>
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">Target</th>
                    <th className="px-2 py-2">Lead unit</th>
                    <th className="px-2 py-2">Priority zones</th>
                  </tr>
                </thead>
                <tbody>
                  {result.actions.map((act, idx) => {
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
            </section>
          )}

          {/* Footer */}
          <footer className="pt-3 border-t border-stone-200 text-[10px] leading-relaxed text-stone-500">
            Nowcast from this month&apos;s rainfall, not a forecast. Targets are planning estimates scaled from predicted
            cases, not DOH quotas; decisions remain with LGU and DOH officers. Source: DALOY
            {result.model_name ? ` · ${result.model_name}` : ''} ·{' '}
            {result.is_live_backend ? 'live model backend' : 'offline client estimate'}.
          </footer>
        </article>
      </div>
    </div>,
    document.body
  );
};
