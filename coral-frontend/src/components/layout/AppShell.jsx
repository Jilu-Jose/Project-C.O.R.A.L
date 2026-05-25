import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TracePanel from './TracePanel';
import { useCoral } from '../../context/CoralContext';
import { AnimatePresence, motion } from 'framer-motion';

const AppShell = ({ children }) => {
  const { state } = useCoral();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLargeScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-coral-primary-bg text-coral-text-primary p-8 text-center font-serif text-2xl">
        C.O.R.A.L requires a minimum 1280px viewport. Please resize your window.
      </div>
    );
  }

  const showTracePanel = state.appState !== 'idle';

  return (
    <div className="flex h-screen w-full bg-coral-primary-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
      <AnimatePresence>
        {showTracePanel && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[320px] flex-shrink-0 border-l border-coral-border bg-coral-primary-bg"
          >
            <TracePanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
