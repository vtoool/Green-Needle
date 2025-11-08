import React from 'react';
import { Idea } from '../types';
import { CheckCircleIcon } from './Icons';

interface BattleIdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

export const BattleIdeaCard: React.FC<BattleIdeaCardProps> = ({ idea, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-brand-900 border-2 border-gray-200 dark:border-brand-800 rounded-2xl p-4 flex flex-col h-full cursor-pointer hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-brand-900/80 transition-all duration-200 group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`Select idea: ${idea.name}`}
    >
      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">{idea.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{idea.description}</p>
        <hr className="my-3 border-gray-200 dark:border-brand-700"/>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-brand-400 uppercase tracking-wider mb-2">Key Features</h4>
        <ul className="space-y-2 pb-2">
            {idea.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">{feature}</span>
                </li>
            ))}
        </ul>
      </div>
       <div className="mt-auto pt-2 text-center">
        <span className="w-full block text-sm font-semibold bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 px-4 py-2 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-colors">
          Choose this Idea
        </span>
      </div>
    </div>
  );
};