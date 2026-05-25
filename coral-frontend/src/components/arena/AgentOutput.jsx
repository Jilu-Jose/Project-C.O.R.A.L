import React, { useEffect, useRef } from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

const AgentOutput = ({ text, status, isArbitrator }) => {
  const displayedText = useTypewriter(text, 10); // slightly faster than 18ms for better UX
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedText]);

  if (!text && status === 'WAITING') return null;

  return (
    <div className={`p-6 rounded-xl border border-coral-border shadow-sm ${
      isArbitrator ? 'bg-coral-sidebar-bg border-coral-red/20' : 'bg-coral-sidebar-bg'
    }`}>
      <div className="font-mono text-sm text-coral-text-primary leading-relaxed whitespace-pre-wrap">
        {displayedText}
        {status === 'SPEAKING' && (
          <span className="inline-block w-2 h-4 bg-coral-orange ml-1 animate-pulse align-middle"></span>
        )}
      </div>
      <div ref={endRef} />
    </div>
  );
};

export default AgentOutput;
