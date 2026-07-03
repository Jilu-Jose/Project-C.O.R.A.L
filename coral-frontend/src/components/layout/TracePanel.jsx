import React, { useMemo } from 'react';
import { useCoral } from '../../context/CoralContext';
import ArcGauge from '../shared/ArcGauge';

/**
 * Simple Jaccard similarity between two texts.
 */
function textSimilarity(a, b) {
  if (!a || !b) return 0;
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Count unique non-stopword terms in a text.
 */
function uniqueTerms(text) {
  if (!text) return new Set();
  const stopwords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'this', 'that', 'these', 'those', 'it', 'its']);
  return new Set(
    text.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w))
  );
}

const TracePanel = () => {
  const { state } = useCoral();

  const metrics = useMemo(() => {
    const hasDebate = state.appState !== 'idle';
    const proposals = state.debateState?.proposals || [];
    const critiques = state.debateState?.critiques || [];
    const finalAnswer = state.debateState?.final_answer || '';
    const hasConverged = state.debateState?.converged || false;

    if (!hasDebate || proposals.length === 0) {
      return { coherence: 0, convergenceEfficiency: 0, hallucinationRisk: 0, roleStability: 0 };
    }

    // Coherence: How well the final answer aligns with the latest proposal
    // If converged, measure similarity between final answer and last proposal
    const lastProposal = proposals[proposals.length - 1] || '';
    const coherence = hasConverged && finalAnswer
      ? Math.min(textSimilarity(finalAnswer, lastProposal) * 1.8, 0.98)
      : proposals.length > 0 ? 0.3 : 0;

    // Convergence Efficiency: How similar successive proposals are
    // Higher = proposals are converging (less change between rounds)
    let convergenceEfficiency = 0;
    if (proposals.length >= 2) {
      const similarities = [];
      for (let i = 1; i < proposals.length; i++) {
        similarities.push(textSimilarity(proposals[i], proposals[i - 1]));
      }
      convergenceEfficiency = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      convergenceEfficiency = Math.min(convergenceEfficiency * 1.5, 0.98);
    } else if (hasConverged) {
      convergenceEfficiency = 0.85;
    } else if (proposals.length === 1) {
      convergenceEfficiency = 0.3;
    }

    // Variance (Hallucination Risk): Ratio of unique terms introduced by critic
    // that weren't in the proposal — higher means more new concepts
    let hallucinationRisk = 0;
    if (critiques.length > 0 && proposals.length > 0) {
      const lastCritique = critiques[critiques.length - 1] || '';
      const proposalTerms = uniqueTerms(lastProposal);
      const critiqueTerms = uniqueTerms(lastCritique);
      const newTerms = [...critiqueTerms].filter(t => !proposalTerms.has(t));
      hallucinationRisk = critiqueTerms.size > 0
        ? Math.min((newTerms.length / critiqueTerms.size) * 0.8, 0.7)
        : 0;
    }

    // Stability: Are agent outputs converging in length?
    // Stable = outputs getting shorter or similar length, unstable = growing
    let roleStability = 0;
    if (proposals.length >= 2) {
      const lengths = proposals.map(p => p?.length || 0);
      const isGrowing = lengths[lengths.length - 1] > lengths[lengths.length - 2] * 1.3;
      roleStability = isGrowing ? 0.4 : 0.85;
    } else if (proposals.length === 1 && critiques.length >= 1) {
      roleStability = 0.7;
    } else if (proposals.length === 1) {
      roleStability = 0.5;
    }
    if (hasConverged) {
      roleStability = Math.max(roleStability, 0.9);
    }

    return { coherence, convergenceEfficiency, hallucinationRisk, roleStability };
  }, [state.appState, state.debateState?.proposals, state.debateState?.critiques, state.debateState?.final_answer, state.debateState?.converged]);

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
