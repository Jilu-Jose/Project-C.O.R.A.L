import React from 'react';
import { User, Scale, ShieldAlert } from 'lucide-react';

const AgentHeader = ({ role, name, color, score, status, isArbitrator }) => {
  const isSpeaking = status === 'SPEAKING' || status === 'OBSERVING';

  return (
    <div className="flex items-start justify-between shrink-0 mb-2">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {isArbitrator ? (
            <div className="w-10 h-10 rounded-full bg-coral-red/10 flex items-center justify-center text-coral-red">
              <Scale className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-coral-border flex items-center justify-center overflow-hidden">
              {/* Fallback avatar if no image */}
              <User className="w-6 h-6 text-coral-text-secondary mt-2" />
            </div>
          )}
          {/* Status Indicator Dot (from image) */}
          {isSpeaking && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${color === 'coral-orange' ? 'bg-coral-orange' : 'bg-coral-red'}`}></div>
          )}
        </div>
        
        <div>
          <h2 className="font-serif text-lg text-coral-text-primary font-medium leading-tight">{name}</h2>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${color === 'coral-orange' ? 'text-coral-orange' : color === 'coral-red' ? 'text-coral-red' : 'text-coral-text-secondary'}`}>
              {role}
            </span>
            {/* Score Badge (from text prompt) */}
            <span className={`text-[9px] px-1.5 rounded-sm font-bold bg-coral-sidebar-bg text-coral-text-primary`}>
              {score ? score.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
      
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center space-x-1.5 ${
        isSpeaking ? 'bg-[#F2EAE1] text-coral-orange' : 'bg-coral-border/50 text-coral-text-secondary'
      }`}>
        {isSpeaking && <div className="w-1.5 h-1.5 rounded-full bg-coral-orange animate-pulse"></div>}
        <span>{status}</span>
      </div>
    </div>
  );
};

export default AgentHeader;
