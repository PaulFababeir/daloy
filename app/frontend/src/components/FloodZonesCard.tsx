import React from 'react';
import { FloodZone } from '../services/api';
import { Waves, AlertTriangle } from 'lucide-react';

interface FloodZonesCardProps {
  city: string;
  zones: FloodZone[];
  theme?: 'light' | 'dark';
}

export const FloodZonesCard: React.FC<FloodZonesCardProps> = React.memo(({ city, zones, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${
      isDark
        ? 'bg-slate-900 border-slate-800 text-white'
        : 'bg-[#FFFDF9] border-[#E7E1D6] text-stone-900'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-teal-50 text-teal-700'}`}>
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Flood-Vulnerable Areas · {city}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Low-lying corridors and drainage choke points with elevated exposure risk
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
          isDark
            ? 'bg-slate-800 text-slate-300 border-transparent'
            : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
        }`}>
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
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition ${
                isDark
                  ? 'bg-slate-800/60 border-slate-800 text-white hover:border-slate-700'
                  : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900 hover:border-stone-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {zone.name}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  {zone.desc}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  isHigh
                    ? isDark ? 'bg-rose-950/80 text-rose-300' : 'bg-rose-100 text-rose-900'
                    : isMedium
                    ? isDark ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-900'
                    : isDark ? 'bg-emerald-950/80 text-emerald-300' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {zone.risk} Risk
              </span>
            </div>
          );
        })}
      </div>

      <div className={`mt-4 flex items-center gap-2 text-xs p-3 rounded-xl border ${
        isDark
          ? 'bg-teal-950/30 text-slate-400 border-teal-900/40'
          : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
      }`}>
        <AlertTriangle className={`w-4 h-4 shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
        <span>
          Heavy rainfall triggers runoff into these basins first, creating standing pools for <em>Aedes aegypti</em> breeding and floodwaters harboring <em>Leptospira</em>.
        </span>
      </div>
    </div>
  );
});
