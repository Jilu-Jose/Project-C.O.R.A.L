import React, { useState } from 'react';
import { useCoral } from '../../context/CoralContext';
import { useApi } from '../../hooks/useApi';
import ConfigCard from './ConfigCard';
import DebateButton from './DebateButton';
import { Zap, Server, Key } from 'lucide-react';

const InputScreen = () => {
  const { state, dispatch } = useCoral();
  const { request, loading } = useApi();
  const [task, setTask] = useState('');

  const handleStartDebate = () => {
    if (!task.trim()) return;

    dispatch({ type: 'SET_TASK', payload: task });
    
    // Immediately transition to Arena with a local trace_id.
    // The backend POST /debate will be orchestrated by the DebateArena poller.
    dispatch({ 
      type: 'START_DEBATE', 
      payload: { 
        trace_id: 'local_' + Date.now(),
        round: 1,
        proposals: [],
        critiques: [],
        scores: { proposer: 0, critic: 0, arbitrator: 0 }
      } 
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 pb-12">
      <div className="max-w-4xl w-full text-center mb-10 mt-[-5vh]">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-[72px] text-coral-text-primary leading-tight mb-4">
          What logic shall we <br/>
          <span className="italic text-coral-orange">reconcile</span> today?
        </h1>
        <p className="text-coral-text-secondary text-lg md:text-xl font-light">
          Define your synthesis objective. C.O.R.A.L will orchestrate <br/>
          the dialectic between competing nodes.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-[32px] p-8 shadow-sm border border-coral-border mb-8 relative">
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the proposition or conflict..."
          className="w-full h-32 bg-transparent text-xl text-coral-text-primary placeholder:text-coral-text-secondary/50 focus:outline-none resize-none"
        />
        <div className="absolute bottom-8 right-8">
          <DebateButton 
            onClick={handleStartDebate} 
            loading={loading} 
            disabled={!task.trim()} 
          />
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConfigCard 
          title="Max Rounds"
          type="engine"
          value={state.config.max_rounds}
          min={1}
          max={5}
          step={1}
          suffix="CYCLES"
          onChange={(val) => dispatch({ type: 'UPDATE_CONFIG', payload: { max_rounds: val } })}
        />
        <ConfigCard 
          title="Convergence Threshold"
          type="accuracy"
          value={state.config.convergence_threshold}
          min={0.0}
          max={1.0}
          step={0.05}
          suffix="DELTA"
          onChange={(val) => dispatch({ type: 'UPDATE_CONFIG', payload: { convergence_threshold: val } })}
        />
        <ConfigCard 
          title="Memory Injection"
          type="context"
          isToggle={true}
          value={state.config.memory_injection}
          description={`Augment with Alpha-8 logs`}
          onChange={(val) => dispatch({ type: 'UPDATE_CONFIG', payload: { memory_injection: val } })}
        />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-coral-sidebar-bg rounded-2xl p-6 flex flex-col justify-between shadow-sm border border-coral-border/50">
          <div className="flex justify-between items-start mb-6">
            <Server className="w-5 h-5 text-coral-orange" />
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">PROVIDER</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-coral-text-primary mb-3">Compute Engine</h3>
            <div className="mt-1">
              <p className="text-xs text-coral-text-secondary mb-6 leading-relaxed">Toggle between local inference or cloud-based Bedrock models.</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${state.config.model_provider === 'bedrock' ? 'text-coral-orange' : 'text-coral-text-secondary'}`}>
                  {state.config.model_provider === 'bedrock' ? 'AMAZON BEDROCK' : 'LOCAL OLLAMA'}
                </span>
                <button 
                  onClick={() => {
                    const newProvider = state.config.model_provider === 'ollama' ? 'bedrock' : 'ollama';
                    const newModel = newProvider === 'bedrock' ? 'anthropic.claude-3-haiku-20240307-v1:0' : 'qwen:0.5b';
                    dispatch({ type: 'UPDATE_CONFIG', payload: { model_provider: newProvider, model_name: newModel } });
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${state.config.model_provider === 'bedrock' ? 'bg-[#E5D5C5]' : 'bg-coral-border'} focus:outline-none`}
                >
                  <div className={`w-4 h-4 rounded-full bg-coral-orange absolute top-0.5 transition-transform ${state.config.model_provider === 'bedrock' ? 'translate-x-5' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-coral-sidebar-bg rounded-2xl p-6 flex flex-col justify-between shadow-sm border border-coral-border/50">
          <div className="flex justify-between items-start mb-6">
            <Key className="w-5 h-5 text-coral-orange" />
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">MODEL ID</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-coral-text-primary mb-3">Model Selection</h3>
            {state.config.model_provider === 'bedrock' ? (
              <select
                value={state.config.model_name}
                onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { model_name: e.target.value } })}
                className="w-full bg-white border border-coral-border text-coral-text-primary text-sm rounded-lg focus:ring-coral-orange focus:border-coral-orange block p-2.5 outline-none"
              >
                <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
                <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                <option value="anthropic.claude-3-opus-20240229-v1:0">Claude 3 Opus</option>
                <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet</option>
              </select>
            ) : (
              <input
                type="text"
                value={state.config.model_name}
                onChange={(e) => dispatch({ type: 'UPDATE_CONFIG', payload: { model_name: e.target.value } })}
                className="w-full bg-white border border-coral-border text-coral-text-primary text-sm rounded-lg focus:ring-coral-orange focus:border-coral-orange block p-2.5 outline-none"
                placeholder="e.g. qwen:0.5b"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Status Pill */}
      <div className="fixed bottom-8 right-8 bg-white border border-coral-border px-4 py-2 rounded-full flex items-center space-x-3 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-coral-orange"></div>
        <div className="text-xs font-bold text-coral-text-primary uppercase tracking-wide">
          <span className="text-coral-text-secondary mr-2">System Status</span>
          Primary Node Active
        </div>
      </div>
    </div>
  );
};

export default InputScreen;
