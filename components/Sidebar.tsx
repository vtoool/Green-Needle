import React, { useState } from 'react';
import { Folder, View } from '../types';
import { FolderIcon, HeartIcon, PlusIcon, SparklesIcon, TrashIcon, TrophyIcon, XIcon } from './Icons';

interface SidebarProps {
  folders: Record<string, Folder>;
  setView: (view: View) => void;
  currentView: View;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  moveIdea: (ideaId: string, sourcePath: string[], destPath: string[]) => void;
  createFolder: (parentPath: string[], name: string, theme: string) => void;
  isDevMode: boolean;
  setIsDevMode: (isDev: boolean) => void;
}

const FolderTree: React.FC<{
    folder: Folder;
    path: string[];
    setView: (view: View) => void;
    currentPath: string[];
    icon: React.ReactNode;
    moveIdea: (ideaId: string, sourcePath: string[], destPath: string[]) => void;
}> = ({ folder, path, setView, currentPath, icon, moveIdea }) => {
    const isSelected = JSON.stringify(path) === JSON.stringify(currentPath);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.ideaId && data.sourcePath) {
                // Prevent dropping into the same folder
                if (JSON.stringify(data.sourcePath) !== JSON.stringify(path)) {
                    moveIdea(data.ideaId, data.sourcePath, path);
                }
            }
        } catch (error) {
            console.error("Failed to parse drag data", error);
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };
    
    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <button
                onClick={() => setView({ type: 'folders', path })}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isSelected ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${isDragOver ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''}`}
            >
                {icon}
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs font-medium text-gray-500">{folder.ideas.length}</span>
            </button>
            {Object.keys(folder.subFolders).length > 0 && (
                <div className="pl-6 mt-1 border-l border-gray-700">
                    {/* FIX: Use Object.keys to iterate and get strongly-typed sub-folders, avoiding potential type inference issues with Object.entries. */}
                    {Object.keys(folder.subFolders).map(subFolderId => {
                        const subFolder = folder.subFolders[subFolderId];
                        return (
                            <FolderTree 
                                key={subFolderId}
                                folder={subFolder}
                                path={[...path, subFolder.id]}
                                setView={setView}
                                currentPath={currentPath}
                                icon={<FolderIcon className="w-4 h-4" />}
                                moveIdea={moveIdea}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ folders, setView, currentView, isSidebarOpen, setIsSidebarOpen, moveIdea, createFolder, isDevMode, setIsDevMode }) => {
    const currentPath = currentView.type === 'folders' ? currentView.path : [];
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderTheme, setNewFolderTheme] = useState("");


    const handleViewChange = (view: View) => {
        setView(view);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            createFolder([], newFolderName.trim(), newFolderTheme.trim());
            setNewFolderName("");
            setNewFolderTheme("");
            setIsCreatingFolder(false);
        }
    };

    // FIX: Replaced Object.values with Object.keys, filter, and map to ensure userFolders is correctly typed as Folder[].
    const userFolders = Object.keys(folders)
        .filter(key => key !== 'liked' && key !== 'trashed' && key !== 'winners')
        .map(key => folders[key]);

    return (
        <aside className={`absolute top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 space-y-4 transform transition-transform duration-300 ease-in-out z-40 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between gap-2 px-2">
                 <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label="light bulb emoji">💡</span>
                    <h1 className="text-xl font-bold text-white">Idea Swipe</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-800 md:hidden" aria-label="Close sidebar">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
                <button
                    onClick={() => handleViewChange({ type: 'swipe' })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                        currentView.type === 'swipe' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                >
                    <span role="img" aria-label="dice emoji" className="text-xl">🎲</span>
                    Generate new ideas
                </button>
                
                <div className="pt-4 space-y-1">
                    <div className="flex justify-between items-center px-3 mb-1">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</h2>
                        <button onClick={() => setIsCreatingFolder(v => !v)} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700" aria-label="Create new folder">
                           <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {isCreatingFolder && (
                        <form onSubmit={handleCreateFolder} className="p-3 bg-gray-800/50 rounded-lg mb-2 flex flex-col gap-3 animate-fade-in-up">
                           <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="New collection name..."
                                className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                required
                                autoFocus
                            />
                            <input
                                type="text"
                                value={newFolderTheme}
                                onChange={(e) => setNewFolderTheme(e.target.value)}
                                placeholder="Optional: Set a theme"
                                className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreatingFolder(false)} className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-500 font-semibold text-xs">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-indigo-500 text-xs">Create</button>
                            </div>
                        </form>
                    )}

                    <FolderTree folder={folders.liked} path={['liked']} setView={handleViewChange} currentPath={currentPath} icon={<HeartIcon className="w-4 h-4 text-pink-400" />} moveIdea={moveIdea} />
                    {folders.winners && (
                        <FolderTree 
                            folder={folders.winners} 
                            path={['winners']} 
                            setView={handleViewChange} 
                            currentPath={currentPath} 
                            icon={<TrophyIcon className="w-4 h-4 text-yellow-400" />} 
                            moveIdea={moveIdea} 
                        />
                    )}
                    {userFolders.map(folder => (
                        <FolderTree key={folder.id} folder={folder} path={[folder.id]} setView={handleViewChange} currentPath={currentPath} icon={<FolderIcon className="w-4 h-4" />} moveIdea={moveIdea} />
                    ))}
                    <FolderTree folder={folders.trashed} path={['trashed']} setView={handleViewChange} currentPath={currentPath} icon={<TrashIcon className="w-4 h-4 text-gray-500" />} moveIdea={moveIdea} />
                </div>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between px-3 py-2">
                    <label htmlFor="dev-mode-toggle" className="text-sm text-gray-400 font-medium cursor-pointer">
                        Developer Mode
                    </label>
                    <button
                        id="dev-mode-toggle"
                        onClick={() => setIsDevMode(!isDevMode)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        isDevMode ? 'bg-indigo-600' : 'bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={isDevMode}
                    >
                        <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isDevMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        />
                    </button>
                </div>
                <p className="px-3 text-xs text-gray-500">No AI calls, uses mock data.</p>
            </div>
        </aside>
    );
};