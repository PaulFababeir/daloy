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

  // Fetch live prediction whenever scenario inputs change
  useEffect(() => {
    let isCancelled = false;
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
    return () => {
      isCancelled = true;
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

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#F7F4EE] dark:bg-[#070E14] text-stone-900 dark:text-[#E8F1F3] select-none">
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
        />
      </div>

      {/* TOP FLOATING HUD HEADER OVERLAY */}
      <header className="fixed top-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Brand & Map Legend Pill */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#FFFDF9]/95 dark:bg-slate-900/90 backdrop-blur-xl border border-[#E7E1D6] dark:border-slate-800/90 shadow-xl pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-[#FFFDF9] dark:bg-slate-950 border border-[#E7E1D6] dark:border-slate-700/80 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
            <img src="/favicon.svg" alt="DALOY Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-stone-900 dark:text-white">
                DALOY
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4EFE6] text-stone-700 border border-[#E7E1D6] dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30">
                Metro Manila 3D
              </span>
            </div>
            <p className="text-[10px] text-stone-600 dark:text-slate-400 hidden sm:block">
              Trace the rain, target the outbreak
            </p>
          </div>

          {/* City Color Key */}
          <div className="hidden xl:flex items-center gap-3 pl-3 ml-1 border-l border-[#E7E1D6] dark:border-slate-800 text-[10px] font-semibold text-stone-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E11D48]" /> Quezon City (Dengue)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488]" /> Manila (Leptospirosis)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-400" /> Other 15 Cities (Hoverable)
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs Pill */}
        <nav className="flex items-center gap-1 p-1.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-slate-900/90 backdrop-blur-xl border border-[#E7E1D6] dark:border-slate-800/90 shadow-xl pointer-events-auto">
          <button
            onClick={() => {
              setActiveView('predict');
              setShowAnalyticsModal(false);
              setHudVisible(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'predict' && !showAnalyticsModal
                ? 'bg-stone-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4EFE6] dark:hover:bg-slate-800/60'
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
                ? 'bg-stone-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4EFE6] dark:hover:bg-slate-800/60'
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
                ? 'bg-stone-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4EFE6] dark:hover:bg-slate-800/60'
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
                ? 'bg-stone-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F4EFE6] dark:hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Method &amp; Data</span>
          </button>
        </nav>

        {/* Right Controls Pill: API Status, Hide/Show HUD Cards, Theme Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#FFFDF9]/95 dark:bg-slate-900/90 backdrop-blur-xl border border-[#E7E1D6] dark:border-slate-800/90 shadow-xl pointer-events-auto">
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              backendOnline
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-[#F4EFE6] dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-[#E7E1D6]/70 dark:border-transparent'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span>{backendOnline ? 'FastAPI Live' : 'Local Engine'}</span>
          </div>

          {activeView === 'predict' && (
            <button
              onClick={() => setHudVisible(!hudVisible)}
              title={hudVisible ? 'Hide overlay cards to view full map' : 'Show overlay cards'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F4EFE6] hover:bg-[#EAE3D6] dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 border border-[#E7E1D6]/70 dark:border-transparent transition"
            >
              {hudVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{hudVisible ? 'Hide Cards' : 'Show Cards'}</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE3D6] dark:bg-slate-800 text-stone-700 dark:text-slate-300 dark:hover:bg-slate-700 border border-[#E7E1D6]/70 dark:border-transparent transition"
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
        />
      )}

      {/* FLOATING MODAL OVERLAY FOR "YOUR CITY CSV" VIEW */}
      {activeView === 'upload' && (
        <div className="fixed inset-0 z-30 bg-stone-900/40 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 pt-20 pb-16 pointer-events-auto">
          <div className="w-full max-w-5xl max-h-full overflow-y-auto rounded-3xl bg-[#FFFDF9]/98 dark:bg-slate-900/95 backdrop-blur-xl border border-[#E7E1D6] dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setActiveView('predict')}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE3D6] dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-[#E7E1D6] dark:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <UploadCityView disease={activeDisease} />
          </div>
        </div>
      )}

      {/* FLOATING MODAL OVERLAY FOR "METHOD & DATA" VIEW */}
      {activeView === 'method' && (
        <div className="fixed inset-0 z-30 bg-stone-900/40 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 pt-20 pb-16 pointer-events-auto">
          <div className="w-full max-w-5xl max-h-full overflow-y-auto rounded-3xl bg-[#FFFDF9]/98 dark:bg-slate-900/95 backdrop-blur-xl border border-[#E7E1D6] dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setActiveView('predict')}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE3D6] dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-[#E7E1D6] dark:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <MethodView />
          </div>
        </div>
      )}
    </div>
  );
};
