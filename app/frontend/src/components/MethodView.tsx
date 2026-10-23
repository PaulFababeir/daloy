import React from 'react';
import { Database, Filter, Cpu, CheckCircle2, AlertOctagon, BookOpen } from 'lucide-react';

interface MethodViewProps {
  theme?: 'light' | 'dark';
}

export const MethodView: React.FC<MethodViewProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const cardCls = isDark
    ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
    : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-sm';

  const insetCls = isDark
    ? 'bg-slate-800/60 text-slate-200 border-slate-800'
    : 'bg-[#F4EFE6] text-stone-800 border-[#E7E1D6]';

  const headingCls = isDark ? 'text-white' : 'text-stone-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-stone-600';
  const borderCls = isDark ? 'border-slate-800' : 'border-[#E7E1D6]';

  return (
    <div className="space-y-8">
      {/* 4-Stage Pipeline */}
      <div className={`p-8 rounded-3xl border ${cardCls}`}>
        <h2 className={`text-xl font-bold mb-2 ${headingCls}`}>
          Methodological Pipeline
        </h2>
        <p className={`text-xs mb-8 max-w-2xl ${mutedCls}`}>
          From satellite precipitation observations to operational epidemiological predictions in 4 reproducible steps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${insetCls}`}>
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${
              isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-[#E8E1D3] text-stone-800'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-teal-400' : 'text-stone-600'}`}>
              Step 1 · Collect
            </div>
            <h4 className={`text-sm font-bold mt-1 ${headingCls}`}>
              Meteorology &amp; Cases
            </h4>
            <p className={`text-xs mt-2 ${mutedCls}`}>
              NASA POWER daily precipitation aggregated to monthly totals. DOH disease surveillance reports from Quezon City (2010–2025) and Manila (2001–2012).
            </p>
          </div>

          <div className={`p-5 rounded-2xl border ${insetCls}`}>
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${
              isDark ? 'bg-sky-950/60 text-sky-400' : 'bg-sky-100 text-sky-800'
            }`}>
              <Filter className="w-5 h-5" />
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
              Step 2 · Harmonize
            </div>
            <h4 className={`text-sm font-bold mt-1 ${headingCls}`}>
              Lag &amp; Transformations
            </h4>
            <p className={`text-xs mt-2 ${mutedCls}`}>
              Log-transform precipitation <code className={`text-[11px] px-1 py-0.5 rounded font-mono ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-[#E8E1D3] text-stone-800'}`}>log(1 + rain)</code>, compute 1-month historical rainfall lags, and extract circular month harmonics <code className={`text-[11px] px-1 py-0.5 rounded font-mono ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-[#E8E1D3] text-stone-800'}`}>sin/cos(2πm/12)</code>.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border ${insetCls}`}>
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${
              isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-100 text-rose-800'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
              Step 3 · Model
            </div>
            <h4 className={`text-sm font-bold mt-1 ${headingCls}`}>
              Poisson Regressors
            </h4>
            <p className={`text-xs mt-2 ${mutedCls}`}>
              Non-negative integer count regression with log link and L2 regularization. Handles overdispersion and structural disease count characteristics.
            </p>
          </div>

          <div className={`p-5 rounded-2xl border ${insetCls}`}>
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${
              isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Step 4 · Validate
            </div>
            <h4 className={`text-sm font-bold mt-1 ${headingCls}`}>
              LOYO Cross-Validation
            </h4>
            <p className={`text-xs mt-2 ${mutedCls}`}>
              Leave-One-Year-Out validation ensures genuine out-of-sample generalization across severe El Niño and La Niña monsoon cycles without temporal leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className={`p-8 rounded-3xl border ${cardCls}`}>
        <h3 className={`text-base font-bold mb-4 ${headingCls}`}>
          Model Specifications &amp; Parameters
        </h3>

        <div className={`overflow-x-auto rounded-2xl border ${borderCls}`}>
          <table className="w-full text-left text-xs">
            <thead className={isDark ? 'bg-slate-800 text-slate-300 font-bold' : 'bg-[#F4EFE6] text-stone-700 font-bold'}>
              <tr>
                <th className="p-3.5">Disease &amp; City</th>
                <th className="p-3.5">Training Horizon</th>
                <th className="p-3.5">Algorithm</th>
                <th className="p-3.5">Primary Meteorological Drivers</th>
                <th className="p-3.5">Evaluation Protocol</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderCls} ${isDark ? 'text-slate-300' : 'text-stone-800'}`}>
              <tr className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#F9F6F0]'}>
                <td className="p-3.5 font-bold">Dengue · Quezon City</td>
                <td className="p-3.5 font-mono">2010–2025 (180 months)</td>
                <td className="p-3.5">PoissonRegressor (α = 0.1, L2 penalty)</td>
                <td className="p-3.5">Current month rainfall, standardized log(1 + rain)</td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">15-fold LOYO-CV</td>
              </tr>
              <tr className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#F9F6F0]'}>
                <td className="p-3.5 font-bold">Leptospirosis · Manila</td>
                <td className="p-3.5 font-mono">2001–2012 (144 months)</td>
                <td className="p-3.5">Multi-lag Poisson / Gradient Boosting</td>
                <td className="p-3.5">Current + previous month rainfall, circular seasonality, case weeks offset</td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">11-fold LOYO-CV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations and APA Citations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-6 rounded-3xl border ${cardCls}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h4 className={`text-sm font-bold ${headingCls}`}>
              Assumptions and Limitations
            </h4>
          </div>
          <ul className={`list-disc list-inside text-xs space-y-2 leading-relaxed ${mutedCls}`}>
            <li>
              <strong>Surveillance Lag:</strong> The model nowcasts cases that occurred during the rainfall period, giving 2–3 weeks lead time over official reporting pipelines.
            </li>
            <li>
              <strong>Non-Transferability:</strong> Models are trained specifically on QC and Manila municipal baselines and require local calibration before application to other LGUs.
            </li>
            <li>
              <strong>Extreme Outliers:</strong> Unprecedented typhoon inundation (e.g. Ondoy, Carina) may exhibit non-linear compounding beyond historical training bounds.
            </li>
          </ul>
        </div>

        <div className={`p-6 rounded-3xl border ${cardCls}`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h4 className={`text-sm font-bold ${headingCls}`}>
              Key Academic &amp; Clinical Citations
            </h4>
          </div>
          <ul className={`text-xs space-y-2 leading-relaxed ${mutedCls}`}>
            <li>
              Department of Health Philippines. (2025). <em>National Leptospirosis and Dengue Surveillance Bulletin</em>. Epidemiology Bureau, DOH.
            </li>
            <li>
              National Kidney and Transplant Institute (NKTI). (2025). <em>Special Ward Activation &amp; Post-Flood Prophylaxis Clinical Directives</em>.
            </li>
            <li>
              NASA Langley Research Center. (2026). <em>NASA POWER Meteorological and Solar Energy API</em>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
