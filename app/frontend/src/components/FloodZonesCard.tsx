import React from 'react';
import { FloodZone } from '../services/api';
import {
  VULNERABLE_BARANGAY_ZONES,
  getFacilitiesForCity,
  ActionLayerFilter
} from './actionMapData';
import { Waves, AlertTriangle, MapPin, Building2, Cross } from 'lucide-react';

interface FloodZonesCardProps {
  city: string;
  zones: FloodZone[];
  theme?: 'light' | 'dark';
  onFocusMapTarget?: (opts: {
    layer: ActionLayerFilter;
    code: string;
    coords?: [number, number];
  }) => void;
}

export const FloodZonesCard: React.FC<FloodZonesCardProps> = React.memo(
  ({ city, zones, theme = 'dark', onFocusMapTarget }) => {
    const isDark = theme === 'dark';
    const facilities = getFacilitiesForCity(city);

    return (
      <div className="space-y-5">
        {/* 1. Vulnerable Barangay Grids Card */}
        <div
          className={`p-6 rounded-3xl border shadow-sm transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-[#FFFDF9] border-[#E7E1D6] text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  isDark ? 'bg-orange-950/60 text-orange-400' : 'bg-orange-50 text-orange-700'
                }`}
              >
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  Vulnerable Barangay Grids · {city}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  3D elevated flood-basin polygons rendered directly on the map
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                isDark
                  ? 'bg-slate-800 text-slate-300 border-transparent'
                  : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
              }`}
            >
              UP NOAH / MGB
            </span>
          </div>

          <div className="space-y-2.5 mt-3">
            {zones.map((zone, idx) => {
              const isHigh = zone.level === 3;
              const isMedium = zone.level === 2;
              const matchedPoly = VULNERABLE_BARANGAY_ZONES.find(
                z =>
                  z.city === city &&
                  (z.name.toLowerCase().includes(zone.name.toLowerCase().slice(0, 12)) ||
                    zone.name.toLowerCase().includes(z.name.toLowerCase().slice(0, 12)))
              );

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-800 text-white hover:border-slate-700'
                      : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900 hover:border-stone-400'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {zone.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isHigh
                            ? isDark
                              ? 'bg-orange-950/80 text-orange-300 border border-orange-500/30'
                              : 'bg-orange-100 text-orange-900'
                            : isMedium
                              ? isDark
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-100 text-amber-900'
                              : isDark
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {zone.risk} Risk
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-snug ${
                        isDark ? 'text-slate-400' : 'text-stone-600'
                      }`}
                    >
                      {zone.desc}
                    </p>
                  </div>

                  {onFocusMapTarget && (
                    <button
                      type="button"
                      onClick={() =>
                        onFocusMapTarget({
                          layer: 'hotspots',
                          code: matchedPoly?.id || zone.name,
                          coords: matchedPoly?.center
                        })
                      }
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                        isDark
                          ? 'bg-slate-900 hover:bg-orange-500/20 text-orange-300 border-slate-700 hover:border-orange-500/40'
                          : 'bg-[#FFFDF9] hover:bg-orange-50 text-orange-800 border-[#E2DBD0]'
                      }`}
                      title="Zoom to 3D Barangay Grid on Map"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Map Grid</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className={`mt-3.5 flex items-center gap-2 text-xs p-3 rounded-xl border ${
              isDark
                ? 'bg-teal-950/30 text-slate-400 border-teal-900/40'
                : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}
            />
            <span>
              Each barangay above is rendered as an elevated 3D tactical grid block on the map,
              scaled by flood vulnerability and rainfall intensity.
            </span>
          </div>
        </div>

        {/* 2. Verified Referral Hospitals & Health Centers Network Card */}
        {facilities.length > 0 && (
          <div
            className={`p-6 rounded-3xl border shadow-sm transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-[#FFFDF9] border-[#E7E1D6] text-stone-900'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isDark ? 'bg-sky-950/60 text-sky-400' : 'bg-sky-50 text-sky-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    Mapped Health Facilities · {city} ({facilities.length})
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                    DOH/LGU tertiary hospitals (Sky pillars) &amp; health centers (Emerald diamonds)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {facilities.map(fac => (
                <div
                  key={fac.id}
                  className={`p-3 rounded-2xl border flex items-start justify-between gap-2.5 transition ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                      : 'bg-[#F4EFE6] border-[#E7E1D6] hover:border-stone-400'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {fac.type === 'hospital' ? (
                        <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      ) : (
                        <Cross className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-extrabold truncate ${
                          isDark ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {fac.name}
                      </span>
                    </div>
                    <div
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isDark ? 'text-slate-400' : 'text-stone-500'
                      }`}
                    >
                      {fac.category} · Codes: [{fac.actionCodes.join(', ')}]
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 leading-snug ${
                        isDark ? 'text-slate-300' : 'text-stone-700'
                      }`}
                    >
                      {fac.role}
                    </p>
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
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                        isDark
                          ? 'bg-slate-900 hover:bg-sky-500/20 text-sky-300 border-slate-700 hover:border-sky-500/40'
                          : 'bg-[#FFFDF9] hover:bg-sky-50 text-sky-800 border-[#E2DBD0]'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Zoom</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
