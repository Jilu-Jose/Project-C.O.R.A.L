import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Flame, TrendingUp } from 'lucide-react';
import { useCoral } from '../../context/CoralContext';

const RolesPage = () => {
  const { state, dispatch } = useCoral();

  const agents = [
    {
      name: 'Agent Zephyr-4',
      role: 'Strategist',
      title: 'The Arbiter',
      badge: 'NEW ASSIGNMENT',
      badgeColor: 'bg-coral-orange/10 text-coral-orange',
      icon: <Flame className="w-5 h-5" />,
      iconBg: 'bg-red-50 text-red-500',
      description: 'Elevated for high neutrality scores and effective synthesis of conflicting data points during the stabilization phase.',
      metricLabel: 'NEUTRALITY SCORE',
      metricValue: 88,
      metricColor: '#C26D3B',
    },
    {
      name: 'Agent Mira-12',
      role: 'Observer',
      title: 'The Catalyst',
      badge: 'PROMOTED',
      badgeColor: 'bg-green-50 text-green-600',
      icon: <Zap className="w-5 h-5" />,
      iconBg: 'bg-orange-50 text-coral-orange',
      description: 'Recognized for introducing volatile variables that successfully challenged stagnant consensus loops in Round 2.',
      metricLabel: 'VARIANCE IMPACT',
      metricValue: 74,
      metricColor: '#8B4513',
    },
    {
      name: 'Agent Titan-9',
      role: 'Aggressor',
      title: 'The Anchor',
      badge: 'STABILIZED',
      badgeColor: 'bg-gray-100 text-gray-600',
      icon: <Shield className="w-5 h-5" />,
      iconBg: 'bg-gray-50 text-gray-500',
      description: 'Shifted to a defensive posture to preserve established logical frameworks against excessive speculative drift.',
      metricLabel: 'LOGIC FIDELITY',
      metricValue: 92,
      metricColor: '#2C2C2C',
    },
  ];

  const leaderboard = [
    { rank: '01', name: 'Agent Zephyr-4', score: 982, color: '#C26D3B', width: '100%' },
    { rank: '02', name: 'Agent Titan-9', score: 914, color: '#8B4513', width: '93%' },
    { rank: '03', name: 'Agent Mira-12', score: 876, color: '#2C2C2C', width: '89%' },
    { rank: '04', name: 'Agent Krios-X', score: 790, color: '#A0A0A0', width: '80%' },
    { rank: '05', name: 'Agent Echo-5', score: 645, color: '#C0C0C0', width: '65%' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-10 custom-scrollbar">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-10 border border-coral-border text-center mb-10"
      >
        <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.2em] mb-3">Process Sync Success</div>
        <h1 className="font-serif text-5xl text-coral-text-primary mb-4">Round 2 Complete</h1>
        <p className="text-coral-text-secondary text-base max-w-xl mx-auto">
          The neural weight distribution has finalized. Adaptive roles have been reassigned based on semantic performance and consensus influence.
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
            <p className="text-sm text-coral-text-secondary mt-4 mb-6 leading-relaxed">
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

      {/* Agent Score Leaderboard */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="font-serif text-3xl text-coral-text-primary mb-2">Agent Score<br/>Leaderboard</h2>
          <p className="text-sm text-coral-text-secondary mb-8">
            Aggregate performance scores across semantic depth, response latency, and consensus-driving capability.
          </p>

          {/* Score pill */}
          <div className="bg-coral-sidebar-bg rounded-xl p-6 border border-coral-border flex items-center space-x-6">
            <div>
              <div className="font-serif text-4xl text-coral-orange">89.4</div>
              <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">Avg. Node Score</div>
            </div>
            <div className="text-sm text-coral-text-secondary italic">
              "Performance increased by 12% compared to Round 1 stabilization."
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
              key={entry.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-coral-text-secondary">{entry.rank}</span>
                  <span className="text-sm font-bold text-coral-text-primary">{entry.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: entry.color }}>{entry.score} pts</span>
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

      {/* View Full System Metrics link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mb-12"
      >
        <button className="text-coral-orange text-sm font-bold flex items-center space-x-2 border-b border-coral-orange pb-0.5 hover:opacity-80 transition-opacity">
          <span>View Full System Metrics</span>
          <TrendingUp className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Footer Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white rounded-2xl border border-coral-border p-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-coral-sidebar-bg flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-coral-text-secondary" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em]">System Status</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-coral-orange animate-pulse" />
              <span className="text-sm text-coral-text-primary">Re-synchronization in progress...</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-2.5 border border-coral-border rounded-lg text-sm font-bold text-coral-text-primary hover:bg-coral-sidebar-bg transition-colors">
            Download Log
          </button>
          <button 
            onClick={() => dispatch({ type: 'RESET_APP' })}
            className="px-6 py-2.5 bg-coral-orange text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Begin Round 3
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RolesPage;
