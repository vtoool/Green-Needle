import React, { useState, useEffect } from 'react';
import { Idea, View } from '../types';
import { ArrowLeftIcon, SaveIcon } from './Icons';

interface IdeaDetailViewProps {
  idea: Idea;
  path: string[];
  setView: (view: View) => void;
  updateIdea: (path: string[], ideaId: string, updatedIdeaData: Partial<Idea>) => void;
}

export const IdeaDetailView: React.FC<IdeaDetailViewProps> = ({ idea, path, setView, updateIdea }) => {
    const [name, setName] = useState(idea.name);
    const [description, setDescription] = useState(idea.description);
    const [features, setFeatures] = useState(idea.features.join('\n'));
    const [notes, setNotes] = useState(idea.notes || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        const updatedFeatures = features.split('\n').map(f => f.trim()).filter(f => f);
        updateIdea(path, idea.id, {
            name,
            description,
            features: updatedFeatures,
            notes,
        });
        setIsSaved(true);
    };

    useEffect(() => {
        if (isSaved) {
            const timer = setTimeout(() => setIsSaved(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSaved]);

    const isDirty = name !== idea.name || description !== idea.description || features !== idea.features.join('\n') || notes !== (idea.notes || '');
    
    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <button onClick={() => setView({ type: 'folders', path })} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-md hover:bg-gray-200 dark:hover:bg-brand-900">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Folder
                    </button>
                    <button onClick={handleSave} disabled={!isDirty && !isSaved} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        isSaved 
                            ? 'bg-green-600 text-white' 
                            : isDirty 
                            ? 'bg-brand-600 text-white hover:bg-brand-500' 
                            : 'bg-gray-200 dark:bg-brand-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}>
                        <SaveIcon className="w-5 h-5" />
                        <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
                    </button>
                </div>

                <div className="space-y-6 bg-white dark:bg-brand-900 border border-gray-200 dark:border-brand-800 rounded-lg p-6">
                    <div>
                        <label htmlFor="idea-name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Idea Name</label>
                        <input
                            id="idea-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-brand-950 border border-gray-200 dark:border-brand-800 rounded-md p-3 text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="idea-description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                        <textarea
                            id="idea-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-100 dark:bg-brand-950 border border-gray-200 dark:border-brand-800 rounded-md p-3 text-base text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="idea-features" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Key Features (one per line)</label>
                        <textarea
                            id="idea-features"
                            value={features}
                            onChange={(e) => setFeatures(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-100 dark:bg-brand-950 border border-gray-200 dark:border-brand-800 rounded-md p-3 text-base text-gray-700 dark:text-gray-200 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="idea-notes" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Personal Notes</label>
                        <textarea
                            id="idea-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={8}
                            placeholder="Add your own thoughts, research, or implementation details here..."
                            className="w-full bg-gray-100 dark:bg-brand-950 border border-gray-200 dark:border-brand-800 rounded-md p-3 text-base text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};