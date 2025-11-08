import React from 'react';
import { Idea } from '../types';
import { LightbulbIcon } from './Icons';

interface IdeaCardProps {
  idea: Idea;
  isTop: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, isTop }) => {
  return (
    <>
      <style>{`
        .idea-card {
          background-color: var(--bg-alt-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          user-select: none; /* Prevent text selection during drag */
        }
        .idea-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .idea-card-header .icon {
          width: 28px;
          height: 28px;
          color: var(--primary-color);
        }
        .idea-card-header h2 {
          font-size: 1.75rem;
        }
        .idea-card-description {
          font-size: 1.1rem;
          color: var(--text-muted-color);
          line-height: 1.6;
        }
        .idea-card-features h4 {
          margin-bottom: 0.75rem;
        }
        .idea-card-features ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .idea-card-features li {
          padding-left: 1.5rem;
          position: relative;
        }
        .idea-card-features li::before {
          content: '✓';
          color: var(--primary-color);
          position: absolute;
          left: 0;
        }
      `}</style>
      <div className={`idea-card ${isTop ? 'is-top' : ''}`}>
        <div className="idea-card-header">
          <LightbulbIcon className="icon" />
          <h2>{idea.name}</h2>
        </div>
        <p className="idea-card-description">{idea.description}</p>
        <div className="idea-card-features">
          <h4>Key Features:</h4>
          <ul>
            {idea.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default IdeaCard;