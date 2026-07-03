import { createContext, useReducer, useContext } from 'react';

export const CoralContext = createContext();

const initialState = {
  appState: 'idle', // 'idle' | 'debating' | 'converged'
  task: '',
  config: {
    max_rounds: 3,
    convergence_threshold: 0.80,
    memory_injection: true,
    model_provider: 'ollama',
    model_name: 'qwen:0.5b',
  },
  debateState: {
    round: 1,
    proposals: [],
    critiques: [],
    scores: {},
    final_answer: null,
    converged: false,
    trace_id: null,
    elapsedSeconds: 0,
  },
  agentStatuses: {
    proposer: 'WAITING',
    critic: 'WAITING',
    arbitrator: 'WAITING',
  },
  traceEvents: [],
  sessionHistory: [],
  healthStatus: {
    ollama: false,
    langsmith: false,
  },
};

function coralReducer(state, action) {
  switch (action.type) {
    case 'SET_APP_STATE':
      return { ...state, appState: action.payload };
    case 'SET_TASK':
      return { ...state, task: action.payload };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'START_DEBATE':
      return {
        ...state,
        appState: 'debating',
        debateState: {
          ...initialState.debateState,
          trace_id: action.payload.trace_id || `trc_${Date.now()}`,
          ...action.payload,
        },
        agentStatuses: {
          proposer: 'SPEAKING',
          critic: 'WAITING',
          arbitrator: 'WAITING',
        },
        traceEvents: [],
      };
    case 'UPDATE_DEBATE_STATE': {
      const newDebateState = { ...state.debateState };
      const payload = action.payload;

      // For proposals and critiques, use the latest array from the poller
      // (the poller builds up the full array each step)
      if (payload.proposals) {
        newDebateState.proposals = payload.proposals;
      }
      if (payload.critiques) {
        newDebateState.critiques = payload.critiques;
      }

      // Merge all other keys
      const { proposals, critiques, ...rest } = payload;
      Object.assign(newDebateState, rest);

      return {
        ...state,
        debateState: newDebateState,
      };
    }
    case 'SET_AGENT_STATUSES':
      return {
        ...state,
        agentStatuses: { ...state.agentStatuses, ...action.payload },
      };
    case 'ADD_TRACE_EVENT':
      return {
        ...state,
        traceEvents: [...state.traceEvents, action.payload],
      };
    case 'SET_TRACE_EVENTS':
      return {
        ...state,
        traceEvents: [...state.traceEvents, ...action.payload],
      };
    case 'SET_SESSION_HISTORY':
      return { ...state, sessionHistory: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessionHistory: [action.payload, ...state.sessionHistory] };
    case 'UPDATE_HEALTH':
      return { ...state, healthStatus: action.payload };
    case 'RESET_APP':
      return {
        ...initialState,
        sessionHistory: state.sessionHistory,
        healthStatus: state.healthStatus,
        config: state.config,
      };
    default:
      return state;
  }
}

export const CoralProvider = ({ children }) => {
  const [state, dispatch] = useReducer(coralReducer, initialState);

  return (
    <CoralContext.Provider value={{ state, dispatch }}>
      {children}
    </CoralContext.Provider>
  );
};

export const useCoral = () => useContext(CoralContext);
