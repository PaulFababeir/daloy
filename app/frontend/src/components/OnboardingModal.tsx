import React, { useState } from 'react';
import { CloudRain, Compass, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark'
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('daloy_onboarding_dismissed', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all duration-200 ${
          isDark
            ? 'bg-slate-900/95 text-white border-slate-700/80 shadow-black/60'
            : 'bg-[#FFFDF9]/95 text-stone-900 border-[#E7E1D6] shadow-stone-400/40'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-4 right-4 p-2 rounded-xl transition ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-stone-500 hover:text-stone-900 hover:bg-[#F3EFE6]'
          }`}
          title="Close introduction"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-teal-500 to-rose-500 opacity-40 blur-md animate-pulse" />
            <img
              src="/logo.png"
              alt="DALOY Emblem"
              className="relative w-16 h-16 rounded-full object-contain p-1 bg-white/10 dark:bg-slate-800/80 ring-1 ring-teal-500/30 shadow-lg"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/20">
            <Sparkles className="w-3 h-3" />
            <span>PJDSC 2026 Climate-Health Platform</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            DALOY
          </h2>
          <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            Direct Action for Leptospirosis &amp; Outbreak Yields
          </p>
          <p className={`text-xs leading-relaxed mt-2.5 max-w-md ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>
            Estimating monthly dengue (Quezon City) and leptospirosis (Manila) cases from NASA precipitation observations — providing 2–3 weeks lead time before hospital surveillance bulletins arrive.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 gap-2.5 my-6 text-left">
          <div
            className={`flex items-start gap-3 p-3 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-[#F4EFE6] border-[#E7E1D6]'
            }`}
          >
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Rainfall-Driven ML Nowcasts</h4>
              <p className={`text-[11px] leading-snug mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                Poisson regression and gradient boosting models trained on 15+ years of meteorological and DOH surveillance data.
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-[#F4EFE6] border-[#E7E1D6]'
            }`}
          >
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-500 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Interactive 3D Metro Manila Map</h4>
              <p className={`text-[11px] leading-snug mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                All 827 official PSA barangays and 17 cities in 3D. Hover any barangay for real-time risk tiers and surveillance status.
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-[#F4EFE6] border-[#E7E1D6]'
            }`}
          >
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Tactical Action Directives</h4>
              <p className={`text-[11px] leading-snug mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                36 verified referral hospitals and Super Health Centers with 1-click zoom, Doxycycline PEP buffers, and 4S vector sweeps.
              </p>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/30 dark:border-slate-800">
          <label className={`flex items-center gap-2 text-[11px] cursor-pointer select-none ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 text-teal-600 focus:ring-teal-500"
            />
            <span>Don't show this intro automatically</span>
          </label>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-rose-600 hover:from-teal-500 hover:to-rose-500 shadow-lg shadow-teal-900/30 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Surveillance Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
