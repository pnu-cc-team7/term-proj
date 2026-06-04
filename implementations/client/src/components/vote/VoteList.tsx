import React from 'react';
import { StickyNote, SketchButton } from '../common';

interface VoteOptionSummary {
  id?: string | number;
  name?: string;
}

interface Vote {
  id: string;
  title: string;
  status: string;
  options: VoteOptionSummary[];
}

interface VoteListProps {
  votes: Vote[];
  isLoggedIn?: boolean;
  onSelect: (voteId: string) => void;
  onViewResults: (voteId: string) => void;
  onRefresh: () => void;
  onCreateRedirect?: () => void;
}

export const VoteList: React.FC<VoteListProps> = ({
  votes,
  isLoggedIn,
  onSelect,
  onViewResults,
  onRefresh,
  onCreateRedirect,
}) => {
  return (
    <div className="vote-list-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Active Votes</h2>
        <SketchButton onClick={onRefresh} style={{ padding: '4px 12px', fontSize: '14px' }}>
          Refresh
        </SketchButton>
      </div>

      {votes.length === 0 ? (
        <div className="sketch-box" style={{ padding: '36px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '24px' }}>No open vote rooms yet</h3>
          <p className="scribble-text" style={{ marginBottom: '24px' }}>
            Create a restaurant vote first, then it will appear here for friends to join.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <SketchButton variant="primary" onClick={onCreateRedirect}>
              Create Vote Room
            </SketchButton>
            <SketchButton onClick={onRefresh}>Refresh Rooms</SketchButton>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="sketch-box"
              style={{ transition: 'transform 0.2s', position: 'relative' }}
            >
              <div style={{ cursor: 'pointer' }} onClick={() => onSelect(vote.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
                    {!isLoggedIn && (
                      <span style={{ marginRight: '8px', opacity: 0.6 }}>Login required</span>
                    )}
                    {vote.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      border: '1px solid var(--ink)',
                      borderRadius: '12px',
                      background:
                        (vote.status || '').toUpperCase() === 'OPEN'
                          ? 'var(--highlight)'
                          : 'var(--grid)',
                    }}
                  >
                    {(vote.status || 'OPEN').toUpperCase()}
                  </span>
                </div>
                <p className="scribble-text" style={{ margin: '0 0 16px 0', opacity: 0.8 }}>
                  {vote.options.length} candidates available
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--rule)', paddingTop: '12px' }}>
                <button
                  onClick={() => onViewResults(vote.id)}
                  className="scribble-text"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: 'var(--pencil)',
                    fontSize: '14px',
                  }}
                >
                  View Standings
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <StickyNote color="pink">
          <b>Tip:</b>
          <br />
          Select a vote to start swiping and decide with your friends!
        </StickyNote>
      </div>
    </div>
  );
};
