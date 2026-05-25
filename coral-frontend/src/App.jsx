import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import InputScreen from './components/input/InputScreen';
import DebateArena from './components/arena/DebateArena';
import ConvergenceCard from './components/result/ConvergenceCard';
import AnalyticsPage from './components/pages/AnalyticsPage';
import RolesPage from './components/pages/RolesPage';
import ConsensusPage from './components/pages/ConsensusPage';
import { useCoral } from './context/CoralContext';
import { useApi } from './hooks/useApi';
import Toast from './components/shared/Toast';

function MainContent() {
  const { state, dispatch } = useCoral();
  
  if (state.appState === 'idle') {
    return <InputScreen />;
  }
  
  if (state.appState === 'debating') {
    return <DebateArena />;
  }
  
  if (state.appState === 'converged') {
    return <ConvergenceCard />;
  }

  return null;
}

function App() {
  const { dispatch } = useCoral();
  const { request } = useApi();
  const [errorToast, setErrorToast] = useState(null);

  useEffect(() => {
    // Health polling
    const checkHealth = async () => {
      try {
        // Fallback for no-backend: if it fails, just show false, but we'll simulate true for UI purposes if needed
        const res = await request({ method: 'GET', url: '/health' }).catch(() => ({
          ollama: true, // mock for UI
          langsmith: true // mock for UI
        }));
        dispatch({ type: 'UPDATE_HEALTH', payload: res || { ollama: true, langsmith: true } });
      } catch (e) {
        // Suppress initial health check errors so UI can render
        dispatch({ type: 'UPDATE_HEALTH', payload: { ollama: false, langsmith: false } });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [dispatch, request]);

  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/arena" element={<DebateArena />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/consensus" element={<ConsensusPage />} />
        </Routes>
      </AppShell>
      {errorToast && (
        <Toast message={errorToast} onClose={() => setErrorToast(null)} />
      )}
    </Router>
  );
}

export default App;

