import React, { useMemo } from 'react';
import AgentHeader from './AgentHeader';
import AgentOutput from './AgentOutput';
import { Edit3 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { useCoral } from '../../context/CoralContext';

const AgentColumn = ({ role, name, color, score, status, output, previousOutputs, isArbitrator }) => {
  const { state } = useCoral();

  // Live Logic Map: Extract key points from actual agent outputs
  const logicMapPoints = useMemo(() => {
    const proposals = state.debateState?.proposals || [];
    const critiques = state.debateState?.critiques || [];
    const points = [];

    // Extract first sentence or first 60 chars from each proposal
    proposals.forEach((p, i) => {
      if (p) {
        const firstSentence = p.split(/[.!?\n]/)[0]?.trim() || p.substring(0, 60);
        points.push({
          label: firstSentence.length > 50 ? firstSentence.substring(0, 50) + '…' : firstSentence,
          source: 'proposer',
          round: i + 1
        });
      }
    });

    // Extract first sentence from each critique
    critiques.forEach((c, i) => {
      if (c) {
        const firstSentence = c.split(/[.!?\n]/)[0]?.trim() || c.substring(0, 60);
        points.push({
          label: firstSentence.length > 50 ? firstSentence.substring(0, 50) + '…' : firstSentence,
          source: 'critic',
          round: i + 1
        });
      }
    });

    return points;
  }, [state.debateState?.proposals, state.debateState?.critiques]);

  // Participation Consensus: compute bar values from actual content lengths per round
  const participationData = useMemo(() => {
    const proposals = state.debateState?.proposals || [];
    const critiques = state.debateState?.critiques || [];
    const maxRounds = state.config?.max_rounds || 3;
    const bars = [];

    for (let i = 0; i < maxRounds; i++) {
      const proposalLen = proposals[i]?.length || 0;
      const critiqueLen = critiques[i]?.length || 0;
      bars.push({ value: Math.min((proposalLen + critiqueLen) / 10, 100) || 0 });
    }

    // If no data at all, show empty bars
    if (bars.every(b => b.value === 0)) {
      return bars.map(() => ({ value: 5 }));
    }

    return bars;
  }, [state.debateState?.proposals, state.debateState?.critiques, state.config?.max_rounds]);

  // Compute convergence percentage from actual data
  const convergencePercent = useMemo(() => {
    const proposals = state.debateState?.proposals || [];
    if (proposals.length < 2) return 0;
    // Simple word overlap between last two proposals
    const last = new Set(proposals[proposals.length - 1]?.toLowerCase().split(/\s+/) || []);
    const prev = new Set(proposals[proposals.length - 2]?.toLowerCase().split(/\s+/) || []);
    if (last.size === 0 || prev.size === 0) return 0;
    const intersection = [...last].filter(w => prev.has(w)).length;
    const union = new Set([...last, ...prev]).size;
    return Math.round((intersection / union) * 100);
  }, [state.debateState?.proposals]);

  const hasAnyData = logicMapPoints.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <AgentHeader 
        role={role} 
        name={name} 
        color={color} 
        score={score} 
        status={status} 
        isArbitrator={isArbitrator}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pb-4 pr-2 space-y-4">
        {isArbitrator && (
          <>
            <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
              <h4 className="text-[10px] font-bold text-coral-red uppercase tracking-widest mb-3">Live Logic Map</h4>
              <ul className="space-y-2 text-xs text-coral-text-secondary font-medium mb-4">
                {hasAnyData ? (
                  logicMapPoints.slice(-4).map((point, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${point.source === 'proposer' ? 'bg-coral-orange' : 'bg-coral-text-secondary'}`}></div>
                      <span>{point.source === 'proposer' ? 'Point' : 'Counter'} (R{point.round}): {point.label}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-coral-text-secondary opacity-40"></div>
                    <span className="italic opacity-60">Awaiting agent output...</span>
                  </li>
                )}
              </ul>
              <div className="text-[10px] text-coral-text-secondary leading-tight border-t border-coral-border/50 pt-2">
                {hasAnyData
                  ? `Synthesizing consensus... Convergence at ${convergencePercent}%. ${logicMapPoints.length} arguments tracked.`
                  : 'Synthesizing consensus... Waiting for debate data.'}
              </div>
            </div>

            <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
              <h4 className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-3">Participation Consensus</h4>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participationData}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 30 ? '#C26D3B' : '#E5D5C5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {status === 'WAITING' && !output && !isArbitrator ? (
          <div className="h-48 flex flex-col items-center justify-center p-6 border border-dashed border-coral-border rounded-xl bg-white/40">
            <Edit3 className="w-6 h-6 text-coral-text-secondary mb-3 opacity-50" />
            <p className="text-sm font-serif italic text-coral-text-secondary text-center leading-relaxed">
              {name.split(' ')[0]} is currently drafting a {role === 'CRITIC' ? 'counter-argument' : 'response'}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AgentOutput text={output} status={status} isArbitrator={isArbitrator} />
            {previousOutputs && previousOutputs.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-coral-border shadow-sm opacity-60 mt-4">
                <p className="text-xs font-mono text-coral-text-secondary">
                  Previous: "{previousOutputs[previousOutputs.length - 1].substring(0, 100)}..."
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentColumn;
