import React from 'react';
import { DaloyAnimatedLogo } from './DaloyAnimatedLogo';
import { FlowingBackgroundStrips } from './FlowingBackgroundStrips';
import {
  Compass,
  ArrowRight,
  ShieldAlert,
  Building2,
  Cpu,
  History,
  UploadCloud,
  FileText,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';

interface OnboardingScreenProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLaunchPlatform: (focusDisease?: 'dengue' | 'lepto') => void;
  onOpenMethod: () => void;
  onOpenUpload: () => void;
  onReplayIntro?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = React.memo(({
  theme,
  onToggleTheme,
  onLaunchPlatform,
  onOpenMethod,
  onOpenUpload,
  onReplayIntro
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full selection:bg-teal-500/30 transition-colors duration-200 ${
        isDark ? 'bg-[#0B0F17] text-[#F8FAFC]' : 'bg-[#F7F4EE] text-[#1C1917]'
      }`}
    >
      {/* ZERO-LAG HARDWARE-COMPOSITED BACKGROUND */}
      <FlowingBackgroundStrips theme={theme} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP NAVIGATION BAR (High-opacity solid surface for zero scroll backdrop-filter lag) */}
        <header
          className={`sticky top-0 z-40 border-b transition-colors px-4 sm:px-8 py-3.5 ${
            isDark
              ? 'bg-[#0B0F17]/95 border-slate-800/80'
              : 'bg-[#F7F4EE]/95 border-[#E7E1D6]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Brand Logo & Wordmark */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <DaloyAnimatedLogo size={36} animated={false} />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black tracking-tight font-heading">
                  DALOY
                </span>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    isDark
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/35'
                      : 'bg-teal-100 text-teal-900 border-teal-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  PJDSC 2026
                </span>
              </div>
            </div>

            {/* Nav Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={onOpenMethod}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Methodology</span>
              </button>

              <button
                type="button"
                onClick={onOpenUpload}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#F4EFE6]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload CSV</span>
              </button>

              {onReplayIntro && (
                <button
                  type="button"
                  onClick={onReplayIntro}
                  title="Watch Logo Intro Animation"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-teal-300 border-teal-500/30'
                      : 'bg-[#FFFDF9] hover:bg-[#F4EFE6] text-teal-900 border-[#E7E1D6] shadow-sm'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden md:inline">Watch Intro</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Toggle dark mode"
                className={`p-2 rounded-xl border transition ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    : 'bg-[#FFFDF9] hover:bg-[#F4EFE6] text-stone-700 border-[#E7E1D6] shadow-sm'
                }`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onLaunchPlatform()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-lg ${
                  isDark
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/20'
                }`}
              >
                <span>Launch Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col items-center text-center">
          {/* App Squircle Hero Emblem from DALOY Identity Studio */}
          <div
            onClick={() => onLaunchPlatform()}
            title="Launch 3D Surveillance Platform"
            className="relative mb-6 cursor-pointer group"
          >
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 p-4 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105"
              style={{
                borderRadius: '22.4%',
                background: isDark
                  ? 'linear-gradient(145deg, #0F172A 0%, #020617 100%)'
                  : 'linear-gradient(145deg, #FFFFFF 0%, #F4EFE6 100%)',
                border: isDark
                  ? '1px solid rgba(148, 163, 184, 0.16)'
                  : '1px solid #E7E1D6',
                boxShadow: isDark
                  ? '0 20px 40px -12px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
                  : '0 18px 35px -12px rgba(28, 25, 23, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              }}
            >
              <DaloyAnimatedLogo size="100%" animated={false} />
            </div>
          </div>

          {/* Category Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border shadow-sm ${
              isDark
                ? 'bg-slate-900 text-teal-300 border-teal-500/30'
                : 'bg-[#FFFDF9] text-teal-900 border-[#E7E1D6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>AI-Driven Hydro-Meteorological Outbreak Intelligence</span>
          </div>

          {/* Giant Hero Title */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none mb-6 font-heading select-none">
            <span className="bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              DALOY
            </span>
          </h1>

          {/* Subtitle & Mission Statement */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight max-w-3xl mb-4 text-stone-900 dark:text-white leading-snug">
            Trace the rain. Target the outbreak.
          </p>

          <p
            className={`text-base sm:text-lg max-w-2xl leading-relaxed mb-10 ${
              isDark ? 'text-slate-400' : 'text-stone-600'
            }`}
          >
            A high-resolution 3D geospatial digital twin predicting climate-sensitive
            <strong> Dengue Fever</strong> and <strong>Leptospirosis</strong> surges across Metro Manila
            from satellite precipitation observations.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
            <button
              type="button"
              onClick={() => onLaunchPlatform()}
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-black transition transform hover:-translate-y-0.5 active:translate-y-0 shadow-xl ${
                isDark
                  ? 'bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 shadow-teal-500/25'
                  : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/25'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Launch 3D Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenMethod}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 shadow-md'
                  : 'bg-[#FFFDF9] hover:bg-[#F4EFE6] text-stone-800 border-[#E7E1D6] shadow-sm'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Methodology &amp; Models</span>
            </button>

            <button
              type="button"
              onClick={onOpenUpload}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border transition ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 shadow-md'
                  : 'bg-[#FFFDF9] hover:bg-[#F4EFE6] text-stone-800 border-[#E7E1D6] shadow-sm'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Upload Your City CSV</span>
            </button>
          </div>

          {/* STAT RIBBON STRIP */}
          <div
            className={`w-full max-w-5xl rounded-3xl border p-6 mb-16 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-left transition-colors ${
              isDark
                ? 'bg-slate-900/95 border-slate-800 shadow-black/40'
                : 'bg-[#FFFDF9] border-[#E7E1D6] shadow-stone-200/50'
            }`}
          >
            <div className="border-l-2 border-teal-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight block text-teal-700 dark:text-teal-400">
                17
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider block mt-1">
                NCR Cities &amp; Mun.
              </span>
              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                100% official PSA 2023 GIS boundaries
              </span>
            </div>

            <div className="border-l-2 border-rose-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight block text-rose-700 dark:text-rose-400">
                827
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider block mt-1">
                Official Barangays
              </span>
              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Interactive 3D sub-municipal terrain
              </span>
            </div>

            <div className="border-l-2 border-sky-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight block text-sky-600 dark:text-sky-400">
                36
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider block mt-1">
                Verified Health Nodes
              </span>
              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                18 tertiary hospitals + 18 staging hubs
              </span>
            </div>

            <div className="border-l-2 border-amber-500 pl-4">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight block text-amber-600 dark:text-amber-400">
                34.8%–39.5%
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider block mt-1">
                Error Reduction
              </span>
              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Leave-One-Year-Out cross-validated
              </span>
            </div>
          </div>

          {/* TWO PRIMARY DISEASE FOCUS CARDS */}
          <div className="w-full max-w-5xl mb-16 text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-center font-heading">
              Dual Climate-Sensitive Outbreak Engines
            </h2>
            <p className={`text-xs sm:text-sm text-center mb-8 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              Select a disease model to launch directly into localized surveillance, flood risk corridors, and clinical response protocols.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quezon City Dengue Card */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border transition-colors duration-200 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-800 hover:border-rose-500/40 shadow-lg'
                    : 'bg-[#FFFDF9] border-[#E7E1D6] hover:border-rose-400 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                      Vector-Borne Outbreak
                    </span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      2010–2025 UPRI-NOAH
                    </span>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight mb-2 text-stone-900 dark:text-white">
                    Quezon City · Dengue Fever
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                    Driven by container stagnation and post-rain breeding pools. Regularized Poisson regression
                    with standardized satellite rainfall nowcasts monthly caseloads with <strong>Spearman ρ = 0.528 (p &lt; 0.001)</strong>.
                  </p>

                  <div className={`p-4 rounded-2xl mb-6 border text-xs space-y-2 ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-[#F4EFE6] border-[#E7E1D6]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Target Hotspots:</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100">Tatalon, Bagong Silangan, Roxas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Primary Protocol:</span>
                      <span className="font-bold text-rose-800 dark:text-rose-400">4S Sweeps within 48h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Care Hubs:</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100">East Avenue, QCGH, PCMC, QMMC</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchPlatform('dengue')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold text-white bg-[#E11D48] hover:bg-rose-500 transition shadow-lg shadow-rose-600/20"
                >
                  <span>Explore Quezon City (Dengue)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* City of Manila Leptospirosis Card */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border transition-colors duration-200 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-800 hover:border-teal-500/40 shadow-lg'
                    : 'bg-[#FFFDF9] border-[#E7E1D6] hover:border-teal-400 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                      Waterborne Inundation
                    </span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                      2001–2012 De Stercke
                    </span>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight mb-2 text-stone-900 dark:text-white">
                    City of Manila · Leptospirosis
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                    Driven by floodwater wading and estero overflow. Histogram Gradient Boosting with
                    multi-lag antecedent rainfall and seasonal harmonics achieves <strong>Spearman ρ = 0.612 (p &lt; 0.001)</strong>.
                  </p>

                  <div className={`p-4 rounded-2xl mb-6 border text-xs space-y-2 ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-[#F4EFE6] border-[#E7E1D6]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Target Hotspots:</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100">Sampaloc, Tondo, Ermita-Taft</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Primary Protocol:</span>
                      <span className="font-bold text-teal-800 dark:text-teal-400">Doxycycline PEP within 24–72h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500 dark:text-slate-400">Care Hubs:</span>
                      <span className="font-bold text-stone-900 dark:text-slate-100">PGH, San Lazaro, Ospital ng Maynila</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchPlatform('lepto')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold text-white bg-[#0D9488] hover:bg-teal-500 transition shadow-lg shadow-teal-600/20"
                >
                  <span>Explore City of Manila (Lepto)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* BENTO GRID FEATURE SHOWCASE */}
          <div className="w-full max-w-5xl mb-20 text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-center font-heading">
              Platform Architecture &amp; Capabilities
            </h2>
            <p className={`text-xs sm:text-sm text-center mb-10 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
              End-to-end intelligence connecting satellite earth observations, machine learning models, and local public health action.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-100 text-teal-800'
                }`}>
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">3D Geospatial Digital Twin</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  GPU-accelerated WebGL Three.js canvas rendering all 17 NCR municipalities and 827 official PSA barangays with real-time rain particle dynamics.
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-800'
                }`}>
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">Multi-Lag Satellite ML</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Direct integration with NASA GPM IMERG precipitation data, capturing antecedent ground saturation and circular Fourier seasonal harmonics.
                </p>
              </div>

              {/* Feature 3 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">10 Verified Flood Corridors</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Calibrated against UP NOAH and MGB flood hazard maps across the San Juan River, Marikina floodplain, España, and Tondo basins.
                </p>
              </div>

              {/* Feature 4 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-sky-500/15 text-sky-400' : 'bg-sky-100 text-sky-800'
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">36 Health Facility Nodes</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  100% geographically verified point-in-polygon coordinates for tertiary hospitals (PGH, San Lazaro, NKTI) and local super health centers.
                </p>
              </div>

              {/* Feature 5 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">Historical Analogue Engine</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  Normalized Euclidean distance search retrieves the most hydro-meteorologically similar historical monsoon months (e.g. Ondoy, Habagat 2012).
                </p>
              </div>

              {/* Feature 6 */}
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-[#FFFDF9] border-[#E7E1D6]'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit mb-4 ${
                  isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-800'
                }`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold mb-2">Multi-City CSV Portability</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                  In-browser model fitting allows municipal health offices outside Metro Manila to upload custom surveillance CSVs and evaluate LOYOCV metrics.
                </p>
              </div>
            </div>
          </div>

          {/* FINAL BOTTOM CALL-TO-ACTION */}
          <div
            className={`w-full max-w-5xl rounded-3xl p-8 sm:p-12 text-center border relative overflow-hidden transition-colors ${
              isDark
                ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
                : 'bg-gradient-to-b from-[#F4EFE6] to-[#FFFDF9] border-[#E7E1D6]'
            }`}
          >
            <div className="max-w-2xl mx-auto relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 font-heading">
                Ready to explore the 3D surveillance platform?
              </h3>
              <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                Simulate rainfall scenarios from 0 to 1,200 mm, inspect official barangay flood risks, and review tactical clinical action plans.
              </p>
              <button
                type="button"
                onClick={() => onLaunchPlatform()}
                className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm sm:text-base font-black transition shadow-xl ${
                  isDark
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/25'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/20'
                }`}
              >
                <span>Enter 3D Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer
          className={`border-t py-6 px-4 sm:px-8 text-center text-xs transition-colors ${
            isDark ? 'border-slate-800/80 text-slate-500' : 'border-[#E7E1D6] text-stone-500'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="DALOY" className="w-4 h-4 rounded-full opacity-70" />
              <span className="font-semibold">DALOY</span>
              <span>· Philippine Junior Data Science Challenge 2026</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>DOH PIDSR &amp; UPRI-NOAH</span>
              <span>·</span>
              <span>NASA GPM IMERG</span>
              <span>·</span>
              <span>PSA 2023 GeoJSON</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});
