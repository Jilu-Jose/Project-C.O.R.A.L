import React, { useState, useEffect } from 'react';
import { useCoral } from '../../context/CoralContext';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, TrendingUp } from 'lucide-react';

const AnalyticsPage = () => {
  const { state } = useCoral();
  const [animatedLatency, setAnimatedLatency] = useState(0);
  const [animatedConsensus, setAnimatedConsensus] = useState(0);
  const [animatedDensity, setAnimatedDensity] = useState(0);

  const hasDebateData = state.debateState?.converged || state.sessionHistory.length > 0;
  const elapsedSeconds = state.debateState?.elapsedSeconds || 0;
  const convergenceThreshold = state.config?.convergence_threshold || 0.80;
  const roundCount = state.debateState?.round || 0;
  const maxRounds = state.config?.max_rounds || 3;
  const totalSessions = state.sessionHistory.length;

  // Compute actual metrics
  const actualLatency = elapsedSeconds > 0 ? elapsedSeconds : 0;
  const actualConsensus = state.debateState?.converged ? (convergenceThreshold * 100) : 0;
  const proposalLength = (state.debateState?.proposals?.[0] || '').length;
  const critiqueLength = (state.debateState?.critiques?.[0] || '').length;
  const finalLength = (state.debateState?.final_answer || '').length;
  const totalTokensEstimate = Math.round((proposalLength + critiqueLength + finalLength) / 4); // rough token estimate
  const actualDensity = hasDebateData ? Math.min(Math.round((finalLength / Math.max(proposalLength + critiqueLength, 1)) * 100), 100) : 0;

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimatedLatency(actualLatency), 300);
    const timer2 = setTimeout(() => setAnimatedConsensus(actualConsensus), 500);
    const timer3 = setTimeout(() => setAnimatedDensity(actualDensity), 700);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [actualLatency, actualConsensus, actualDensity]);

  // Bar chart from session history — each bar = one past session's round count
  const barData = (() => {
    if (state.sessionHistory.length === 0 && roundCount === 0) {
      return [{ height: 10, label: '', isPeak: false }];
    }
    const sessions = [...state.sessionHistory].reverse().slice(-6);
    // Add current debate if active
    if (roundCount > 0) {
      sessions.push({ rounds: roundCount, status: 'CURRENT' });
    }
    if (sessions.length === 0) return [{ height: 10, label: '', isPeak: false }];
    const maxHeight = Math.max(...sessions.map(s => s.rounds || 1));
    return sessions.map((s, i) => {
      const rounds = s.rounds || 1;
      const heightPercent = (rounds / Math.max(maxHeight, 1)) * 100;
      const isLast = i === sessions.length - 1;
      return {
        height: Math.max(heightPercent, 10),
        label: isLast ? `${rounds}` : '',
        isPeak: isLast,
      };
    });
  })();

  // Trace events from real state
  const traceEvents = state.traceEvents.length > 0
    ? state.traceEvents.slice(-4).reverse().map(t => ({
        time: new Date(t.id).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `${t.source}: ${t.content}`,
        icon: t.type === 'SYSTEM' ? '✓' : t.type === 'LLM' ? '⚡' : '🔍',
        type: t.type === 'SYSTEM' ? 'success' : 'info',
      }))
    : [{
        time: '--:--:--',
        text: 'No trace events yet. Start a debate to see live traces.',
        icon: '—',
        type: 'info',
      }];

  // Semantic distribution from actual data
  const semanticData = (() => {
    if (!hasDebateData || totalTokensEstimate === 0) {
      return [
        { label: 'Proposal Tokens', value: 0, color: '#C26D3B' },
        { label: 'Critique Tokens', value: 0, color: '#8B4513' },
        { label: 'Synthesis Tokens', value: 0, color: '#2C2C2C' },
      ];
    }
    const proposalTokens = Math.round(proposalLength / 4);
    const critiqueTokens = Math.round(critiqueLength / 4);
    const finalTokens = Math.round(finalLength / 4);
    const total = proposalTokens + critiqueTokens + finalTokens || 1;
    return [
      { label: 'Proposal Tokens', value: Math.round((proposalTokens / total) * 100), color: '#C26D3B' },
      { label: 'Critique Tokens', value: Math.round((critiqueTokens / total) * 100), color: '#8B4513' },
      { label: 'Synthesis Tokens', value: Math.round((finalTokens / total) * 100), color: '#2C2C2C' },
    ];
  })();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-10 custom-scrollbar">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-serif text-5xl text-coral-text-primary mb-3">System Resonance</h1>
        <p className="text-coral-text-secondary text-base max-w-2xl">
          {hasDebateData
            ? `Metrics from ${totalSessions} debate session${totalSessions !== 1 ? 's' : ''}. Observing convergence, semantic density, and reasoning flows.`
            : 'No debate data available yet. Start a debate to populate analytics.'}
        </p>
      </motion.div>

      {/* Top Row: Reasoning Flow + Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Reasoning Flow Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-2 bg-white rounded-2xl p-8 border border-coral-border"
        >
          <h2 className="font-serif text-2xl text-coral-text-primary mb-1">Reasoning Flow</h2>
          <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.15em] mb-8">
            {hasDebateData ? 'Rounds Per Session' : 'Awaiting Data'}
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-center space-x-4 h-48 mb-6">
            {barData.map((bar, i) => (
              <div key={i} className="flex flex-col items-center">
                {bar.isPeak && (
                  <div className="text-[10px] font-bold text-coral-orange mb-1">{bar.label}</div>
                )}
                {bar.isPeak && (
                  <div className="text-[9px] font-bold text-coral-orange uppercase tracking-wider mb-1">Latest</div>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.height * 1.8}px` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="w-12 rounded-t-lg"
                  style={{
                    background: bar.isPeak 
                      ? 'linear-gradient(180deg, #C26D3B 0%, #D4956B 100%)'
                      : 'linear-gradient(180deg, #D4956B 0%, #E8C5A8 100%)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Latency */}
          <div className="flex items-end justify-between">
            <div>
              <motion.span
                className="font-serif text-5xl text-coral-text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {animatedLatency.toFixed(2)}s
              </motion.span>
              <div className="text-sm text-coral-text-secondary mt-1">Mean Response Latency</div>
            </div>
            {hasDebateData && (
              <div className="flex items-center space-x-2 text-coral-orange text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{roundCount} round{roundCount !== 1 ? 's' : ''} completed</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column stats */}
        <div className="flex flex-col space-y-6">
          {/* Consensus Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-coral-border flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-coral-orange/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-coral-orange" />
            </div>
            <motion.div
              className="font-serif text-4xl text-coral-text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {animatedConsensus.toFixed(1)}%
            </motion.div>
            <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mt-1">Consensus Quality</div>
          </motion.div>

          {/* Inference Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl p-8 flex-1 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C26D3B 0%, #D4956B 100%)' }}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="font-serif text-4xl text-white">
              {totalTokensEstimate > 1000 ? `${(totalTokensEstimate / 1000).toFixed(1)}K` : totalTokensEstimate}
            </div>
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-[0.15em] mt-1">Inference Tokens (est.)</div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row: System Trace Feed + Semantic Distribution */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        {/* System Trace Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border border-coral-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl text-coral-text-primary">System Trace Feed</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${state.appState === 'debating' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-wider">
                {state.appState === 'debating' ? 'Live Monitor' : 'Idle'}
              </span>
            </div>
          </div>

          <div className="space-y-0">
            {traceEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex items-start space-x-4 py-4 border-l-2 border-coral-border pl-4 relative"
              >
                <div className="absolute -left-[5px] top-5 w-2 h-2 rounded-full bg-coral-border" />
                <span className="text-[10px] font-mono text-coral-text-secondary whitespace-nowrap bg-coral-sidebar-bg px-2 py-1 rounded">{event.time}</span>
                <p className="text-sm text-coral-text-primary flex-1">{event.text}</p>
                <span className="text-base">{event.icon}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Semantic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-8 border border-coral-border"
        >
          <h3 className="font-serif text-xl text-coral-text-primary mb-8">Semantic Distribution</h3>
          
          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#F0EBE4" strokeWidth="24" />
                {/* Segments */}
                {semanticData[0].value > 0 && (
                  <motion.circle
                    cx="100" cy="100" r="70" fill="none" stroke="#C26D3B" strokeWidth="24"
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${semanticData[0].value * 4.4} ${(100 - semanticData[0].value) * 4.4}` }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                )}
                {semanticData[1].value > 0 && (
                  <motion.circle
                    cx="100" cy="100" r="70" fill="none" stroke="#8B4513" strokeWidth="24"
                    strokeDashoffset={`${-semanticData[0].value * 4.4}`}
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${semanticData[1].value * 4.4} ${(100 - semanticData[1].value) * 4.4}` }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                )}
                {semanticData[2].value > 0 && (
                  <motion.circle
                    cx="100" cy="100" r="70" fill="none" stroke="#2C2C2C" strokeWidth="24"
                    strokeDashoffset={`${-(semanticData[0].value + semanticData[1].value) * 4.4}`}
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${semanticData[2].value * 4.4} ${(100 - semanticData[2].value) * 4.4}` }}
                    transition={{ duration: 1, delay: 1.2 }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="font-serif text-4xl text-coral-text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  {animatedDensity}%
                </motion.span>
                <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">Density</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {semanticData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-coral-text-primary">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-coral-text-primary">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-coral-border pt-6 grid grid-cols-4 gap-8"
      >
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Backend Status</div>
          <div className="text-sm font-bold text-coral-text-primary">
            {state.healthStatus?.ollama ? 'Ollama Connected' : 'Ollama Offline'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Total Sessions</div>
          <div className="text-sm font-bold text-coral-text-primary">{totalSessions}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Model</div>
          <div className="text-sm font-bold text-coral-text-primary">qwen:0.5b (Local)</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Current State</div>
          <div className="text-sm font-bold text-coral-text-primary capitalize">{state.appState}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
