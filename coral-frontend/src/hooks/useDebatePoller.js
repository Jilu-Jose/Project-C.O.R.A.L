import { useEffect, useRef, useCallback } from 'react';
import { useApi } from './useApi';
import { useCoral } from '../context/CoralContext';

export const useDebatePoller = (traceId, onUpdate, isActive, taskText, config) => {
  const { request } = useApi();
  const { dispatch } = useCoral();
  const simState = useRef({ step: 0, backendData: null, error: null, isRunning: false });
  const timeoutRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!traceId || !isActive) return;

    // Prevent duplicate runs from React StrictMode double-mount
    if (simState.current.isRunning) return;
    simState.current.isRunning = true;
    abortRef.current = false;

    // Reset state for new simulation
    simState.current.step = 0;
    simState.current.backendData = null;
    simState.current.error = null;

    const runSimulation = async () => {
      if (abortRef.current) return;

      if (simState.current.step === 0) {
        onUpdate({
          agentStatuses: { proposer: 'THINKING', critic: 'WAITING', arbitrator: 'LISTENING' },
          traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Orchestrator', content: 'Initiating backend synthesis graph...', latency: '0ms' }]
        });
        
        try {
          const payload = {
            query: taskText,
            max_rounds: config?.max_rounds || 3,
            convergence_threshold: config?.convergence_threshold || 0.8
          };
          const response = await request({ method: 'POST', url: '/debate', data: payload });
          if (abortRef.current) return;
          simState.current.backendData = response;
        } catch (e) {
          if (abortRef.current) return;
          console.error("Backend debate request failed:", e);
          simState.current.error = e.message || 'Backend request failed';
          simState.current.isRunning = false;
          onUpdate({
            agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'IDLE' },
            traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Error', content: `Backend error: ${simState.current.error}`, latency: '0ms' }]
          });
          return;
        }
        
        simState.current.step = 1;
        if (!abortRef.current) {
          timeoutRef.current = setTimeout(runSimulation, 2000);
        }
        return;
      }

      if (abortRef.current) return;

      if (simState.current.step === 1) {
        onUpdate({
          proposals: [simState.current.backendData.proposer],
          agentStatuses: { proposer: 'IDLE', critic: 'THINKING', arbitrator: 'LISTENING' },
          traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Proposer', content: 'Generated initial proposal', latency: `${simState.current.backendData.elapsed_seconds || 0}s` }]
        });
        simState.current.step = 2;
        if (!abortRef.current) {
          timeoutRef.current = setTimeout(runSimulation, 4000);
        }
        return;
      }

      if (simState.current.step === 2) {
        onUpdate({
          critiques: [simState.current.backendData.critic],
          agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'THINKING' },
          traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Critic', content: 'Completed adversarial critique', latency: `${simState.current.backendData.elapsed_seconds || 0}s` }]
        });
        simState.current.step = 3;
        if (!abortRef.current) {
          timeoutRef.current = setTimeout(runSimulation, 4000);
        }
        return;
      }

      if (simState.current.step === 3) {
        const data = simState.current.backendData;
        simState.current.isRunning = false;

        onUpdate({
          converged: true,
          final_answer: data.final,
          round: data.round_count || 1,
          elapsedSeconds: data.elapsed_seconds || 0,
          agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'IDLE' },
          traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Arbitrator', content: 'Consensus achieved. Terminating loop.', latency: `${data.elapsed_seconds || 0}s` }]
        });

        // Save session to history
        dispatch({
          type: 'ADD_SESSION',
          payload: {
            trace_id: data.trace_id || traceId,
            task: taskText,
            status: 'CONVERGED',
            rounds: data.round_count || 1,
            elapsedSeconds: data.elapsed_seconds || 0,
            timestamp: data.timestamp || new Date().toISOString(),
            final_answer: data.final,
            proposals: [data.proposer],
            critiques: [data.critic],
          }
        });
      }
    };

    if (traceId.startsWith('local_')) {
      runSimulation();
    } else {
      const poll = async () => {
        if (abortRef.current) return;
        try {
          const data = await request({ method: 'GET', url: `/debate/status/${traceId}` });
          onUpdate(data);
          if (!abortRef.current && isActive) {
            timeoutRef.current = setTimeout(poll, 2000);
          }
        } catch (err) {
          if (!abortRef.current && isActive) {
            timeoutRef.current = setTimeout(poll, 5000);
          }
        }
      };
      poll();
    }

    return () => {
      abortRef.current = true;
      simState.current.isRunning = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceId, isActive]);
};
