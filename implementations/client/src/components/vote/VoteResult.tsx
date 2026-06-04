import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VoteResult.css';
import { SketchButton } from '../common';

interface VoteResultOption {
  id: number;
  name: string;
  count: number;
}

interface VoteResultData {
  totalVotes: number;
  options: VoteResultOption[];
}

interface VoteResultProps {
  voteId: string;
  voteTitle: string;
  onBack: () => void;
}

export const VoteResult: React.FC<VoteResultProps> = ({ voteId, voteTitle, onBack }) => {
  const [result, setResult] = useState<VoteResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/votes/${voteId}/results`);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to fetch vote results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [voteId]);

  if (loading) {
    return (
      <div className="vote-result-container" style={{ textAlign: 'center' }}>
        <h2 className="scribble-text">Loading results...</h2>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="vote-result-container" style={{ textAlign: 'center' }}>
        <h2>Error loading results</h2>
        <SketchButton onClick={onBack}>Go Back</SketchButton>
      </div>
    );
  }

  return (
    <div className="vote-result-container">
      <h2 style={{ marginBottom: '8px' }}>{voteTitle}</h2>
      <p className="scribble-text" style={{ marginBottom: '32px' }}>Real-time Voting Standings</p>

      <div className="sketch-box" style={{ padding: '32px' }}>
        <div className="result-list">
          {result.options.map((option) => {
            const percentage = result.totalVotes > 0 
              ? Math.round((option.count / result.totalVotes) * 100) 
              : 0;

            return (
              <div key={option.id} className="result-item">
                <div className="result-info">
                  <span className="result-name">📍 {option.name}</span>
                  <span className="result-count">{option.count} votes ({percentage}%)</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="total-summary">
          <p className="scribble-text">Total {result.totalVotes} friends participated</p>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <SketchButton variant="primary" onClick={onBack}>Back to List</SketchButton>
      </div>
    </div>
  );
};
