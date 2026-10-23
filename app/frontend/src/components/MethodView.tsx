import React from 'react';
import { Database, Filter, Cpu, CheckCircle2, AlertOctagon, BookOpen } from 'lucide-react';

export const MethodView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 4-Stage Pipeline */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Methodological Pipeline
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-2xl">
          From satellite precipitation observations to operational epidemiological predictions in 4 reproducible steps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-teal-950/60 text-slate-800 dark:text-teal-400 w-fit mb-3">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-teal-400">
              Step 1 · Collect
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Meteorology &amp; Cases
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              NASA POWER daily precipitation aggregated to monthly totals. DOH disease surveillance reports from Quezon City (2010–2025) and Manila (2001–2012).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 w-fit mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Step 2 · Harmonize
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Lag &amp; Transformations
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Log-transform precipitation <code className="text-[11px]">log(1 + rain)</code>, compute 1-month historical rainfall lags, and extract circular month harmonics <code className="text-[11px]">sin/cos(2πm/12)</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-fit mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Step 3 · Model
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Poisson Regressors
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Non-negative integer count regression with log link and L2 regularization. Handles overdispersion and structural disease count characteristics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Step 4 · Validate
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              LOYO Cross-Validation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Leave-One-Year-Out validation ensures genuine out-of-sample generalization across severe El Niño and La Niña monsoon cycles without temporal leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Model Specifications &amp; Parameters
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3.5">Disease &amp; City</th>
                <th className="p-3.5">Training Horizon</th>
                <th className="p-3.5">Algorithm</th>
                <th className="p-3.5">Primary Meteorological Drivers</th>
                <th className="p-3.5">Evaluation Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3.5 font-bold">Dengue · Quezon City</td>
                <td className="p-3.5 font-mono">2010–2025 (180 months)</td>
                <td className="p-3.5">PoissonRegressor (α = 0.1, L2 penalty)</td>
                <td className="p-3.5">Current month rainfall, standardized log(1 + rain)</td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">15-fold LOYO-CV</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Leptospirosis · Manila</td>
                <td className="p-3.5 font-mono">2001–2012 (144 months)</td>
                <td className="p-3.5">Multi-lag Poisson / Gradient Boosting</td>
                <td className="p-3.5">Current + previous month rainfall, circular seasonality, case weeks offset</td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">11-fold LOYO-CV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations and APA Citations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Assumptions and Limitations
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
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

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-slate-700 dark:text-teal-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Key Academic &amp; Clinical Citations
            </h4>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
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
