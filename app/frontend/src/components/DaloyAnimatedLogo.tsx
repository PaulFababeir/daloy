import React from 'react';

interface DaloyAnimatedLogoProps {
  className?: string;
  size?: number | string;
  animated?: boolean;
  /** When true, plays the crisp entrance reveal choreography on the SVG elements */
  entrance?: boolean;
}

export const DaloyAnimatedLogo: React.FC<DaloyAnimatedLogoProps> = ({
  className = '',
  size = '100%',
  animated = true,
  entrance = false
}) => {
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const tealGradId = `c2WaveTeal_${id}`;
  const roseGradId = `c2WaveRose_${id}`;
  const revealLeftId = `revealLeft_${id}`;
  const revealRightId = `revealRight_${id}`;

  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
      style={
        animated
          ? {
              filter:
                'drop-shadow(0 8px 24px rgba(13, 148, 136, 0.25)) drop-shadow(0 4px 16px rgba(225, 29, 72, 0.2))'
            }
          : undefined
      }
    >
      <defs>
        {/* Exact Concept 02 Gradients from DALOY Identity Explorer */}
        <linearGradient id={tealGradId} x1="0%" y1="50%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>

        <linearGradient id={roseGradId} x1="0%" y1="80%" x2="100%" y2="10%">
          <stop offset="0%" stopColor="#9F1239" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>

        {/* Smooth left-to-right clip reveal for entrance mode */}
        {entrance && (
          <>
            <clipPath id={revealLeftId}>
              <rect x="0" y="0" width="1024" height="1024">
                <animate
                  attributeName="width"
                  values="0;1024"
                  dur="0.85s"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.22 1 0.36 1"
                  fill="freeze"
                />
              </rect>
            </clipPath>
            <clipPath id={revealRightId}>
              <rect x="0" y="0" width="1024" height="1024">
                <animate
                  attributeName="width"
                  values="0;1024"
                  begin="0.14s"
                  dur="0.9s"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.22 1 0.36 1"
                  fill="freeze"
                />
              </rect>
            </clipPath>
          </>
        )}
      </defs>

      {/* Background Subtle Radar Ring */}
      <circle
        cx="512"
        cy="512"
        r="340"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeDasharray="16 24"
        opacity="0.25"
        style={{ transformOrigin: '512px 512px' }}
      >
        {entrance && (
          <animate
            attributeName="opacity"
            values="0;0.25"
            dur="0.7s"
            fill="freeze"
          />
        )}
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 512 512"
            to="360 512 512"
            dur="64s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Primary Teal Hydrological Wave (Filled Sculpted Ribbon) */}
      <g clipPath={entrance ? `url(#${revealLeftId})` : undefined}>
        <path
          d="M 110 620 C 260 620, 330 250, 500 250 C 650 250, 710 540, 914 440 C 740 640, 620 410, 490 410 C 360 410, 290 730, 110 620 Z"
          fill={`url(#${tealGradId})`}
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-7; 0,0"
              dur="4.6s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Intersecting Crimson Outbreak Surge Wave (Phase-shifted for Lag Effect) */}
      <g clipPath={entrance ? `url(#${revealRightId})` : undefined}>
        <path
          d="M 130 710 C 340 740, 440 340, 610 310 C 750 285, 810 490, 920 350 C 830 590, 720 450, 600 465 C 450 485, 350 820, 130 710 Z"
          fill={`url(#${roseGradId})`}
          opacity="0.92"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,7; 0,0"
              dur="5.2s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Forecast Horizon Spark Nodes (14d and 28d lag peaks) */}
      {/* 14d Lepto Peak Node */}
      <circle cx="500" cy="210" r="26" fill="#2DD4BF">
        {entrance && (
          <animate
            attributeName="r"
            values="0;30;26"
            begin="0.55s"
            dur="0.45s"
            keyTimes="0;0.7;1"
            fill="freeze"
          />
        )}
        {animated && (
          <animate
            attributeName="r"
            values="25;28;25"
            begin={entrance ? '1.0s' : '0s'}
            dur="3.2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* 28d Dengue Peak Outer Node */}
      <circle cx="620" cy="265" r="32" fill="#FB7185">
        {entrance && (
          <animate
            attributeName="r"
            values="0;36;32"
            begin="0.68s"
            dur="0.45s"
            keyTimes="0;0.7;1"
            fill="freeze"
          />
        )}
        {animated && (
          <animate
            attributeName="r"
            values="31;34;31"
            begin={entrance ? '1.15s' : '0s'}
            dur="3.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* 28d Dengue Peak Inner Core */}
      <circle cx="620" cy="265" r="14" fill="#FFFFFF">
        {entrance && (
          <animate
            attributeName="r"
            values="0;16;14"
            begin="0.76s"
            dur="0.4s"
            keyTimes="0;0.7;1"
            fill="freeze"
          />
        )}
      </circle>
    </svg>
  );
};
