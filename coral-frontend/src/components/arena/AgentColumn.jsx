import React from 'react';
import AgentHeader from './AgentHeader';
import AgentOutput from './AgentOutput';
import { Edit3 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { value: 40 },
  { value: 60 },
  { value: 30 },
  { value: 80 },
  { value: 50 },
  { value: 20 },
];

const AgentColumn = ({ role, name, color, score, status, output, previousOutputs, isArbitrator }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <AgentHeader 
        role={role} 
        name={name} 
        color={color} 
        score={score} 
        status={status} 
        isArbitrator={isArbitrator}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pb-4 pr-2 space-y-4">
        {isArbitrator && (
          <>
            <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
              <h4 className="text-[10px] font-bold text-coral-red uppercase tracking-widest mb-3">Live Logic Map</h4>
              <ul className="space-y-2 text-xs text-coral-text-secondary font-medium mb-4">
                <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-coral-orange"></div><span>Point: Algorithmic Neutrality</span></li>
                <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-coral-text-secondary"></div><span>Counter: Accountability Gap</span></li>
              </ul>
              <div className="text-[10px] text-coral-text-secondary leading-tight border-t border-coral-border/50 pt-2">
                Synthesizing consensus... Consensus convergence at 42%. Disputed area: Liability assignment.
              </div>
            </div>

            <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
              <h4 className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-3">Participation Consensus</h4>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? '#C26D3B' : '#E5D5C5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {status === 'WAITING' && !output && !isArbitrator ? (
          <div className="h-48 flex flex-col items-center justify-center p-6 border border-dashed border-coral-border rounded-xl bg-white/40">
            <Edit3 className="w-6 h-6 text-coral-text-secondary mb-3 opacity-50" />
            <p className="text-sm font-serif italic text-coral-text-secondary text-center leading-relaxed">
              {name.split(' ')[0]} is currently drafting a {role === 'CRITIC' ? 'counter-argument' : 'response'}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AgentOutput text={output} status={status} isArbitrator={isArbitrator} />
            {previousOutputs && previousOutputs.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-coral-border shadow-sm opacity-60 mt-4">
                <p className="text-xs font-mono text-coral-text-secondary">
                  Previous: "{previousOutputs[previousOutputs.length - 1].substring(0, 100)}..."
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentColumn;
