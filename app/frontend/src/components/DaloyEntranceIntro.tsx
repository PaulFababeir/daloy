import React, { useEffect, useState } from 'react';
import { DaloyAnimatedLogo } from './DaloyAnimatedLogo';

interface DaloyEntranceIntroProps {
  onComplete: () => void;
  theme?: 'light' | 'dark';
}

export const DaloyEntranceIntro: React.FC<DaloyEntranceIntroProps> = ({
  onComplete,
  theme = 'dark'
}) => {
  const [stage, setStage] = useState<'draw' | 'wordmark' | 'exit'>('draw');
  const isDark = theme === 'dark';

  useEffect(() => {
    // Let the SVG logo waves and spark nodes draw in cleanly first
    const t1 = setTimeout(() => {
      setStage('wordmark');
    }, 650);

    // Smooth fade out into the main experience
    const t2 = setTimeout(() => {
      setStage('exit');
    }, 2400);

    const t3 = setTimeout(() => {
      onComplete();
    }, 2900);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', onKey);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-opacity duration-500 ${
        stage === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${isDark ? 'bg-[#0B0F17] text-[#F8FAFC]' : 'bg-[#F7F4EE] text-[#1C1917]'}`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(13, 148, 136, 0.08), transparent 35%), radial-gradient(circle at 75% 75%, rgba(225, 29, 72, 0.08), transparent 35%)'
      }}
    >
      <div className="relative flex flex-col items-center text-center">
        {/* Large Master Squircle Container (288x288 Studio Scale) */}
        <div
          className={`w-60 h-60 sm:w-72 sm:h-72 p-7 flex items-center justify-center transition-all duration-700 ease-out ${
            stage === 'draw' ? 'scale-95 opacity-95' : 'scale-100 opacity-100'
          }`}
          style={{
            borderRadius: '22.4%',
            background: isDark
              ? 'linear-gradient(145deg, #0F172A 0%, #020617 100%)'
              : 'linear-gradient(145deg, #FFFFFF 0%, #F4EFE6 100%)',
            border: isDark
              ? '1px solid rgba(148, 163, 184, 0.16)'
              : '1px solid #E7E1D6',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
              : '0 20px 40px -15px rgba(28, 25, 23, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
          }}
        >
          <DaloyAnimatedLogo size="100%" animated={true} entrance={true} />
        </div>

        {/* Clean Wordmark Lockup from Brand Studio */}
        <div
          className={`mt-7 transition-all duration-500 ease-out ${
            stage === 'wordmark' || stage === 'exit'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }`}
        >
          <div className="flex items-baseline justify-center gap-3">
            <h1
              className="text-5xl sm:text-6xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.04em' }}
            >
              DALOY
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded font-bold bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
              NCR.26
            </span>
          </div>

          <p
            className={`text-base sm:text-lg font-medium mt-1.5 ${
              isDark ? 'text-[#94A3B8]' : 'text-[#57534E]'
            }`}
          >
            Trace the rain, target the outbreak.
          </p>
        </div>
      </div>
    </div>
  );
};
