import React, { useEffect, useState } from 'react';
import { useCoral } from '../../context/CoralContext';
import { useDebatePoller } from '../../hooks/useDebatePoller';
import AgentColumn from './AgentColumn';
import RoundProgress from './RoundProgress';
import ReassignBanner from './ReassignBanner';
import { motion, AnimatePresence } from 'framer-motion';

const DebateArena = () => {
  const { state, dispatch } = useCoral();
  const [showBanner, setShowBanner] = useState(false);
  const [oldRoles, setOldRoles] = useState(null);

  // Poll for updates if trace_id is present
  useDebatePoller(
    state.debateState.trace_id,
    (newData) => {
      // If round changed, show banner
      if (newData.round > state.debateState.round) {
        setOldRoles(state.debateState.roles || null);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
      dispatch({ type: 'UPDATE_DEBATE_STATE', payload: newData });
      if (newData.agentStatuses) {
        dispatch({ type: 'SET_AGENT_STATUSES', payload: newData.agentStatuses });
      }
      if (newData.traceEvents && Array.isArray(newData.traceEvents)) {
        dispatch({ type: 'SET_TRACE_EVENTS', payload: newData.traceEvents });
      }
      if (newData.converged) {
        setTimeout(() => {
          dispatch({ type: 'SET_APP_STATE', payload: 'converged' });
        }, 3000);
      }
    },
    state.appState === 'debating' && !state.debateState.converged,
    state.task,
    state.config
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-coral-primary-bg">
      <div className="px-8 pt-6 pb-2 shrink-0">
        <RoundProgress 
          current={state.debateState.round} 
          max={state.config.max_rounds} 
          elapsedSeconds={state.debateState.elapsedSeconds} 
        />
        <div className="text-center mt-6 mb-8">
          <h1 className="font-serif text-4xl text-coral-text-primary mb-2 line-clamp-1 px-10">
            {state.task}
          </h1>
          <p className="text-coral-text-secondary text-sm">
            Phase {state.debateState.round}: Orchestrating logic reconciliation across nodes.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showBanner && (
          <ReassignBanner 
            round={state.debateState.round} 
            oldRoles={oldRoles} 
            newRoles={state.debateState.roles} 
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex px-6 pb-6 space-x-6 min-h-0 relative">
        <AgentColumn 
          role="PROPOSER" 
          name="Julian Thorne"
          color="coral-orange"
          score={state.debateState.scores?.proposer || 0.00}
          status={state.agentStatuses.proposer}
          output={state.debateState.proposals[state.debateState.round - 1] || ''}
          previousOutputs={state.debateState.proposals.slice(0, state.debateState.round - 1)}
        />
        
        {/* Animated Arrow */}
        <div className="w-6 flex items-center justify-center shrink-0">
          <motion.svg 
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            animate={{ opacity: state.agentStatuses.proposer === 'SPEAKING' ? [0.2, 1, 0.2] : 0.2 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </div>

        <AgentColumn 
          role="CRITIC" 
          name="Elena Vance"
          color="coral-text-primary"
          score={state.debateState.scores?.critic || 0.00}
          status={state.agentStatuses.critic}
          output={state.debateState.critiques[state.debateState.round - 1] || ''}
        />

        {/* Animated Arrow */}
        <div className="w-6 flex items-center justify-center shrink-0">
          <motion.svg 
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            animate={{ opacity: state.agentStatuses.critic === 'SPEAKING' ? [0.2, 1, 0.2] : 0.2 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" stroke="#C26D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </div>

        <AgentColumn 
          role="ARBITRATOR" 
          name="System Node"
          color="coral-red"
          score={state.debateState.scores?.arbitrator || 0.00}
          status={state.agentStatuses.arbitrator}
          output={state.debateState.arbitration || ''}
          isArbitrator={true}
        />
      </div>
    </div>
  );
};

export default DebateArena;
