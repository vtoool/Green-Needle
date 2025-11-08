
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import SwipeScreen from '../components/SwipeScreen';
import { FolderView } from '../components/FolderView';
import { IdeaDetailView } from '../components/IdeaDetailView';
import { BattleArenaView } from '../components/BattleArenaView';
import { Folder, Idea, View } from '../types';
import { MenuIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const [folders, setFolders] = useState<Record<string, Folder>>(() => {
    if (typeof window === 'undefined') {
        return {
          liked: { id: 'liked', name: 'Liked Ideas', ideas: [], subFolders: {} },
          trashed: { id: 'trashed', name: 'Trashed Ideas', ideas: [], subFolders: {} },
        };
    }
    try {
      const savedFolders = localStorage.getItem('idea-swipe-folders');
      if (savedFolders) {
        return JSON.parse(savedFolders);
      }
    } catch (error) {
      console.error("Could not load folders from localStorage", error);
    }
    return {
      liked: { id: 'liked', name: 'Liked Ideas', ideas: [], subFolders: {} },
      trashed: { id: 'trashed', name: 'Trashed Ideas', ideas: [], subFolders: {} },
    };
  });

  const [view, setView] = useState<View>({ type: 'swipe' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      // Default to true unless explicitly set to 'false'
      return localStorage.getItem('idea-swipe-dev-mode') !== 'false';
    } catch {
      return true; // Also default to true if localStorage is inaccessible
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });


  useEffect(() => {
    try {
      localStorage.setItem('idea-swipe-folders', JSON.stringify(folders));
    } catch (error) {
      console.error("Could not save folders to localStorage", error);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem('idea-swipe-dev-mode', String(isDevMode));
    } catch (error) {
      console.error("Could not save dev mode setting to localStorage", error);
    }
  }, [isDevMode]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);


  const getFolderByPath = (path: string[]): Folder | null => {
    let current: Folder | undefined = folders[path[0]];
    if (!current) return null;
    for (let i = 1; i < path.length; i++) {
        current = current.subFolders[path[i]];
        if (!current) return null;
    }
    return current;
  };

  const handleSwipe = useCallback((idea: Idea, direction: 'right' | 'left', likeTargetFolderPath?: string[]) => {
    const destPath = direction === 'right' 
        ? (likeTargetFolderPath && likeTargetFolderPath.length > 0 ? likeTargetFolderPath : ['liked']) 
        : ['trashed'];

    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));
        
        const getFolderMutable = (path: string[], folderTree: Record<string, Folder>): Folder | null => {
            let current: Folder | undefined = folderTree[path[0]];
            if (!current) return null;
            for (let i = 1; i < path.length; i++) {
                current = current.subFolders[path[i]];
                if (!current) return null;
            }
            return current;
        }

        const destFolder = getFolderMutable(destPath, newFolders);
        if (!destFolder) {
            console.error("Could not find destination folder for swipe.", destPath);
            return prevFolders;
        }

        if (!destFolder.ideas.some((i: Idea) => i.id === idea.id)) {
            destFolder.ideas.unshift(idea);
        }
      
        return newFolders;
    });
  }, []);


  const moveIdea = useCallback((ideaIdToMove: string, sourcePath: string[], destPath: string[]) => {
    if (JSON.stringify(sourcePath) === JSON.stringify(destPath)) return;
    
    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));
        
        const getFolderMutable = (path: string[], folderTree: Record<string, Folder>): Folder | null => {
            let current: Folder | undefined = folderTree[path[0]];
            if (!current) return null;
            for (let i = 1; i < path.length; i++) {
                current = current.subFolders[path[i]];
                if (!current) return null;
            }
            return current;
        }

        const sourceFolder = getFolderMutable(sourcePath, newFolders);
        const destFolder = getFolderMutable(destPath, newFolders);

        if (!sourceFolder || !destFolder) {
            console.error("Could not find source or destination folder for moving idea.");
            return prevFolders;
        }
        
        const ideaIndex = sourceFolder.ideas.findIndex(idea => idea.id === ideaIdToMove);

        if (ideaIndex === -1) {
            console.error("Could not find idea to move");
            return prevFolders;
        }

        const [ideaToMove] = sourceFolder.ideas.splice(ideaIndex, 1);

        if (!destFolder.ideas.some(idea => idea.id === ideaIdToMove)) {
            destFolder.ideas.unshift(ideaToMove);
        }
        
        return newFolders;
    });
  }, []);
  
  const handleTournamentWin = useCallback((winnerIdea: Idea, sourcePath: string[]) => {
    setFolders(prevFolders => {
      const newFolders = JSON.parse(JSON.stringify(prevFolders));

      // 1. Ensure 'winners' folder exists with a static ID
      if (!newFolders['winners']) {
        newFolders['winners'] = {
          id: 'winners',
          name: 'Winners',
          ideas: [],
          subFolders: {},
          theme: 'Tournament Champions',
        };
      }

      // 2. Move idea logic (adapted from moveIdea)
      const getFolderMutable = (path: string[], folderTree: Record<string, Folder>): Folder | null => {
          let current: Folder | undefined = folderTree[path[0]];
          if (!current) return null;
          for (let i = 1; i < path.length; i++) {
              current = current.subFolders[path[i]];
              if (!current) return null;
          }
          return current;
      }
      
      const sourceFolder = getFolderMutable(sourcePath, newFolders);
      const destFolder = getFolderMutable(['winners'], newFolders);

      if (!sourceFolder || !destFolder) {
        console.error("Could not find source or destination folder for winner.");
        return prevFolders;
      }

      const ideaIndex = sourceFolder.ideas.findIndex(idea => idea.id === winnerIdea.id);
      if (ideaIndex === -1) {
        console.error("Could not find winning idea to move.");
        return prevFolders;
      }
      
      const [ideaToMove] = sourceFolder.ideas.splice(ideaIndex, 1);

      if (!destFolder.ideas.some(idea => idea.id === winnerIdea.id)) {
        destFolder.ideas.unshift(ideaToMove);
      }

      return newFolders;
    });
  }, []);

  const handleReviewSwipe = useCallback((idea: Idea, sourcePath: string[], direction: 'right' | 'left') => {
    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));

        const getFolderMutable = (path: string[], folderTree: Record<string, Folder>): Folder | null => {
            let current: Folder | undefined = folderTree[path[0]];
            if (!current) return null;
            for (let i = 1; i < path.length; i++) {
                current = current.subFolders[path[i]];
                if (!current) return null;
            }
            return current;
        };

        const sourceFolder = getFolderMutable(sourcePath, newFolders);
        if (!sourceFolder) {
            console.error("Source folder not found for review swipe");
            return prevFolders;
        }

        let destPath: string[];
        if (direction === 'left') {
            destPath = ['trashed'];
        } else {
            const likedSubfolderName = `Liked ${sourceFolder.name} Ideas`;
            let destSubFolderId: string | null = null;
            for (const subFolderId in sourceFolder.subFolders) {
                if (sourceFolder.subFolders[subFolderId].name === likedSubfolderName) {
                    destSubFolderId = subFolderId;
                    break;
                }
            }
            if (!destSubFolderId) {
                const newFolderId = crypto.randomUUID();
                sourceFolder.subFolders[newFolderId] = {
                    id: newFolderId,
                    name: likedSubfolderName,
                    ideas: [],
                    subFolders: {},
                    theme: '',
                };
                destSubFolderId = newFolderId;
            }
            destPath = [...sourcePath, destSubFolderId];
        }
        
        const destFolder = getFolderMutable(destPath, newFolders);
        if (!destFolder) {
            console.error("Destination folder not found for review swipe");
            return prevFolders;
        }

        const ideaToMove = sourceFolder.ideas.find(i => i.id === idea.id);
        if (!ideaToMove) {
            console.error("Idea to move not found in source folder");
            return prevFolders;
        }

        sourceFolder.ideas = sourceFolder.ideas.filter(i => i.id !== idea.id);
        if (!destFolder.ideas.some(i => i.id === idea.id)) {
            destFolder.ideas.unshift(ideaToMove);
        }

        // Cleanup: If source folder is now empty, move ideas from "Liked" subfolder up and delete it.
        if (sourceFolder.ideas.length === 0) {
            const likedSubfolderName = `Liked ${sourceFolder.name} Ideas`;
            let subfolderIdToDelete: string | null = null;
            let likedSubFolder: Folder | null = null;

            for (const subId in sourceFolder.subFolders) {
                if (sourceFolder.subFolders[subId].name === likedSubfolderName) {
                    subfolderIdToDelete = subId;
                    likedSubFolder = sourceFolder.subFolders[subId];
                    break;
                }
            }
            
            if (subfolderIdToDelete && likedSubFolder && likedSubFolder.ideas.length > 0) {
                sourceFolder.ideas = likedSubFolder.ideas;
                delete sourceFolder.subFolders[subfolderIdToDelete];
            }
        }

        return newFolders;
    });
}, []);

  const createFolder = useCallback((parentPath: string[], name: string, theme: string) => {
    const newFolderId = crypto.randomUUID();
    const newFolder: Folder = {
      id: newFolderId,
      name,
      ideas: [],
      subFolders: {},
      theme,
    };

    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));
        
        if (parentPath.length === 0) {
            newFolders[newFolderId] = newFolder;
        } else {
            let parent = newFolders[parentPath[0]];
            if (!parent) return prevFolders;
            for(let i = 1; i < parentPath.length; i++) {
                parent = parent.subFolders[parentPath[i]];
                if (!parent) return prevFolders;
            }
            parent.subFolders[newFolderId] = newFolder;
        }
        
        return newFolders;
    });
  }, []);

  const deleteIdeaForever = useCallback((folderPath: string[], ideaId: string) => {
    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));
        let current: Folder | undefined = newFolders[folderPath[0]];
        if (!current) return prevFolders;

        for (let i = 1; i < folderPath.length; i++) {
            current = current.subFolders[folderPath[i]];
            if (!current) return prevFolders;
        }
        
        current.ideas = current.ideas.filter(idea => idea.id !== ideaId);
        return newFolders;
    });
  }, []);

  const updateIdea = useCallback((path: string[], ideaId: string, updatedIdeaData: Partial<Idea>) => {
    setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders));
        
        const getFolderMutable = (p: string[], folderTree: Record<string, Folder>): Folder | null => {
            let current: Folder | undefined = folderTree[p[0]];
            if (!current) return null;
            for (let i = 1; i < p.length; i++) {
                current = current.subFolders[p[i]];
                if (!current) return null;
            }
            return current;
        }

        const folder = getFolderMutable(path, newFolders);

        if (!folder) {
            console.error("Could not find folder to update idea.");
            return prevFolders;
        }

        const ideaIndex = folder.ideas.findIndex(idea => idea.id === ideaId);
        if (ideaIndex > -1) {
            folder.ideas[ideaIndex] = { ...folder.ideas[ideaIndex], ...updatedIdeaData };
        }
        
        return newFolders;
    });
  }, []);


  const renderContent = () => {
    if (view.type === 'swipe') {
      return <SwipeScreen 
        onSwipe={(idea, dir) => handleSwipe(idea, dir, view.likeTargetFolderPath)}
        parentIdea={view.parentIdea} 
        setView={setView} 
        likedIdeas={folders.liked.ideas} 
        contextIdeas={view.contextIdeas}
        theme={view.theme}
        isDevMode={isDevMode}
      />;
    }
    if (view.type === 'review-swipe') {
      const folder = getFolderByPath(view.path);
      if (folder) {
        return <SwipeScreen 
          setView={setView}
          initialIdeas={folder.ideas}
          onSwipe={(idea, dir) => handleReviewSwipe(idea, view.path, dir)}
          folderName={folder.name}
          folderPath={view.path}
        />
      }
    }
    if (view.type === 'folders') {
      const folder = getFolderByPath(view.path);
      if (folder) {
        return <FolderView folder={folder} path={view.path} setView={setView} createFolder={createFolder} deleteIdeaForever={deleteIdeaForever} />;
      }
      return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Folder not found.</div>;
    }
    if (view.type === 'idea-detail') {
        const folder = getFolderByPath(view.path);
        const idea = folder?.ideas.find(i => i.id === view.ideaId);
        if (folder && idea) {
            return <IdeaDetailView 
                      idea={idea} 
                      path={view.path} 
                      setView={setView} 
                      updateIdea={updateIdea} 
                    />
        }
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Idea not found.</div>;
    }
    if (view.type === 'battle') {
        const folder = getFolderByPath(view.path);
        if (folder) {
            return <BattleArenaView 
                      initialIdeas={folder.ideas} 
                      folderName={folder.name}
                      path={view.path} 
                      setView={setView}
                      moveIdea={moveIdea}
                      handleTournamentWin={handleTournamentWin}
                    />
        }
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Folder not found for battle.</div>;
    }
    return null;
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-brand-950 font-sans overflow-hidden">
      <div onClick={() => setIsSidebarOpen(false)} className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}/>
      <Sidebar 
        folders={folders} 
        setView={setView} 
        currentView={view} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        moveIdea={moveIdea} 
        createFolder={createFolder}
        isDevMode={isDevMode}
        setIsDevMode={setIsDevMode}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="pt-2 pl-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-900" aria-label="Open sidebar">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default HomePage;
