import React from 'react';
import { useCoral } from '../../context/CoralContext';
import ArcGauge from '../shared/ArcGauge';

const TracePanel = () => {
  const { state } = useCoral();

  // Derive metrics from actual debate state
  const hasDebate = state.appState !== 'idle';
  const roundsUsed = state.debateState?.round || 0;
  const maxRounds = state.config?.max_rounds || 3;
  const hasConverged = state.debateState?.converged || false;
  const proposalCount = state.debateState?.proposals?.length || 0;
  const critiqueCount = state.debateState?.critiques?.length || 0;

  const metrics = {
    // Coherence: 1.0 if converged, otherwise proportional to rounds completed
    coherence: hasDebate ? (hasConverged ? 0.95 : Math.min(roundsUsed / maxRounds, 0.7)) : 0,
    // Convergence efficiency: higher if converged in fewer rounds
    convergenceEfficiency: hasDebate ? (hasConverged ? Math.max(0.5, 1 - (roundsUsed / maxRounds) * 0.5) : roundsUsed / maxRounds * 0.4) : 0,
    // Variance: based on how many critique rounds occurred
    hallucinationRisk: hasDebate ? Math.min(critiqueCount * 0.15, 0.6) : 0,
    // Stability: high if both proposals and critiques exist
    roleStability: hasDebate ? (proposalCount > 0 && critiqueCount > 0 ? 0.9 : proposalCount > 0 ? 0.5 : 0) : 0,
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
        <div className={`w-2 h-2 rounded-full ${state.appState === 'debating' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
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
                  {trace.latency}
                </span>
              </div>
              <div className="font-mono text-xs text-coral-text-secondary leading-relaxed">
                {trace.content || trace.description}
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
