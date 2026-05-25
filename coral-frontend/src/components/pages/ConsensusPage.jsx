import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, PlusCircle, Globe, Search, AlertTriangle } from 'lucide-react';
import { useCoral } from '../../context/CoralContext';
import { useNavigate } from 'react-router-dom';

const ConsensusPage = () => {
  const { state, dispatch } = useCoral();
  const navigate = useNavigate();

  const finalAnswer = state.debateState.final_answer || 
    "The Architecture of Autonomous Governance must prioritize semantic interoperability over raw computational throughput.";
  
  const elaboration = "To ensure long-term stability in decentralized systems, we must recognize that consensus is not merely a mathematical average of inputs, but a narrative synthesis. The primary inhibitor of scalability is not bandwidth, but the contextual degradation of data as it passes between disparate jurisdictional nodes.\n\nOur final determination suggests a tri-layered approach: initial heuristic filtering, followed by an adversarial refinement loop, and finally, a human-centric ethical validation layer. This structure mitigates the risks of catastrophic logic loops while maintaining the speed of automated processing.";

  const insights = [
    {
      icon: <Globe className="w-5 h-5" />,
      iconColor: 'text-coral-orange',
      iconBg: 'bg-orange-50',
      title: 'Cognitive Variance',
      description: 'Low variance detected between nodes Alpha and Gamma, suggesting high conceptual stability.',
    },
    {
      icon: <Search className="w-5 h-5" />,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      title: 'Precedent Link',
      description: 'Findings align with 2026 Whitepaper on Narrative Synthesis and Distributed Trust.',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      iconColor: 'text-coral-orange',
      iconBg: 'bg-orange-50',
      title: 'Network Impact',
      description: 'Consensus propagation will trigger an automated update across 490 global nodes.',
    },
  ];

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.debateState, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `coral_consensus_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleNewDebate = () => {
    dispatch({ type: 'RESET_APP' });
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-10 custom-scrollbar items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-coral-orange"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <CheckCircle className="w-7 h-7" />
          </motion.div>
        </div>
        <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.2em] mb-2">Protocol Complete</div>
        <h1 className="font-serif text-5xl text-coral-text-primary mb-4">Consensus Reached</h1>
        <p className="text-coral-text-secondary text-sm max-w-lg mx-auto">
          The synthesis engine has reconciled conflicting perspectives across {state.debateState.round || 14} high-density logic loops. 
          The final verdict represents a 98.4% alignment across all active nodes.
        </p>
      </motion.div>

      {/* Main Consensus Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl bg-white rounded-3xl p-10 shadow-sm border border-coral-border mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-coral-orange to-transparent opacity-20" />
        
        <h2 className="font-serif text-3xl text-coral-text-primary leading-tight mb-8">
          {finalAnswer}
        </h2>
        
        <div className="w-16 h-px bg-coral-border mb-8" />
        
        <div className="font-sans text-coral-text-primary leading-relaxed text-justify">
          {elaboration.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between border-t border-coral-border pt-8 mt-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Rounds</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <span className="text-coral-orange">⟳</span>
              <span>{state.debateState.round || 14}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Convergence</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <span className="text-coral-orange">↗</span>
              <span>98.4%</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Compute Time</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <span className="text-coral-orange">⏱</span>
              <span>{state.debateState.elapsedSeconds || 1.2}s</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Confidence</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <span className="text-coral-orange">◇</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insight Cards */}
      <div className="w-full max-w-3xl grid grid-cols-3 gap-6 mb-10">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-coral-border"
          >
            <div className={`w-10 h-10 rounded-xl ${insight.iconBg} ${insight.iconColor} flex items-center justify-center mb-4`}>
              {insight.icon}
            </div>
            <h3 className="font-serif text-lg text-coral-text-primary mb-2">{insight.title}</h3>
            <p className="text-sm text-coral-text-secondary leading-relaxed">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Verification Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="w-full max-w-3xl rounded-2xl overflow-hidden mb-10 relative h-48"
        style={{
          background: 'linear-gradient(135deg, #2C2C2C 0%, #4A3728 50%, #C26D3B 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-end p-6">
          <div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] mb-1">Verified By</div>
            <div className="text-white font-serif text-lg">Director Julian Vane</div>
          </div>
        </div>
        {/* Decorative dots/nodes */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-coral-orange"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center space-x-6 mb-12"
      >
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 border-2 border-coral-orange text-coral-orange px-8 py-3 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Consensus</span>
        </button>
        <button
          onClick={handleNewDebate}
          className="flex items-center space-x-2 bg-coral-orange text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-orange-700 transition-colors shadow-glow-orange"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Debate</span>
        </button>
      </motion.div>
    </div>
  );
};

export default ConsensusPage;
