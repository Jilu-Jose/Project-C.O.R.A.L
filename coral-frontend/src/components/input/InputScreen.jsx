import React, { useState } from 'react';
import { useCoral } from '../../context/CoralContext';
import { useApi } from '../../hooks/useApi';
import ConfigCard from './ConfigCard';
import DebateButton from './DebateButton';
import { Zap } from 'lucide-react';

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
