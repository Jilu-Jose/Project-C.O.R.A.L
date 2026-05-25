import React from 'react';

const ArcGauge = ({ value, label, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  // value is between 0 and 1
  const safeValue = Math.min(Math.max(value || 0, 0), 1);
  const strokeDashoffset = circumference - safeValue * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} a ${radius} ${radius} 0 0 1 ${size - strokeWidth} 0`}
          fill="none"
          stroke="#E8E2D9" // coral-border
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} a ${radius} ${radius} 0 0 1 ${size - strokeWidth} 0`}
          fill="none"
          stroke="#C26D3B" // coral-orange
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="-mt-4 flex flex-col items-center">
        <span className="text-coral-text-primary font-bold text-lg">{(safeValue * 100).toFixed(0)}%</span>
        <span className="text-[10px] uppercase text-coral-text-secondary tracking-wider font-semibold mt-1 text-center leading-tight w-20">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ArcGauge;
