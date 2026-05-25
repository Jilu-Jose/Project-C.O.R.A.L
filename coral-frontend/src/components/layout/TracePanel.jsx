import React from 'react';
import { useCoral } from '../../context/CoralContext';
import ArcGauge from '../shared/ArcGauge';

const TracePanel = () => {
  const { state } = useCoral();

  // Mocking metrics if they don't exist yet to match the image
  const metrics = state.debateState?.metrics || {
    coherence: 0.85,
    convergenceEfficiency: 0.62,
    hallucinationRisk: 0.12,
    roleStability: 0.94
  };

  const getTagStyle = (type) => {
    switch(type) {
      case 'PROPOSE': return 'text-coral-blue border-coral-blue/30 bg-coral-blue/10';
      case 'CRITIQUE': return 'text-coral-red border-coral-red/30 bg-coral-red/10';
      case 'ARBITRATE': return 'text-coral-gold border-coral-gold/30 bg-coral-gold/10';
      case 'REASSIGN': return 'text-coral-orange border-coral-orange/30 bg-coral-orange/10';
      default: return 'text-coral-text-secondary border-coral-border bg-coral-sidebar-bg';
    }
  };

  return (
    <div className="h-full flex flex-col pt-6 pb-6 px-4">
      <div className="flex items-center space-x-2 mb-6 px-2">
        <h2 className="text-sm font-bold text-coral-text-primary tracking-wide">SYSTEM TRACE FEED</h2>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Trace Feed List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6 px-2 custom-scrollbar">
        {state.traceEvents.length === 0 ? (
          <div className="text-sm text-coral-text-secondary italic text-center mt-10">Awaiting system traces...</div>
        ) : (
          state.traceEvents.map((trace, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm transition-all duration-300 ${i === state.traceEvents.length - 1 ? 'border-coral-orange shadow-glow-orange bg-white' : 'border-coral-border bg-white'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTagStyle(trace.type)}`}>
                  {trace.type}
                </span>
                <span className="text-[10px] bg-coral-sidebar-bg text-coral-text-secondary px-1.5 py-0.5 rounded-full font-mono">
                  {trace.latency}s
                </span>
              </div>
              <div className="font-mono text-xs text-coral-text-secondary leading-relaxed">
                {trace.description}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-xl border border-coral-border p-4 shrink-0 shadow-sm">
        <h3 className="text-xs font-bold text-coral-text-primary mb-4 text-center">SEMANTIC METRICS</h3>
        <div className="grid grid-cols-2 gap-y-6 gap-x-2">
          <ArcGauge value={metrics.coherence} label="Coherence" size={100} strokeWidth={6} />
          <ArcGauge value={metrics.convergenceEfficiency} label="Convergence" size={100} strokeWidth={6} />
          <ArcGauge value={metrics.hallucinationRisk} label="Variance" size={100} strokeWidth={6} />
          <ArcGauge value={metrics.roleStability} label="Stability" size={100} strokeWidth={6} />
        </div>
      </div>
    </div>
  );
};

export default TracePanel;
