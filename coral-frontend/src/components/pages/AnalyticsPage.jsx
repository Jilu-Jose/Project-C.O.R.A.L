import React, { useState, useEffect } from 'react';
import { useCoral } from '../../context/CoralContext';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, TrendingUp } from 'lucide-react';

const AnalyticsPage = () => {
  const { state } = useCoral();
  const [animatedLatency, setAnimatedLatency] = useState(0);
  const [animatedConsensus, setAnimatedConsensus] = useState(0);
  const [animatedDensity, setAnimatedDensity] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimatedLatency(0.82), 300);
    const timer2 = setTimeout(() => setAnimatedConsensus(99.4), 500);
    const timer3 = setTimeout(() => setAnimatedDensity(73), 700);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  // Mock bar chart data for Reasoning Flow
  const barData = [
    { height: 45, label: '' },
    { height: 55, label: '' },
    { height: 72, label: '' },
    { height: 85, label: '84%', isPeak: true },
    { height: 78, label: '' },
    { height: 60, label: '' },
    { height: 40, label: '' },
  ];

  // Mock trace feed events
  const traceEvents = [
    { time: '14:02:11', text: 'Node Alpha-9: Consensus achieved on "Ethical Framework B"', icon: '✓', type: 'success' },
    { time: '14:01:55', text: 'System: Scaling inference capacity +15% for peak load', icon: '⚡', type: 'warning' },
    { time: '14:01:22', text: 'Protocol: Role "Auditor" initiated semantic verification', icon: '🔍', type: 'info' },
    { time: '13:59:15', text: 'Node Beta-2: Synchronized state with primary cluster', icon: '{ }', type: 'info' },
  ];

  // Semantic distribution data
  const semanticData = [
    { label: 'Reasoning Tokens', value: 42, color: '#C26D3B' },
    { label: 'Contextual Anchors', value: 28, color: '#8B4513' },
    { label: 'Metadata Overhead', value: 30, color: '#2C2C2C' },
  ];

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
          Real-time operational metrics for the Alpha-9 node. Observing convergence,
          semantic density, and latent reasoning flows within active debate protocols.
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
          <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.15em] mb-8">Active Convergence Rate</div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-center space-x-4 h-48 mb-6">
            {barData.map((bar, i) => (
              <div key={i} className="flex flex-col items-center">
                {bar.isPeak && (
                  <div className="text-[10px] font-bold text-coral-orange mb-1">{bar.label}</div>
                )}
                {bar.isPeak && (
                  <div className="text-[9px] font-bold text-coral-orange uppercase tracking-wider mb-1">Peak</div>
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
            <div className="flex items-center space-x-2 text-coral-orange text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>12% from baseline</span>
            </div>
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
            <div className="font-serif text-4xl text-white">4.2M</div>
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-[0.15em] mt-1">Inference Tokens</div>
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
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-wider">Live Monitor</span>
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

          <button className="w-full mt-6 py-3 border border-coral-border rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] text-coral-text-secondary hover:bg-coral-sidebar-bg transition-colors">
            View Full Logs
          </button>
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
                <motion.circle
                  cx="100" cy="100" r="70" fill="none" stroke="#C26D3B" strokeWidth="24"
                  strokeDasharray={`${42 * 4.4} ${100 * 4.4}`}
                  strokeDashoffset="0"
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{ strokeDasharray: `${42 * 4.4} ${58 * 4.4}` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <motion.circle
                  cx="100" cy="100" r="70" fill="none" stroke="#8B4513" strokeWidth="24"
                  strokeDasharray={`${28 * 4.4} ${72 * 4.4}`}
                  strokeDashoffset={`${-42 * 4.4}`}
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{ strokeDasharray: `${28 * 4.4} ${72 * 4.4}` }}
                  transition={{ duration: 1, delay: 1 }}
                />
                <motion.circle
                  cx="100" cy="100" r="70" fill="none" stroke="#2C2C2C" strokeWidth="24"
                  strokeDasharray={`${30 * 4.4} ${70 * 4.4}`}
                  strokeDashoffset={`${-70 * 4.4}`}
                  initial={{ strokeDasharray: '0 440' }}
                  animate={{ strokeDasharray: `${30 * 4.4} ${70 * 4.4}` }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
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
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Cluster Status</div>
          <div className="text-sm font-bold text-coral-text-primary">9 Operational Nodes</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Total Compute</div>
          <div className="text-sm font-bold text-coral-text-primary">4.8 Petaflops (Warm)</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Regional Hub</div>
          <div className="text-sm font-bold text-coral-text-primary">Global-East (Alpha)</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-[0.15em] mb-1">Last Sync</div>
          <div className="text-sm font-bold text-coral-text-primary">04s ago</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
