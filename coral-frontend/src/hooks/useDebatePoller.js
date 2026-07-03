import { useEffect, useRef, useCallback } from 'react';
import { useApi } from './useApi';
import { useCoral } from '../context/CoralContext';

export const useDebatePoller = (traceId, onUpdate, isActive, taskText, config) => {
  const { request } = useApi();
  const { dispatch } = useCoral();
  const simState = useRef({ step: 0, backendData: null, error: null, isRunning: false, animating: false });
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
    simState.current.animating = false;

    const fireDebateAndAnimate = async () => {
      if (abortRef.current) return;

      // Step 0: Show initial "thinking" state
      onUpdate({
        agentStatuses: { proposer: 'THINKING', critic: 'WAITING', arbitrator: 'LISTENING' },
        traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Orchestrator', content: 'Initiating backend synthesis graph...', latency: '0ms' }]
      });

      // Fire the backend debate request
      let startResponse;
      try {
        const payload = {
          query: taskText,
          max_rounds: config?.max_rounds || 3,
          convergence_threshold: config?.convergence_threshold || 0.8,
          model_provider: config?.model_provider || 'ollama',
          model_name: config?.model_name || 'qwen:0.5b',
          memory_injection: config?.memory_injection || false,
        };
        startResponse = await request({ method: 'POST', url: '/debate', data: payload });
        if (abortRef.current) return;
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

      // Now poll /debate/status/{trace_id} until CONVERGED or FAILED
      const serverTraceId = startResponse.trace_id;

      const pollForCompletion = async () => {
        if (abortRef.current) return;

        try {
          const data = await request({ method: 'GET', url: `/debate/status/${serverTraceId}` });
          if (abortRef.current) return;

          if (data.status === 'CONVERGED' || data.status === 'FAILED') {
            simState.current.backendData = data;

            if (data.status === 'FAILED') {
              simState.current.isRunning = false;
              onUpdate({
                agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'IDLE' },
                traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Error', content: `Debate failed: ${data.error || 'Unknown error'}`, latency: '0ms' }]
              });
              return;
            }

            // Debate is complete — animate through all rounds
            animateRounds(data);
          } else {
            // Still running, poll again
            if (!abortRef.current) {
              timeoutRef.current = setTimeout(pollForCompletion, 2000);
            }
          }
        } catch (err) {
          if (!abortRef.current) {
            timeoutRef.current = setTimeout(pollForCompletion, 3000);
          }
        }
      };

      pollForCompletion();
    };

    /**
     * Animate through all rounds of the completed debate.
     * Parses debate_history to extract per-round proposals and critiques,
     * then steps through them with timed delays.
     */
    const animateRounds = (data) => {
      if (abortRef.current) return;
      simState.current.animating = true;

      const history = data.history || [];

      // Group history entries into rounds
      const rounds = [];
      let currentRound = { proposer: null, critic: null };
      for (const entry of history) {
        if (entry.role === 'proposer') {
          if (currentRound.proposer !== null) {
            rounds.push({ ...currentRound });
            currentRound = { proposer: null, critic: null };
          }
          currentRound.proposer = entry.content;
        } else if (entry.role === 'critic') {
          currentRound.critic = entry.content;
          rounds.push({ ...currentRound });
          currentRound = { proposer: null, critic: null };
        }
        // arbitrator entries are handled separately
      }
      if (currentRound.proposer !== null) {
        rounds.push(currentRound);
      }

      const arbitratorEntry = history.find(e => e.role === 'arbitrator');
      const totalSteps = rounds.length * 2 + (arbitratorEntry ? 1 : 0);
      let stepIndex = 0;

      const runStep = () => {
        if (abortRef.current) return;

        const roundIdx = Math.floor(stepIndex / 2);
        const isProposerStep = stepIndex % 2 === 0;

        // Check if we're past all rounds — show arbitrator
        if (roundIdx >= rounds.length) {
          if (arbitratorEntry) {
            const finalData = simState.current.backendData;
            simState.current.isRunning = false;
            simState.current.animating = false;

            onUpdate({
              converged: true,
              final_answer: finalData.final,
              round: finalData.round_count || rounds.length,
              elapsedSeconds: finalData.elapsed_seconds || 0,
              agentStatuses: { proposer: 'IDLE', critic: 'IDLE', arbitrator: 'IDLE' },
              traceEvents: [{ id: Date.now(), type: 'SYSTEM', source: 'Arbitrator', content: 'Consensus achieved. Terminating loop.', latency: `${finalData.elapsed_seconds || 0}s` }]
            });

            // Build full arrays for session history
            const allProposals = rounds.map(r => r.proposer).filter(Boolean);
            const allCritiques = rounds.map(r => r.critic).filter(Boolean);

            dispatch({
              type: 'ADD_SESSION',
              payload: {
                trace_id: finalData.trace_id || traceId,
                task: taskText,
                status: 'CONVERGED',
                rounds: finalData.round_count || rounds.length,
                elapsedSeconds: finalData.elapsed_seconds || 0,
                timestamp: finalData.timestamp || new Date().toISOString(),
                final_answer: finalData.final,
                proposals: allProposals,
                critiques: allCritiques,
              }
            });
          }
          return;
        }

        const round = rounds[roundIdx];

        if (isProposerStep && round.proposer) {
          // Show proposer output for this round
          onUpdate({
            proposals: rounds.slice(0, roundIdx + 1).map(r => r.proposer).filter(Boolean),
            round: roundIdx + 1,
            agentStatuses: { proposer: 'IDLE', critic: 'THINKING', arbitrator: 'LISTENING' },
            traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Proposer', content: `Round ${roundIdx + 1}: Generated proposal`, latency: `${data.elapsed_seconds || 0}s` }]
          });
          stepIndex++;
          if (!abortRef.current) {
            timeoutRef.current = setTimeout(runStep, 2500);
          }
        } else if (!isProposerStep && round.critic) {
          // Show critic output for this round
          onUpdate({
            critiques: rounds.slice(0, roundIdx + 1).map(r => r.critic).filter(Boolean),
            round: roundIdx + 1,
            agentStatuses: { proposer: roundIdx + 1 < rounds.length ? 'THINKING' : 'IDLE', critic: 'IDLE', arbitrator: 'LISTENING' },
            traceEvents: [{ id: Date.now(), type: 'LLM', source: 'Critic', content: `Round ${roundIdx + 1}: Completed adversarial critique`, latency: `${data.elapsed_seconds || 0}s` }]
          });
          stepIndex++;
          if (!abortRef.current) {
            timeoutRef.current = setTimeout(runStep, 2500);
          }
        } else {
          // Skip missing entries
          stepIndex++;
          if (!abortRef.current) {
            runStep();
          }
        }
      };

      // Small delay before starting animation
      timeoutRef.current = setTimeout(runStep, 1500);
    };

    if (traceId.startsWith('local_')) {
      fireDebateAndAnimate();
    } else {
      // External trace_id: poll /debate/status directly
      const poll = async () => {
        if (abortRef.current) return;
        try {
          const data = await request({ method: 'GET', url: `/debate/status/${traceId}` });
          onUpdate(data);
          if (data.status === 'CONVERGED' || data.status === 'FAILED') {
            simState.current.isRunning = false;
            return;
          }
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
      simState.current.animating = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceId, isActive]);
};
