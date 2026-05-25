import React from 'react';
import { Zap } from 'lucide-react';

const DebateButton = ({ onClick, loading, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center space-x-2 bg-coral-orange text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700 hover:shadow-glow-orange cursor-pointer'
      }`}
    >
      <span>{loading ? 'INITIALIZING...' : 'Start Debate'}</span>
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin ml-2"></div>
      ) : (
        <Zap className="w-4 h-4 ml-1" />
      )}
    </button>
  );
};

export default DebateButton;
