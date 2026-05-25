import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

const ReassignBanner = ({ round, oldRoles, newRoles }) => {
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-coral-sidebar-bg border-y border-coral-border overflow-hidden shrink-0"
    >
      <div className="px-8 py-4 flex flex-col items-center">
        <div className="flex items-center space-x-2 text-coral-orange font-bold text-sm mb-4">
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
          <span className="tracking-widest uppercase">Role Reassignment &mdash; Round {round - 1} Complete</span>
        </div>
        
        <div className="flex w-full max-w-3xl space-x-4">
          {['proposer', 'critic', 'arbitrator'].map((key) => (
            <div key={key} className="flex-1 bg-white border border-coral-border rounded-lg p-3 text-center">
              <div className="text-xs font-bold text-coral-text-primary mb-1 capitalize">Agent {key}</div>
              <div className="flex items-center justify-center space-x-2 text-[10px]">
                <span className="text-coral-text-secondary line-through uppercase">
                  {oldRoles?.[key] || 'Old Role'}
                </span>
                <span className="text-coral-orange">→</span>
                <span className="font-bold text-coral-text-primary uppercase">
                  {newRoles?.[key] || key}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReassignBanner;
