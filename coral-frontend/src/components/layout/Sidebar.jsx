import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Info, Activity, Terminal, Users, CheckCircle, BarChart2, Share2 } from 'lucide-react';
import { useCoral } from '../../context/CoralContext';
import { useApi } from '../../hooks/useApi';
import { formatRelativeTime } from '../../utils/formatters';
import Modal from '../shared/Modal';
import TranscriptTimeline from '../result/TranscriptTimeline';

const navItems = [
  { path: '/', label: 'Terminal', icon: Terminal },
  { path: '/arena', label: 'Live Arena', icon: Activity },
  { path: '/roles', label: 'Roles', icon: Users },
  { path: '/consensus', label: 'Consensus', icon: CheckCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const Sidebar = () => {
  const { state, dispatch } = useCoral();
  const { request } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await request({ method: 'GET', url: '/history?limit=20' });
        dispatch({ type: 'SET_SESSION_HISTORY', payload: data });
      } catch (err) {
        // No mock data — start with empty history
        console.warn('Could not fetch history:', err.message);
      }
    };
    fetchHistory();
  }, [request, dispatch, state.appState]);

  const filteredHistory = state.sessionHistory.filter(session => 
    session.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside className="w-[280px] bg-coral-sidebar-bg flex flex-col h-full shrink-0 py-8 px-6">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-coral-orange/20 flex items-center justify-center text-coral-orange">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-coral-orange text-lg leading-tight">System Node</div>
            <div className="text-[10px] uppercase tracking-wider text-coral-text-secondary font-bold">Alpha-9 Active</div>
          </div>
        </div>

        <nav className="space-y-2 mb-8 shrink-0">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive 
                    ? 'bg-coral-sidebar-active text-coral-orange' 
                    : 'text-coral-text-secondary hover:bg-coral-sidebar-active/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="h-px bg-coral-border w-full mb-6 shrink-0"></div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">Debate History</h3>
            <span className="bg-coral-orange text-white text-[10px] px-2 py-0.5 rounded-full">{filteredHistory.length}</span>
          </div>
          
          <div className="relative mb-4 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-coral-text-secondary" />
            <input 
              type="text" 
              placeholder="Search past debates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-coral-border rounded-md pl-9 pr-3 py-2 text-xs font-medium text-coral-text-primary focus:outline-none focus:border-coral-orange transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredHistory.map(session => (
              <div 
                key={session.trace_id} 
                onClick={() => setSelectedSession(session)}
                className={`bg-white p-3 rounded-lg border cursor-pointer hover:border-coral-orange transition-colors ${state.debateState.trace_id === session.trace_id ? 'border-coral-orange bg-[#FAF8F5]' : 'border-coral-border'}`}
              >
                <div className="text-xs font-bold line-clamp-2 mb-2 leading-snug text-coral-text-primary">{session.task}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider ${
                    session.status === 'CONVERGED' ? 'bg-[#E5D5C5] text-coral-orange' : 
                    session.status === 'FAILED' ? 'bg-red-100 text-coral-red' : 'bg-coral-border text-coral-text-secondary'
                  }`}>
                    {session.status}
                  </span>
                  <span className="text-[10px] font-medium text-coral-text-secondary">{formatRelativeTime(session.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 shrink-0 bg-white border border-coral-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest">Memory Store</span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-coral-orange cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-coral-text-primary text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                CORAL will inject context from the most similar past debates into the Proposer's first message.
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold text-coral-text-primary">
            <span>{state.sessionHistory.length} Sessions stored</span>
          </div>
        </div>

        <div className="mt-6 shrink-0">
          <button 
            onClick={() => dispatch({ type: 'RESET_APP' })}
            className="w-full bg-coral-sidebar-active border border-[#D1A787] text-coral-orange py-3 rounded-lg font-bold text-sm hover:bg-coral-orange hover:text-white transition-colors shadow-sm"
          >
            Initiate Loop
          </button>
        </div>
      </aside>

      <Modal 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)}
        title="Debate Session Details"
      >
        {selectedSession && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-coral-text-secondary uppercase tracking-widest mb-2">Task Definition</h3>
              <p className="font-serif text-lg text-coral-text-primary leading-relaxed">{selectedSession.task}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
                <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Status</div>
                <div className="font-bold text-coral-text-primary text-sm">{selectedSession.status}</div>
              </div>
              <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
                <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Rounds</div>
                <div className="font-bold text-coral-text-primary text-sm">{selectedSession.rounds}</div>
              </div>
              <div className="bg-coral-sidebar-bg p-4 rounded-xl border border-coral-border">
                <div className="text-[10px] font-bold text-coral-text-secondary uppercase tracking-widest mb-1">Compute Time</div>
                <div className="font-bold text-coral-text-primary text-sm">{selectedSession.elapsedSeconds}s</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-coral-text-secondary uppercase tracking-widest mb-2">Final Consensus</h3>
              <div className="bg-white border-l-2 border-coral-orange p-4 pl-5">
                <p className="font-sans text-coral-text-primary text-sm leading-relaxed text-justify">
                  {selectedSession.final_answer || 'No final answer reached.'}
                </p>
              </div>
            </div>

            {selectedSession.proposals && (
              <div className="pt-4 border-t border-coral-border">
                <TranscriptTimeline debateState={{
                  round: selectedSession.rounds,
                  proposals: selectedSession.proposals,
                  critiques: selectedSession.critiques,
                  arbitration: selectedSession.final_answer
                }} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Sidebar;
