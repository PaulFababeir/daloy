import React from 'react';
import { FloodZone } from '../services/api';
import { Waves, AlertTriangle } from 'lucide-react';

interface FloodZonesCardProps {
  city: string;
  zones: FloodZone[];
}

export const FloodZonesCard: React.FC<FloodZonesCardProps> = ({ city, zones }) => {
  return (
    <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-slate-900 border border-[#E7E1D6] dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Flood-Vulnerable Areas · {city}
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-400">
              Low-lying corridors and drainage choke points with elevated exposure risk
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F4EFE6] dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-[#E7E1D6]/60 dark:border-transparent">
          UP NOAH / MGB
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {zones.map((zone, idx) => {
          const isHigh = zone.level === 3;
          const isMedium = zone.level === 2;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#F4EFE6] dark:bg-slate-800/60 border border-[#E7E1D6] dark:border-slate-800 flex items-start justify-between gap-3 hover:border-stone-400 dark:hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900 dark:text-white">
                    {zone.name}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                  {zone.desc}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  isHigh
                    ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300'
                    : isMedium
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}
              >
                {zone.risk} Risk
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-stone-700 dark:text-slate-400 bg-[#F4EFE6] dark:bg-teal-950/30 p-3 rounded-xl border border-[#E7E1D6] dark:border-teal-900/40">
        <AlertTriangle className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
        <span>
          Heavy rainfall triggers runoff into these basins first, creating standing pools for <em>Aedes aegypti</em> breeding and floodwaters harboring <em>Leptospira</em>.
        </span>
      </div>
    </div>
  );
};
