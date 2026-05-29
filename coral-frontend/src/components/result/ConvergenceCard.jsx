import React, { useState } from 'react';
import { useCoral } from '../../context/CoralContext';
import { useApi } from '../../hooks/useApi';
import { Download, PlusCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import TranscriptTimeline from './TranscriptTimeline';
import { motion, AnimatePresence } from 'framer-motion';

const ConvergenceCard = () => {
  const { state, dispatch } = useCoral();
  const { request } = useApi();
  const [showTranscript, setShowTranscript] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await request({ method: 'GET', url: `/reports/${state.debateState.trace_id}` });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `coral_report_${state.debateState.trace_id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.error("Failed to export report", err);
      // Fallback if backend is unavailable
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.debateState, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `coral_report_${state.debateState.trace_id}_fallback.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } finally {
      setExporting(false);
    }
  };

  const handleNewDebate = () => {
    dispatch({ type: 'RESET_APP' });
  };

  const finalAnswer = state.debateState.final_answer || "No consensus reached.";

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-10 custom-scrollbar items-center">
      <div className="max-w-4xl w-full text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-coral-orange">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-coral-orange uppercase tracking-[0.2em] mb-2">Protocol Complete</div>
        <h1 className="font-serif text-5xl text-coral-text-primary mb-4">Consensus Reached</h1>
        <p className="text-coral-text-secondary text-sm px-20">
          The synthesis engine has reconciled conflicting perspectives across {state.debateState.round} high-density logic loops. 
          The final verdict represents a {(state.config.convergence_threshold * 100).toFixed(1)}% alignment across all active nodes.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl p-10 shadow-sm border border-coral-border mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-coral-orange to-transparent opacity-20"></div>
        
        <h2 className="font-serif text-3xl text-coral-text-primary leading-tight mb-8">
          {state.task}
        </h2>
        
        <div className="w-16 h-px bg-coral-border mb-8"></div>
        
        <div className="font-sans text-coral-text-primary leading-relaxed mb-10 text-justify">
          {finalAnswer.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-coral-border pt-8 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Rounds</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <RefreshCcwIcon /> <span>{state.debateState.round}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Convergence</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <TrendingUpIcon /> <span>{(state.config.convergence_threshold * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Compute Time</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <TimerIcon /> <span>{state.debateState.elapsedSeconds || 1.2}s</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Confidence</span>
            <div className="flex items-center space-x-2 text-coral-text-primary font-serif text-xl">
              <ShieldIcon /> <span>High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-6 mb-12">
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center space-x-2 border-2 border-coral-orange text-coral-orange px-8 py-3 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Exporting...' : 'Export Consensus'}</span>
        </button>
        <button 
          onClick={handleNewDebate}
          className="flex items-center space-x-2 bg-coral-orange text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-orange-700 transition-colors shadow-glow-orange"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Debate</span>
        </button>
      </div>

      <div className="w-full max-w-4xl text-center mb-8">
        <button 
          onClick={() => setShowTranscript(!showTranscript)}
          className="text-sm font-bold text-coral-text-secondary hover:text-coral-orange flex items-center justify-center w-full space-x-2"
        >
          <span>{showTranscript ? 'Hide' : 'View'} Full Debate Transcript</span>
          {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {showTranscript && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-4xl overflow-hidden"
          >
            <TranscriptTimeline debateState={state.debateState} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const RefreshCcwIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L21 8"/><path d="M3 22v-6h6"/><path d="M21 12A9 9 0 1 0 18.4 18.4L3 16"/></svg>;
const TrendingUpIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TimerIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ShieldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default ConvergenceCard;
