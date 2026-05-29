import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Flame, TrendingUp } from 'lucide-react';
import { useCoral } from '../../context/CoralContext';

const RolesPage = () => {
  const { state, dispatch } = useCoral();

  const roundCount = state.debateState?.round || 0;
  const hasDebate = state.appState !== 'idle';
  const proposalText = state.debateState?.proposals?.[0] || '';
  const critiqueText = state.debateState?.critiques?.[0] || '';
  const finalText = state.debateState?.final_answer || '';

  // Compute simple "scores" from output lengths relative to each other
  const proposalLen = proposalText.length;
  const critiqueLen = critiqueText.length;
  const finalLen = finalText.length;
  const maxLen = Math.max(proposalLen, critiqueLen, finalLen, 1);

  const agents = [
    {
      name: 'Proposer Agent',
      role: state.agentStatuses?.proposer || 'WAITING',
      title: 'The Initiator',
      badge: state.agentStatuses?.proposer === 'IDLE' ? 'COMPLETED' : state.agentStatuses?.proposer || 'WAITING',
      badgeColor: state.agentStatuses?.proposer === 'IDLE' 
        ? 'bg-green-50 text-green-600' 
        : state.agentStatuses?.proposer === 'THINKING' 
          ? 'bg-coral-orange/10 text-coral-orange'
          : 'bg-gray-100 text-gray-600',
      icon: <Flame className="w-5 h-5" />,
      iconBg: 'bg-orange-50 text-coral-orange',
      description: proposalText 
        ? `Output: "${proposalText.slice(0, 120)}${proposalText.length > 120 ? '...' : ''}"` 
        : 'No proposal generated yet. Start a debate to see agent output.',
      metricLabel: 'OUTPUT DEPTH',
      metricValue: hasDebate && proposalLen > 0 ? Math.round((proposalLen / maxLen) * 100) : 0,
      metricColor: '#C26D3B',
    },
    {
      name: 'Critic Agent',
      role: state.agentStatuses?.critic || 'WAITING',
      title: 'The Challenger',
      badge: state.agentStatuses?.critic === 'IDLE'
        ? 'COMPLETED'
        : state.agentStatuses?.critic || 'WAITING',
      badgeColor: state.agentStatuses?.critic === 'IDLE'
        ? 'bg-green-50 text-green-600'
        : state.agentStatuses?.critic === 'THINKING'
          ? 'bg-coral-orange/10 text-coral-orange'
          : 'bg-gray-100 text-gray-600',
      icon: <Zap className="w-5 h-5" />,
      iconBg: 'bg-red-50 text-red-500',
      description: critiqueText
        ? `Output: "${critiqueText.slice(0, 120)}${critiqueText.length > 120 ? '...' : ''}"`
        : 'No critique generated yet. The Critic analyzes the Proposer\'s response.',
      metricLabel: 'CRITIQUE DEPTH',
      metricValue: hasDebate && critiqueLen > 0 ? Math.round((critiqueLen / maxLen) * 100) : 0,
      metricColor: '#8B4513',
    },
    {
      name: 'Arbitrator Agent',
      role: state.agentStatuses?.arbitrator || 'WAITING',
      title: 'The Synthesizer',
      badge: state.agentStatuses?.arbitrator === 'IDLE'
        ? 'COMPLETED'
        : state.agentStatuses?.arbitrator || 'WAITING',
      badgeColor: state.agentStatuses?.arbitrator === 'IDLE'
        ? 'bg-green-50 text-green-600'
        : state.agentStatuses?.arbitrator === 'THINKING'
          ? 'bg-coral-orange/10 text-coral-orange'
          : 'bg-gray-100 text-gray-600',
      icon: <Shield className="w-5 h-5" />,
      iconBg: 'bg-gray-50 text-gray-500',
      description: finalText
        ? `Output: "${finalText.slice(0, 120)}${finalText.length > 120 ? '...' : ''}"`
        : 'No synthesis generated yet. The Arbitrator reconciles Proposer and Critic outputs.',
      metricLabel: 'SYNTHESIS DEPTH',
      metricValue: hasDebate && finalLen > 0 ? Math.round((finalLen / maxLen) * 100) : 0,
      metricColor: '#2C2C2C',
    },
  ];

  // Build leaderboard from session history
  const leaderboard = (() => {
    if (state.sessionHistory.length === 0 && !hasDebate) {
      return [
        { rank: '01', name: 'No sessions yet', score: 0, color: '#C0C0C0', width: '0%' },
      ];
    }
    // Show recent sessions as leaderboard entries
    const entries = state.sessionHistory.slice(0, 5).map((session, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      name: session.task?.slice(0, 40) || 'Untitled',
      score: session.rounds || 1,
      color: i === 0 ? '#C26D3B' : i === 1 ? '#8B4513' : '#2C2C2C',
      width: `${Math.max(20, Math.round(((session.rounds || 1) / (state.config?.max_rounds || 3)) * 100))}%`,
    }));
    return entries.length > 0 ? entries : [{ rank: '01', name: 'No sessions yet', score: 0, color: '#C0C0C0', width: '0%' }];
  })();

  const avgScore = (() => {
    if (state.sessionHistory.length === 0) return 0;
    const total = state.sessionHistory.reduce((sum, s) => sum + (s.rounds || 1), 0);
    return (total / state.sessionHistory.length).toFixed(1);
  })();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-10 custom-scrollbar">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-10 border border-coral-border text-center mb-10"
      >
        <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.2em] mb-3">
          {hasDebate ? 'Process Sync' : 'Awaiting Debate'}
        </div>
        <h1 className="font-serif text-5xl text-coral-text-primary mb-4">
          {hasDebate 
            ? `Round ${roundCount} ${state.debateState?.converged ? 'Complete' : 'In Progress'}`
            : 'No Active Debate'}
        </h1>
        <p className="text-coral-text-secondary text-base max-w-xl mx-auto">
          {hasDebate
            ? 'Adaptive roles are assigned based on the debate flow. Each agent contributes its perspective to reach consensus.'
            : 'Start a new debate to see how agents are assigned and perform across rounds.'}
        </p>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-coral-border relative overflow-hidden"
          >
            {/* Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className={`w-10 h-10 rounded-xl ${agent.iconBg} flex items-center justify-center`}>
                {agent.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${agent.badgeColor}`}>
                {agent.badge}
              </span>
            </div>

            <h3 className="font-serif text-xl text-coral-text-primary mb-1">{agent.name}</h3>
            <div className="text-sm text-coral-text-secondary mb-1">
              {agent.role} → <span className="text-coral-orange font-medium">{agent.title}</span>
            </div>
            <p className="text-sm text-coral-text-secondary mt-4 mb-6 leading-relaxed line-clamp-3">
              {agent.description}
            </p>

            {/* Progress bar */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">{agent.metricLabel}</span>
                <span className="text-sm font-bold text-coral-text-primary">{agent.metricValue}%</span>
              </div>
              <div className="h-1.5 bg-coral-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: agent.metricColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.metricValue}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Session History Leaderboard */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="font-serif text-3xl text-coral-text-primary mb-2">Session<br/>Leaderboard</h2>
          <p className="text-sm text-coral-text-secondary mb-8">
            Recent debate sessions ranked by round depth and convergence results.
          </p>

          {/* Score pill */}
          <div className="bg-coral-sidebar-bg rounded-xl p-6 border border-coral-border flex items-center space-x-6">
            <div>
              <div className="font-serif text-4xl text-coral-orange">{avgScore}</div>
              <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">Avg. Rounds</div>
            </div>
            <div className="text-sm text-coral-text-secondary italic">
              {state.sessionHistory.length > 0
                ? `"${state.sessionHistory.length} session${state.sessionHistory.length !== 1 ? 's' : ''} completed."`
                : '"No sessions completed yet."'}
            </div>
          </div>
        </motion.div>

        {/* Leaderboard list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-5"
        >
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank + entry.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-coral-text-secondary">{entry.rank}</span>
                  <span className="text-sm font-bold text-coral-text-primary truncate max-w-[200px]">{entry.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: entry.color }}>{entry.score} rnd{entry.score !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-2 bg-coral-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: entry.color }}
                  initial={{ width: 0 }}
                  animate={{ width: entry.width }}
                  transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white rounded-2xl border border-coral-border p-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-coral-sidebar-bg flex items-center justify-center">
            <div className={`w-5 h-5 rounded-full border-2 ${hasDebate ? 'border-coral-orange' : 'border-coral-text-secondary'}`} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">System Status</div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasDebate ? 'bg-coral-orange animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-coral-text-primary">
                {state.appState === 'debating' ? 'Debate in progress...' 
                  : state.appState === 'converged' ? 'Consensus reached' 
                  : 'System idle'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { dispatch({ type: 'RESET_APP' }); }}
            className="px-6 py-2.5 bg-coral-orange text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
          >
            New Debate
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RolesPage;
