import React from 'react';

const RoundProgress = ({ current, max, elapsedSeconds }) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">
          Round {current} of {max}
        </span>
        <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">
          {formatTime(elapsedSeconds)} Elapsed
        </span>
      </div>
      <div className="w-full h-1 bg-coral-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-coral-orange transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RoundProgress;
