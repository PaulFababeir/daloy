import React from 'react';

interface FlowingBackgroundStripsProps {
  theme?: 'light' | 'dark';
}

/**
 * DALOY Zero-Lag Atmospheric Homepage Background
 * Uses pure hardware-composited radial gradients and lightweight vector paths
 * (zero CSS blur() filters, zero mask-image repaints, zero continuous SMIL ticks)
 * for locked 60/120 FPS scrolling.
 */
export const FlowingBackgroundStrips: React.FC<FlowingBackgroundStripsProps> = React.memo(({
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
        backgroundImage: isDark
          ? 'radial-gradient(circle at 15% 18%, rgba(13, 148, 136, 0.14) 0%, transparent 38%), radial-gradient(circle at 85% 28%, rgba(225, 29, 72, 0.11) 0%, transparent 38%), radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.08) 0%, transparent 45%)'
          : 'radial-gradient(circle at 15% 18%, rgba(13, 148, 136, 0.09) 0%, transparent 38%), radial-gradient(circle at 85% 28%, rgba(225, 29, 72, 0.07) 0%, transparent 38%), radial-gradient(circle at 50% 85%, rgba(2, 132, 199, 0.06) 0%, transparent 45%)'
      }}
    >
      {/* 1. LIGHTWEIGHT DOT MATRIX (No mask-image repaint overhead) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(148, 163, 184, 0.11) 1px, transparent 1px)'
            : 'radial-gradient(rgba(120, 113, 108, 0.14) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* 2. STATIC VECTOR HYDRO-CONTOUR & STREAM LAYER */}
      <svg
        viewBox="0 0 1600 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="daloyBgTealStream" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="30%" stopColor="#0D9488" stopOpacity={isDark ? '0.36' : '0.26'} />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity={isDark ? '0.42' : '0.30'} />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="daloyBgRoseStream" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0" />
            <stop offset="30%" stopColor="#E11D48" stopOpacity={isDark ? '0.34' : '0.24'} />
            <stop offset="70%" stopColor="#FB7185" stopOpacity={isDark ? '0.32' : '0.22'} />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle Topographic Radar Basin Rings */}
        <g opacity={isDark ? '0.16' : '0.14'}>
          <ellipse
            cx="800"
            cy="300"
            rx="340"
            ry="185"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
          <ellipse
            cx="800"
            cy="300"
            rx="540"
            ry="295"
            stroke="#0D9488"
            strokeWidth="1"
            strokeDasharray="12 16"
          />
        </g>

        {/* Pasig-Marikina Hydrological Current Stream (Tidal Teal #0D9488) */}
        <path
          d="M -100 420 C 260 290, 520 530, 840 360 C 1140 200, 1360 440, 1700 310"
          stroke="url(#daloyBgTealStream)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Biological Outbreak Surge Wave (Crimson Rose #E11D48) */}
        <path
          d="M -100 280 C 310 460, 590 190, 910 350 C 1210 500, 1410 240, 1700 390"
          stroke="url(#daloyBgRoseStream)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Centroid Nodes */}
        <g opacity={isDark ? '0.65' : '0.5'}>
          <circle cx="520" cy="412" r="4" fill="#2DD4BF" />
          <circle cx="1045" cy="306" r="4" fill="#FB7185" />
        </g>
      </svg>
    </div>
  );
});
