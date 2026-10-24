import React, { useState, useEffect } from 'react';
import { Philippines3DMap } from './components/Philippines3DMap';
import { CaseEstimateView } from './components/CaseEstimateView';
import { UploadCityView } from './components/UploadCityView';
import { MethodView } from './components/MethodView';
import { fetchPrediction, PredictionResult, UploadedCityData } from './services/api';
import { NCRCityPolygon, METRO_MANILA_CITIES, normalizeCityName, getUploadedCityData, getCityAvailableDiseases, makeCityUploadKey } from './components/metroManilaData';
import { ActionLayerFilter } from './components/actionMapData';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DaloyAnimatedLogo } from './components/DaloyAnimatedLogo';
import { DaloyEntranceIntro } from './components/DaloyEntranceIntro';
import {
  Activity,
  UploadCloud,
  FileText,
  Moon,
  Sun,
  Eye,
  EyeOff,
  BarChart3,
  ShieldAlert,
  HelpCircle,
  Compass
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'onboarding' | 'predict' | 'upload' | 'method'>('onboarding');
  const [activeDisease, setActiveDisease] = useState<'dengue' | 'lepto'>('dengue');
  const [month, setMonth] = useState<number>(8);
  const [rainfall, setRainfall] = useState<number>(430);
  const [prevRain, setPrevRain] = useState<number>(400);
  const [nWeeks, setNWeeks] = useState<number>(4);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [inspectedCity, setInspectedCity] = useState<NCRCityPolygon | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [analyticsSection, setAnalyticsSection] = useState<'charts' | 'actions'>('charts');
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [actionLayerFilter, setActionLayerFilter] = useState<ActionLayerFilter>('off');
  const [focusedActionCode, setFocusedActionCode] = useState<string | null>(null);
  const [focusedTargetCoords, setFocusedTargetCoords] = useState<[number, number] | null>(null);
  const [returnView, setReturnView] = useState<'onboarding' | 'predict'>('onboarding');
  const [showEntranceIntro, setShowEntranceIntro] = useState<boolean>(true);
  const [uploadedCities, setUploadedCities] = useState<Record<string, UploadedCityData>>({});

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
      let effectiveCity = inspectedCity;
      if (!effectiveCity) {
        const uploadedMatch = Object.values(uploadedCities).find(c => c.disease === activeDisease);
        if (uploadedMatch) {
          effectiveCity = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(uploadedMatch.cityName)) || null;
        }
      }
      const customCity = effectiveCity
        ? getUploadedCityData(uploadedCities, effectiveCity.name, activeDisease)
        : null;
      fetchPrediction({
        disease: activeDisease,
        month,
        rain: rainfall,
        prev_rain: prevRain,
        n_weeks: nWeeks,
        customCity: customCity || undefined
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
  }, [activeDisease, month, rainfall, prevRain, nWeeks, inspectedCity, uploadedCities]);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 450);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 w-screen h-screen overflow-hidden select-none transition-colors ${
      isDark ? 'bg-[#0B0F17] text-[#F8FAFC]' : 'bg-[#F7F4EE] text-[#1C1917]'
    }`}>
      {/* FULL-SCREEN 3D METRO MANILA MAP (ONLY RENDERED ON 3D MAP VIEW FOR ZERO HOMEPAGE LAG) */}
      {activeView === 'predict' && (
        <div className="absolute inset-0 z-0">
          <Philippines3DMap
            activeDisease={activeDisease}
            onSelectCity={(d, city) => {
              setActiveDisease(d);
              if (city) {
                setInspectedCity(city);
              } else {
                setInspectedCity(prev => {
                  if (prev) {
                    const available = getCityAvailableDiseases(prev.name, prev.focusId, uploadedCities);
                    if (available.includes(d)) {
                      return prev;
                    }
                  }
                  const uploadedMatch = Object.values(uploadedCities).find(c => c.disease === d);
                  if (uploadedMatch) {
                    const found = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(uploadedMatch.cityName));
                    if (found) return found;
                  }
                  return METRO_MANILA_CITIES.find(c => c.focusId === d) || null;
                });
              }
              setActiveView('predict');
              setFocusedActionCode(null);
              setFocusedTargetCoords(null);
            }}
            onInspectCity={city => setInspectedCity(city)}
            inspectedCity={inspectedCity}
            uploadedCities={uploadedCities}
            rainfallIntensity={rainfall}
            predictedCases={predictionResult?.predicted_cases ?? 270}
            theme={theme}
            paused={showAnalyticsModal}
            actionLayerFilter={actionLayerFilter}
            onActionLayerFilterChange={filter => {
              setActionLayerFilter(filter);
              if (filter === 'off') {
                setFocusedActionCode(null);
                setFocusedTargetCoords(null);
              }
            }}
            focusedActionCode={focusedActionCode}
            focusedTargetCoords={focusedTargetCoords}
            onClearFocusedAction={() => {
              setFocusedActionCode(null);
              setFocusedTargetCoords(null);
              setActionLayerFilter('off');
            }}
          />
        </div>
      )}

      {/* TOP FLOATING HUD HEADER OVERLAY (ONLY VISIBLE ON 3D MAP PLATFORM) */}
      {activeView === 'predict' && (
        <header className="fixed top-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Brand & Map Legend Pill */}
        <div
          onClick={() => {
            setActiveView('onboarding');
            setShowAnalyticsModal(false);
          }}
          className={`cursor-pointer group flex items-center gap-3 px-3.5 py-2 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto transition-colors ${
          isDark
            ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
            : 'bg-[#FFFDF9]/95 text-stone-900 border border-[#E7E1D6] shadow-stone-300/40'
        }`}>
          <div className="w-8 h-8 shrink-0">
            <DaloyAnimatedLogo size={32} animated={true} />
          </div>
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

          {/* City & Tactical Action Layer Color Key */}
          {(() => {
            const dengueCities = METRO_MANILA_CITIES.filter(c =>
              getCityAvailableDiseases(c.name, c.focusId, uploadedCities).includes('dengue')
            );
            const leptoCities = METRO_MANILA_CITIES.filter(c =>
              getCityAvailableDiseases(c.name, c.focusId, uploadedCities).includes('lepto')
            );
            const dengueTotal = dengueCities.length;
            const leptoTotal = leptoCities.length;

            return (
              <div className={`hidden 2xl:flex items-center gap-3 pl-3 ml-1 border-l text-[10px] font-semibold ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-[#E7E1D6] text-stone-600'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDisease('dengue');
                    setInspectedCity(prev => {
                      if (prev) {
                        const available = getCityAvailableDiseases(prev.name, prev.focusId, uploadedCities);
                        if (available.includes('dengue')) {
                          return prev;
                        }
                      }
                      const uploadedMatch = Object.values(uploadedCities).find(c => c.disease === 'dengue');
                      if (uploadedMatch) {
                        const found = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(uploadedMatch.cityName));
                        if (found) return found;
                      }
                      return METRO_MANILA_CITIES.find(c => c.focusId === 'dengue') || null;
                    });
                  }}
                  title="Switch to Dengue mode"
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition ${
                    activeDisease === 'dengue'
                      ? 'text-rose-400 font-bold bg-rose-500/15'
                      : 'hover:text-rose-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E11D48] shrink-0" />
                  <span>Dengue</span>
                  {dengueTotal > 1 && (
                    <span className="text-[9px] px-1 rounded-full bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30">
                      {dengueTotal}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDisease('lepto');
                    setInspectedCity(prev => {
                      if (prev) {
                        const available = getCityAvailableDiseases(prev.name, prev.focusId, uploadedCities);
                        if (available.includes('lepto')) {
                          return prev;
                        }
                      }
                      const uploadedMatch = Object.values(uploadedCities).find(c => c.disease === 'lepto');
                      if (uploadedMatch) {
                        const found = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(uploadedMatch.cityName));
                        if (found) return found;
                      }
                      return METRO_MANILA_CITIES.find(c => c.focusId === 'lepto') || null;
                    });
                  }}
                  title="Switch to Leptospirosis mode"
                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition ${
                    activeDisease === 'lepto'
                      ? 'text-teal-400 font-bold bg-teal-500/15'
                      : 'hover:text-teal-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0D9488] shrink-0" />
                  <span>Leptospirosis</span>
                  {leptoTotal > 1 && (
                    <span className="text-[9px] px-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold border border-teal-500/30">
                      {leptoTotal}
                    </span>
                  )}
                </button>

                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" /> Vulnerable Grids (5)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Hospitals
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Health Ctrs
                </span>
              </div>
            );
          })()}
        </div>

        {/* Center Navigation Tabs Pill — Separate Screens for Model Graph vs. Action Plan */}
        <nav className={`flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto transition-colors ${
          isDark
            ? 'bg-slate-900/90 text-white border border-slate-700/80 shadow-black/40'
            : 'bg-[#FFFDF9]/95 text-stone-900 border border-[#E7E1D6] shadow-stone-300/40'
        }`}>
          <button
            onClick={() => {
              setActiveView('onboarding');
              setShowAnalyticsModal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => {
              setShowAnalyticsModal(false);
              setHudVisible(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              !showAnalyticsModal
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3D Map</span>
          </button>

          <button
            onClick={() => {
              setHudVisible(true);
              setAnalyticsSection('charts');
              setShowAnalyticsModal(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              showAnalyticsModal && analyticsSection === 'charts'
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Model Graph</span>
          </button>

          <button
            onClick={() => {
              setHudVisible(true);
              setAnalyticsSection('actions');
              setShowAnalyticsModal(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              showAnalyticsModal && analyticsSection === 'actions'
                ? isDark ? 'bg-white text-slate-900 shadow-sm' : 'bg-stone-900 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Action Plan</span>
          </button>

          <button
            onClick={() => {
              setReturnView('predict');
              setActiveView('upload');
              setShowAnalyticsModal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Your City CSV</span>
          </button>

          <button
            onClick={() => {
              setReturnView('predict');
              setActiveView('method');
              setShowAnalyticsModal(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Method &amp; Data</span>
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
              <span className="hidden sm:inline">{hudVisible ? 'Hide HUDs' : 'Show HUDs'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('onboarding')}
            aria-label="Platform guide"
            title="Open platform overview and onboarding"
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                : 'bg-[#F4EFE6] hover:bg-[#EAE3D6] text-stone-700 border-[#E7E1D6]/70'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

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
      )}

      {/* FLOATING HUD SIDE CARDS FOR CASE ESTIMATE VIEW */}
      {activeView === 'predict' && hudVisible && (
        <CaseEstimateView
          uploadedCities={uploadedCities}
          activeDisease={activeDisease}
          onDiseaseChange={d => {
            setActiveDisease(d);
            setInspectedCity(prev => {
              if (prev) {
                const available = getCityAvailableDiseases(prev.name, prev.focusId, uploadedCities);
                if (available.includes(d)) {
                  return prev;
                }
              }
              const uploadedMatch = Object.values(uploadedCities).find(c => c.disease === d);
              if (uploadedMatch) {
                const found = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(uploadedMatch.cityName));
                if (found) return found;
              }
              return METRO_MANILA_CITIES.find(c => c.focusId === d) || null;
            });
            setFocusedActionCode(null);
            setFocusedTargetCoords(null);
          }}
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
          onInspectCity={city => setInspectedCity(city)}
          onClearCity={() => {
            setInspectedCity(null);
            setFocusedTargetCoords(null);
          }}
          onOpenUploadForCity={() => setActiveView('upload')}
          showAnalyticsModal={showAnalyticsModal}
          onToggleAnalyticsModal={setShowAnalyticsModal}
          analyticsSection={analyticsSection}
          onAnalyticsSectionChange={setAnalyticsSection}
          theme={theme}
          onFocusMapTarget={({ layer, code, coords }) => {
            setShowAnalyticsModal(false);
            setActiveView('predict');
            setActionLayerFilter(layer);
            setFocusedActionCode(code);
            setFocusedTargetCoords(coords || null);
          }}
        />
      )}

      {/* DEDICATED FULL VIEW FOR "YOUR CITY CSV" */}
      {activeView === 'upload' && (
        <div className={`fixed inset-0 z-40 flex flex-col p-4 sm:p-8 overflow-y-auto pointer-events-auto transition-colors ${
          isDark ? 'bg-[#0B0F17] text-white' : 'bg-[#F7F4EE] text-[#1C1917]'
        }`}>
          <div className="max-w-5xl w-full mx-auto my-auto py-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveView(returnView)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                    : 'bg-[#FFFDF9] text-stone-700 hover:bg-[#F4EFE6] border-[#E7E1D6] shadow-sm'
                }`}
              >
                <span>← Back to {returnView === 'onboarding' ? 'Overview' : '3D Map'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('predict');
                  setShowAnalyticsModal(false);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  isDark
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <span>Explore in 3D Map →</span>
              </button>
            </div>

            <div className={`rounded-3xl border shadow-2xl p-6 sm:p-8 relative transition-colors ${
              isDark
                ? 'bg-slate-900/95 border-slate-800 shadow-black/60'
                : 'bg-[#FFFDF9] border-[#E7E1D6] shadow-stone-300/40'
            }`}>
              <UploadCityView
                disease={activeDisease}
                theme={theme}
                initialCity={inspectedCity?.name}
                uploadedCities={uploadedCities}
                onCityUploadSuccess={data => {
                  const key = makeCityUploadKey(data.cityName, data.disease);
                  setUploadedCities(prev => ({ ...prev, [key]: data }));
                  setActiveDisease(data.disease);
                  const targetCity = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(data.cityName)) || null;
                  if (targetCity) {
                    setInspectedCity(targetCity);
                  }
                }}
                onRemoveUploadedCity={key => {
                  setUploadedCities(prev => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                  });
                }}
                onViewOnMap={(cityName, disease) => {
                  setActiveDisease(disease);
                  const targetCity = METRO_MANILA_CITIES.find(c => normalizeCityName(c.name) === normalizeCityName(cityName)) || null;
                  setInspectedCity(targetCity);
                  setActiveView('predict');
                  setShowAnalyticsModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED FULL VIEW FOR "METHOD & DATA" */}
      {activeView === 'method' && (
        <div className={`fixed inset-0 z-40 flex flex-col p-4 sm:p-8 overflow-y-auto pointer-events-auto transition-colors ${
          isDark ? 'bg-[#0B0F17] text-white' : 'bg-[#F7F4EE] text-[#1C1917]'
        }`}>
          <div className="max-w-5xl w-full mx-auto my-auto py-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveView(returnView)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                    : 'bg-[#FFFDF9] text-stone-700 hover:bg-[#F4EFE6] border-[#E7E1D6] shadow-sm'
                }`}
              >
                <span>← Back to {returnView === 'onboarding' ? 'Overview' : '3D Map'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('predict');
                  setShowAnalyticsModal(false);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  isDark
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <span>Explore in 3D Map →</span>
              </button>
            </div>

            <div className={`rounded-3xl border shadow-2xl p-6 sm:p-8 relative transition-colors ${
              isDark
                ? 'bg-slate-900/95 border-slate-800 shadow-black/60'
                : 'bg-[#FFFDF9] border-[#E7E1D6] shadow-stone-300/40'
            }`}>
              <MethodView theme={theme} />
            </div>
          </div>
        </div>
      )}

      {/* INITIAL ENTRANCE INTRO ANIMATION */}
      {showEntranceIntro && (
        <DaloyEntranceIntro
          onComplete={() => {
            setShowEntranceIntro(false);
          }}
          theme={theme}
        />
      )}

      {/* FULL-PAGE ONBOARDING SCREEN (NOTEBOOKLM INSPIRED) */}
      {activeView === 'onboarding' && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <OnboardingScreen
            theme={theme}
            onToggleTheme={toggleTheme}
            onReplayIntro={() => setShowEntranceIntro(true)}
            onLaunchPlatform={focusDisease => {
              if (focusDisease) {
                setActiveDisease(focusDisease);
                const targetCity = METRO_MANILA_CITIES.find(c => c.focusId === focusDisease) || null;
                setInspectedCity(targetCity);
              }
              setActiveView('predict');
              setShowAnalyticsModal(false);
              setFocusedActionCode(null);
              setFocusedTargetCoords(null);
            }}
            onOpenMethod={() => {
              setReturnView('onboarding');
              setActiveView('method');
            }}
            onOpenUpload={() => {
              setReturnView('onboarding');
              setActiveView('upload');
            }}
          />
        </div>
      )}
    </div>
  );
};
