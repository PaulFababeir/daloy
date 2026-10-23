import React, { useState, useEffect } from 'react';
import { Philippines3DMap } from './components/Philippines3DMap';
import { CaseEstimateView } from './components/CaseEstimateView';
import { UploadCityView } from './components/UploadCityView';
import { MethodView } from './components/MethodView';
import { fetchPrediction, PredictionResult } from './services/api';
import { NCRCityPolygon } from './components/metroManilaData';
import {
  Activity,
  UploadCloud,
  FileText,
  Moon,
  Sun,
  Eye,
  EyeOff,
  BarChart3,
  X
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'predict' | 'upload' | 'method'>('predict');
  const [activeDisease, setActiveDisease] = useState<'dengue' | 'lepto'>('dengue');
  const [month, setMonth] = useState<number>(8);
  const [rainfall, setRainfall] = useState<number>(430);
  const [prevRain, setPrevRain] = useState<number>(400);
  const [nWeeks, setNWeeks] = useState<number>(4);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [inspectedCity, setInspectedCity] = useState<NCRCityPolygon | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Initialize dark mode on mount for crisp 3D contrast
  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'healthy') {
          setBackendOnline(true);
        }
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  // Fetch live prediction whenever scenario inputs change (debounced 35ms for smooth slider dragging)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      fetchPrediction({
        disease: activeDisease,
        month,
        rain: rainfall,
        prev_rain: prevRain,
        n_weeks: nWeeks
      }).then(res => {
        if (!isCancelled) {
          setPredictionResult(res);
        }
      });
    }, predictionResult ? 35 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [activeDisease, month, rainfall, prevRain, nWeeks]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 w-screen h-screen overflow-hidden select-none transition-colors ${
      isDark ? 'bg-[#070E14] text-[#E8F1F3]' : 'bg-[#F7F4EE] text-stone-900'
    }`}>
      {/* FULL-SCREEN 3D METRO MANILA MAP BACKGROUND (17 NCR CITIES) */}
      <div className="absolute inset-0 z-0">
        <Philippines3DMap
          activeDisease={activeDisease}
          onSelectCity={d => {
            setActiveDisease(d);
            setActiveView('predict');
          }}
          onInspectCity={city => setInspectedCity(city)}
          inspectedCity={inspectedCity}
          rainfallIntensity={rainfall}
          predictedCases={predictionResult?.predicted_cases ?? 270}
          theme={theme}
          paused={showAnalyticsModal || activeView !== 'predict'}
        />
      </div>

      {/* TOP FLOATING HUD HEADER OVERLAY */}
      <header className="fixed top-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Brand & Map Legend Pill */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto transition-colors ${
          isDark
            ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
            : 'bg-[#FFFDF9]/95 text-stone-900 border border-[#E7E1D6] shadow-stone-300/40'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                DALOY
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-[#F4EFE6] text-stone-700 border-[#E7E1D6]'
              }`}>
                Metro Manila 3D
              </span>
            </div>
            <p className={`text-[10px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Trace the rain, target the outbreak
            </p>
          </div>

          {/* City Color Key */}
          <div className={`hidden xl:flex items-center gap-3 pl-3 ml-1 border-l text-[10px] font-semibold ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-[#E7E1D6] text-stone-600'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E11D48]" /> Quezon City (Dengue)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488]" /> Manila (Leptospirosis)
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${isDark ? 'bg-slate-500' : 'bg-stone-400'}`} /> Other 15 Cities (Hoverable)
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs Pill */}
        <nav className={`flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto transition-colors ${
          isDark
            ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
            : 'bg-[#FFFDF9]/95 text-stone-900 border border-[#E7E1D6] shadow-stone-300/40'
        }`}>
          <button
            onClick={() => {
              setActiveView('predict');
              setShowAnalyticsModal(false);
              setHudVisible(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'predict' && !showAnalyticsModal
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3D Map &amp; Nowcast</span>
          </button>

          <button
            onClick={() => {
              setActiveView('predict');
              setShowAnalyticsModal(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'predict' && showAnalyticsModal
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Charts &amp; Action Plan</span>
          </button>

          <button
            onClick={() => {
              setActiveView('upload');
              setShowAnalyticsModal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'upload'
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Your City CSV</span>
          </button>

          <button
            onClick={() => {
              setActiveView('method');
              setShowAnalyticsModal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'method'
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Method &amp; Data</span>
          </button>
        </nav>

        {/* Right Controls Pill: API Status, Hide/Show HUD Cards, Theme Toggle */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto transition-colors ${
          isDark
            ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
            : 'bg-[#FFFDF9]/95 text-stone-900 border border-[#E7E1D6] shadow-stone-300/40'
        }`}>
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              backendOnline
                ? isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-500/15 text-emerald-700'
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#F4EFE6] text-stone-600 border border-[#E7E1D6]/70'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-500 animate-pulse' : isDark ? 'bg-slate-400' : 'bg-stone-400'
              }`}
            />
            <span>{backendOnline ? 'FastAPI Live' : 'Local Engine'}</span>
          </div>

          {activeView === 'predict' && (
            <button
              onClick={() => setHudVisible(!hudVisible)}
              title={hudVisible ? 'Hide overlay cards to view full map' : 'Show overlay cards'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
                  : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-800 border-[#E7E1D6]/70'
              }`}
            >
              {hudVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{hudVisible ? 'Hide Cards' : 'Show Cards'}</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-700 border-[#E7E1D6]/70'
            }`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* FLOATING HUD SIDE CARDS FOR CASE ESTIMATE VIEW */}
      {activeView === 'predict' && hudVisible && (
        <CaseEstimateView
          activeDisease={activeDisease}
          onDiseaseChange={setActiveDisease}
          month={month}
          onMonthChange={setMonth}
          rainfall={rainfall}
          onRainfallChange={setRainfall}
          prevRain={prevRain}
          onPrevRainChange={setPrevRain}
          nWeeks={nWeeks}
          onNWeeksChange={setNWeeks}
          result={predictionResult}
          inspectedCity={inspectedCity}
          onClearCity={() => setInspectedCity(null)}
          onOpenUploadForCity={() => setActiveView('upload')}
          showAnalyticsModal={showAnalyticsModal}
          onToggleAnalyticsModal={setShowAnalyticsModal}
          theme={theme}
        />
      )}

      {/* FLOATING MODAL OVERLAY FOR "YOUR CITY CSV" VIEW */}
      {activeView === 'upload' && (
        <div className={`fixed inset-0 z-30 flex items-center justify-center p-4 pt-20 pb-16 pointer-events-auto transition-colors ${
          isDark ? 'bg-slate-950/85' : 'bg-stone-900/55'
        }`}>
          <div className={`w-full max-w-5xl max-h-full overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 relative transition-colors ${
            isDark
              ? 'bg-slate-900 text-white border-slate-800 shadow-black/60'
              : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
          }`}>
            <button
              onClick={() => setActiveView('predict')}
              className={`absolute top-5 right-5 p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent'
                  : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6] border-[#E7E1D6]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
            <UploadCityView disease={activeDisease} theme={theme} />
          </div>
        </div>
      )}

      {/* FLOATING MODAL OVERLAY FOR "METHOD & DATA" VIEW */}
      {activeView === 'method' && (
        <div className={`fixed inset-0 z-30 flex items-center justify-center p-4 pt-20 pb-16 pointer-events-auto transition-colors ${
          isDark ? 'bg-slate-950/85' : 'bg-stone-900/55'
        }`}>
          <div className={`w-full max-w-5xl max-h-full overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 relative transition-colors ${
            isDark
              ? 'bg-slate-900 text-white border-slate-800 shadow-black/60'
              : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-stone-300/50'
          }`}>
            <button
              onClick={() => setActiveView('predict')}
              className={`absolute top-5 right-5 p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent'
                  : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#EAE3D6] border-[#E7E1D6]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
            <MethodView theme={theme} />
          </div>
        </div>
      )}
    </div>
  );
};
