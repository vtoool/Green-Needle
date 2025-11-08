import React, { useState } from 'react';
import { Folder, Idea, View } from '../types';
import { FolderPlusIcon, TrashIcon } from './Icons';
import { ConfirmationDialog } from './ConfirmationDialog';

interface FolderViewProps {
  folder: Folder;
  path: string[];
  setView: (view: View) => void;
  createFolder: (parentPath: string[], name: string, theme: string) => void;
  deleteIdeaForever: (folderPath: string[], ideaId: string) => void;
}

const StaticIdeaCard: React.FC<{ 
    idea: Idea; 
    path: string[];
    isDeletable?: boolean;
    onDelete?: () => void;
    onClick: () => void;
}> = ({ idea, path, isDeletable, onDelete, onClick }) => {
    
    const handleDragStart = (e: React.DragEvent) => {
        const dragData = {
            ideaId: idea.id,
            sourcePath: path,
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
            className="bg-white dark:bg-brand-900/50 border border-gray-200 dark:border-brand-800 rounded-lg p-4 flex flex-col justify-between h-full group cursor-grab hover:bg-gray-50 dark:hover:bg-brand-900/80 hover:border-brand-500/50 transition-all"
        >
            <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">{idea.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-4">{idea.description}</p>
            </div>
            {isDeletable && (
                <div className="mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when deleting
                            onDelete?.();
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-red-600/20 text-red-400 px-3 py-2 rounded-md hover:bg-red-600/40 hover:text-red-300 transition-colors"
                        aria-label={`Permanently delete ${idea.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
};


export const FolderView: React.FC<FolderViewProps> = ({ folder, path, setView, createFolder, deleteIdeaForever }) => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderTheme, setNewFolderTheme] = useState("");
    const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            createFolder(path, newFolderName.trim(), newFolderTheme.trim());
            setNewFolderName("");
            setNewFolderTheme("");
            setIsCreatingFolder(false);
        }
    };

    const handleConfirmDelete = () => {
        if (ideaToDelete) {
            deleteIdeaForever(path, ideaToDelete.id);
            setIdeaToDelete(null);
        }
    };

    const isTrashFolder = path.length === 1 && path[0] === 'trashed';
    const canGenerate = (folder.ideas.length > 0 || !!folder.theme) && !isTrashFolder;
    const canStartBattle = folder.ideas.length >= 2;

    const handleGenerateClick = () => {
        setView({
            type: 'swipe',
            contextIdeas: folder.ideas.length > 0 ? folder.ideas : undefined,
            theme: folder.theme,
            likeTargetFolderPath: path
        });
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">{folder.name}</h1>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {canGenerate && (
                             <button
                                onClick={handleGenerateClick}
                                className="flex items-center gap-2 bg-gray-200 dark:bg-brand-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 dark:hover:bg-brand-700 transition-colors"
                            >
                                <span role="img" aria-label="dice emoji">💡</span>
                                <span>{folder.ideas.length > 0 ? "Generate More" : "Generate Ideas"}</span>
                            </button>
                        )}
                        {canStartBattle && (
                            <button
                                onClick={() => setView({ type: 'battle', path })}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-500 transition-colors"
                                title="Start a tournament to find the best idea"
                            >
                                <span role="img" aria-label="crossed swords emoji" className="text-lg">⚔️</span>
                                <span>Start Battle</span>
                            </button>
                        )}
                        {folder.ideas.length > 0 && (
                            <button
                                onClick={() => setView({ type: 'review-swipe', path })}
                                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-500 transition-colors"
                            >
                                <span role="img" aria-label="eyes emoji">👀</span>
                                <span>Review Ideas</span>
                            </button>
                        )}
                        <button 
                            onClick={() => setIsCreatingFolder(true)}
                            className="flex items-center gap-2 bg-gray-200 dark:bg-brand-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 dark:hover:bg-brand-700 transition-colors"
                        >
                            <FolderPlusIcon className="w-5 h-5" />
                            <span>Create Sub-folder</span>
                        </button>
                    </div>
                </div>

                {isCreatingFolder && (
                    <form onSubmit={handleCreateFolder} className="bg-gray-200 dark:bg-brand-900 p-4 rounded-lg mb-6 flex flex-col gap-4 animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="New folder name..."
                                className="flex-1 bg-white dark:bg-brand-800 border border-gray-300 dark:border-brand-700 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                required
                                autoFocus
                            />
                            <input
                                type="text"
                                value={newFolderTheme}
                                onChange={(e) => setNewFolderTheme(e.target.value)}
                                placeholder="Optional: Set a theme (e.g., 'AI for healthcare')"
                                className="flex-1 bg-white dark:bg-brand-800 border border-gray-300 dark:border-brand-700 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setIsCreatingFolder(false)} className="bg-gray-400 dark:bg-brand-700 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark:hover:bg-brand-600 font-semibold">Cancel</button>
                            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-500">Create</button>
                        </div>
                    </form>
                )}

                {Object.keys(folder.subFolders).length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Sub-folders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {Object.values(folder.subFolders).map((sub: Folder) => (
                                <button key={sub.id} onClick={() => setView({type: 'folders', path: [...path, sub.id]})} className="bg-white dark:bg-brand-900 p-4 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-brand-900/80 transition-colors border border-gray-200 dark:border-brand-800">
                                    <FolderPlusIcon className="w-8 h-8 text-brand-500 mb-2"/>
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{sub.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub.ideas.length} ideas</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Ideas ({folder.ideas.length})</h2>
                    {folder.ideas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {folder.ideas.map(idea => (
                                <StaticIdeaCard 
                                    key={idea.id} 
                                    idea={idea} 
                                    path={path}
                                    isDeletable={isTrashFolder}
                                    onDelete={() => setIdeaToDelete(idea)}
                                    onClick={() => setView({ type: 'idea-detail', path, ideaId: idea.id })}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-brand-800 rounded-lg">
                            <FolderPlusIcon className="w-16 h-16 text-gray-400 dark:text-brand-900 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">This folder is empty</h3>

                            {folder.theme && !isTrashFolder ? (
                                <>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">Start by generating new ideas based on your theme:</p>
                                    <p className="font-semibold text-brand-700 dark:text-brand-300 mt-1 mb-6 text-lg">"{folder.theme}"</p>
                                    <button
                                        onClick={handleGenerateClick}
                                        className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-500 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <span role="img" aria-label="dice emoji">💡</span>
                                        <span>Start Generating</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">Add some ideas by swiping in the main view.</p>
                                    <button onClick={() => setView({type: 'swipe' })} className="mt-6 text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                                        Start Swiping Now
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationDialog
                isOpen={!!ideaToDelete}
                title="Delete Idea Forever"
                message={`Are you sure you want to permanently delete "${ideaToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIdeaToDelete(null)}
            />
        </>
    );
};