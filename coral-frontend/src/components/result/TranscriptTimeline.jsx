import React from 'react';

const TranscriptTimeline = ({ debateState }) => {
  if (!debateState) return null;

  const rounds = [];
  for (let i = 0; i < debateState.round; i++) {
    if (debateState.proposals && debateState.proposals[i]) {
      rounds.push({ role: 'PROPOSER', name: 'Julian Thorne', color: 'bg-coral-blue/10 text-coral-blue border-coral-blue', round: i + 1, text: debateState.proposals[i] });
    }
    if (debateState.critiques && debateState.critiques[i]) {
      rounds.push({ role: 'CRITIC', name: 'Elena Vance', color: 'bg-coral-red/10 text-coral-red border-coral-red', round: i + 1, text: debateState.critiques[i] });
    }
  }
  if (debateState.arbitration) {
    rounds.push({ role: 'ARBITRATOR', name: 'System Node', color: 'bg-coral-gold/10 text-coral-gold border-coral-gold', round: 'Final', text: debateState.arbitration });
  }

  return (
    <div className="bg-white rounded-2xl border border-coral-border p-8 mb-12">
      <h3 className="font-serif text-xl text-coral-text-primary mb-6">Debate Transcript</h3>
      <div className="space-y-6">
        {rounds.map((entry, idx) => (
          <div key={idx} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 border-b border-coral-border pb-6 last:border-0 last:pb-0">
            <div className="shrink-0 w-32">
              <div className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-sm border uppercase ${entry.color}`}>
                {entry.role}
              </div>
              <div className="font-bold text-coral-text-primary text-xs mt-2">{entry.name}</div>
              <div className="text-[10px] text-coral-text-secondary uppercase tracking-widest mt-1">Round {entry.round}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-coral-text-secondary whitespace-pre-wrap leading-relaxed">
                {entry.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptTimeline;
