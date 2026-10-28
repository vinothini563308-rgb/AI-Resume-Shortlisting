import React, { useEffect, useState } from 'react';

export interface AnimatedMatchMeterProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  theme?: 'light' | 'dark';
}

export const AnimatedMatchMeter: React.FC<AnimatedMatchMeterProps> = ({
  score,
  size = 'md',
  showLabel = true,
  animate = true,
  theme = 'light',
}) => {
  const [displayedScore, setDisplayedScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayedScore(score);
      return;
    }

    let start = 0;
    const duration = 1000; // ms
    const startTime = performance.now();

    const updateScore = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (score - start) * ease);
      setDisplayedScore(current);

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      } else {
        setDisplayedScore(Math.round(score));
      }
    };

    const animId = requestAnimationFrame(updateScore);
    return () => cancelAnimationFrame(animId);
  }, [score, animate]);

  // Dimension settings
  const dimensions = {
    sm: { size: 46, stroke: 4.5, radius: 18, fontSize: 'text-[11px]', labelSize: 'text-[7px]' },
    md: { size: 76, stroke: 6, radius: 30, fontSize: 'text-base', labelSize: 'text-[9px]' },
    lg: { size: 140, stroke: 10, radius: 56, fontSize: 'text-3xl', labelSize: 'text-xs' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  // Determine color scheme based on score
  const getColor = (s: number) => {
    if (s >= 85) return { stroke: '#10B981', gradientId: 'grad-emerald', glow: 'rgba(16, 185, 129, 0.35)', textColor: 'text-emerald-700' };
    if (s >= 70) return { stroke: '#06B6D4', gradientId: 'grad-cyan', glow: 'rgba(6, 182, 212, 0.35)', textColor: 'text-cyan-700' };
    if (s >= 50) return { stroke: '#F59E0B', gradientId: 'grad-amber', glow: 'rgba(245, 158, 11, 0.35)', textColor: 'text-amber-700' };
    return { stroke: '#F43F5E', gradientId: 'grad-rose', glow: 'rgba(244, 63, 94, 0.35)', textColor: 'text-rose-700' };
  };

  const scheme = getColor(score);

  // Background track color
  const trackStroke = theme === 'dark' ? '#1E293B' : '#E2E8F0';
  // Text color
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-slate-900 font-extrabold';

  return (
    <div className="relative inline-flex flex-col items-center justify-center flex-shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.size, height: dimensions.size }}>
        {/* SVG Circular Ring */}
        <svg
          width={dimensions.size}
          height={dimensions.size}
          viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={dimensions.radius}
            stroke={trackStroke}
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />

          {/* Animated Progress Circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={dimensions.radius}
            stroke={`url(#${scheme.gradientId})`}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out',
              filter: `drop-shadow(0 0 4px ${scheme.glow})`,
            }}
          />
        </svg>

        {/* Center Number Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className={`font-mono font-black leading-none ${textColorClass} ${dimensions.fontSize}`}>
            {displayedScore}%
          </span>
          {showLabel && size === 'lg' && (
            <span className={`font-mono uppercase font-bold text-slate-400 mt-1 ${dimensions.labelSize}`}>
              AI MATCH
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
