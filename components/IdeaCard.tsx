

import React from 'react';
import { Idea } from '../types';
import { LightbulbIcon, CheckCircleIcon } from './Icons';

interface IdeaCardProps {
  idea: Idea;
  isTop: boolean;
  swipeOffset?: number;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, isTop, swipeOffset = 0 }) => {
  const likeOpacity = Math.max(0, Math.min(swipeOffset / 100, 1));
  const nopeOpacity = Math.max(0, Math.min(-swipeOffset / 100, 1));

  return (
    <div className="relative w-full h-full bg-white dark:bg-brand-900 border border-gray-200 dark:border-brand-800 rounded-2xl shadow-lg select-none text-gray-900 dark:text-white overflow-hidden">
      
      <div
        className="absolute top-10 left-6 border-4 border-brand-500 rounded-lg px-4 py-2 transform -rotate-12 pointer-events-none z-10"
        style={{ opacity: likeOpacity, transition: 'opacity 0.1s ease-out' }}
        aria-hidden="true"
      >
        <span className="text-3xl font-black text-brand-500 tracking-widest">LIKE</span>
      </div>

      <div
        className="absolute top-10 right-6 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 pointer-events-none z-10"
        style={{ opacity: nopeOpacity, transition: 'opacity 0.1s ease-out' }}
        aria-hidden="true"
      >
        <span className="text-3xl font-black text-red-500 tracking-widest">NOPE</span>
      </div>

      <div className="p-6 sm:p-8 h-full flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <LightbulbIcon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-500 flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">{idea.name}</h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">{idea.description}</p>
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-brand-700/50">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-brand-400 uppercase tracking-wider mb-3">Key Features:</h4>
          <ul className="list-none p-0 flex flex-col gap-3">
            {idea.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 line-clamp-2">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;