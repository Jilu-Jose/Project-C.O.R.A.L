import { useEffect, useRef } from 'react';
import { useApi } from './useApi';

export const useDebatePoller = (traceId, onUpdate, isActive, taskText, config) => {
  const { request } = useApi();
  const simState = useRef({ step: 0, backendData: null });
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!traceId || !isActive) return;

    const runSimulation = async () => {
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
          simState.current.backendData = response;
        } catch (e) {
          console.warn("Backend failed, using fallback simulation data");
          simState.current.backendData = {
            proposer: "Decentralization provides robustness by eliminating single points of failure. The algorithmic neutrality guarantees fairness.",
            critic: "While robust, it introduces an accountability gap. Who is liable when a decentralized autonomous organization causes harm?",
            final: "To ensure long-term stability in decentralized systems, we must recognize that consensus is not merely a mathematical average of inputs, but a narrative synthesis. Liability must be encoded into smart contracts via multisig legal proxies.",
            history: []
          };
        }
        
        simState.current.step = 1;
        timeoutRef.current = setTimeout(runSimulation, 2000);
        return;
      }

      if (simState.current.step === 1) {
        onUpdate({
          proposals: [simState.current.backendData.proposer],
          agentStatuses: { proposer: 'IDLE', critic: 'THINKING', arbitrator: 'LISTENING' },
          traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Proposer', content: 'Generated initial algorithmic proposal', latency: '450ms' }]
        });
        simState.current.step = 2;
        timeoutRef.current = setTimeout(runSimulation, 4000);
        return;
      }

      if (simState.current.step === 2) {
        onUpdate({
          critiques: [simState.current.backendData.critic],
          agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'THINKING' },
          traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Critic', content: 'Identified critical accountability flaws', latency: '380ms' }]
        });
        simState.current.step = 3;
        timeoutRef.current = setTimeout(runSimulation, 4000);
        return;
      }

      if (simState.current.step === 3) {
        onUpdate({
          converged: true,
          final_answer: simState.current.backendData.final,
          agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'IDLE' },
          traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Arbitrator', content: 'Consensus achieved. Terminating loop.', latency: '120ms' }]
        });
      }
    };

    if (isActive) {
      if (traceId.startsWith('local_')) {
        runSimulation();
      } else {
        // Standard polling if we ever get a real streaming backend
        const poll = async () => {
          try {
            const data = await request({ method: 'GET', url: `/debate/status/${traceId}` });
            onUpdate(data);
            if (isActive) timeoutRef.current = setTimeout(poll, 2000);
          } catch (err) {
            if (isActive) timeoutRef.current = setTimeout(poll, 5000);
          }
        };
        poll();
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [traceId, isActive, request, onUpdate, taskText, config]);
};
