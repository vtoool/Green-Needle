import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IdeaCard, IdeaCardRef } from './IdeaCard';
import { generateIdeas, InvalidApiKeyError } from '../services/geminiService';
import { Idea, View } from '../types';
import { HeartIcon, SparklesIcon, XIcon } from './Icons';

// Fix: Inlined the AIStudio type definition to resolve a TypeScript error about subsequent property declarations having conflicting types.
declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}

interface SwipeScreenProps {
  onSwipe: (idea: Idea, direction: 'right' | 'left') => void;
  setView: (view: View) => void;
  // For generation mode
  parentIdea?: Idea | null;
  likedIdeas?: Idea[];
  contextIdeas?: Idea[];
  theme?: string;
  isDevMode?: boolean;
  // For review mode
  initialIdeas?: Idea[];
  folderName?: string;
  folderPath?: string[];
}

const PREFETCH_THRESHOLD = 3;
const INITIAL_FETCH_COUNT = 5;
const BACKGROUND_FETCH_COUNT = 3;

export const SwipeScreen: React.FC<SwipeScreenProps> = ({ onSwipe, parentIdea, setView, likedIdeas, initialIdeas, folderName, folderPath, contextIdeas, theme, isDevMode }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFetchingInBackground, setIsFetchingInBackground] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyInvalid, setIsKeyInvalid] = useState(false);
  const topCardRef = useRef<IdeaCardRef>(null);
  const isInitialForContext = useRef(true);

  const likedIdeasRef = useRef(likedIdeas);
  useEffect(() => {
    likedIdeasRef.current = likedIdeas;
  }, [likedIdeas]);

  const isReviewMode = useMemo(() => initialIdeas !== undefined, [initialIdeas]);

  const fetchIdeas = useCallback(async (num: number) => {
    setError(null);
    setIsKeyInvalid(false);
    try {
      const currentParentIdea = isInitialForContext.current ? parentIdea : null;
      if (isInitialForContext.current) {
        isInitialForContext.current = false;
      }

      const ideasForPersonalization = parentIdea ? [] : (contextIdeas || likedIdeasRef.current);

      const newIdeas = await generateIdeas(
        num, 
        { 
          parentIdea: currentParentIdea,
          likedIdeas: ideasForPersonalization,
          theme: theme
        },
        isDevMode
      );

      setIdeas(prev => {
        if (newIdeas.length === 0 && prev.length === 0) {
          setError("Couldn't generate new ideas. Please try again.");
        }
        const existingIds = new Set(prev.map(i => i.id));
        const uniqueNewIdeas = newIdeas.filter(i => !existingIds.has(i.id));
        return [...prev, ...uniqueNewIdeas];
      });
    } catch (err) {
      if (err instanceof InvalidApiKeyError) {
        setIsKeyInvalid(true);
        setError(err.message);
      } else {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching ideas.";
        setError(errorMessage);
      }
    }
  }, [parentIdea, contextIdeas, theme, isDevMode]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        try {
            await window.aistudio.openSelectKey();
            // Assume key is now valid, clear the error state and retry
            setIsKeyInvalid(false);
            setError(null);
            setIsInitialLoading(true);
            fetchIdeas(INITIAL_FETCH_COUNT).finally(() => {
                setIsInitialLoading(false);
            });
        } catch (e) {
            setError("The API key selector was closed without selecting a key.");
        }
    } else {
        setError("This environment does not support the API key selector. Please refresh the page or check your setup.");
    }
  };

  // Effect to initialize or reset ideas when mode or context changes
  useEffect(() => {
    if (isReviewMode) {
      setIdeas(initialIdeas || []);
      setIsInitialLoading(false);
    } else {
      setIdeas([]);
      isInitialForContext.current = true;
      setIsInitialLoading(true);
      fetchIdeas(INITIAL_FETCH_COUNT).finally(() => {
        setIsInitialLoading(false);
      });
    }
    // This effect should only run when the generation context changes.
    // fetchIdeas is memoized against the context props, but we omit it here
    // to prevent re-runs from volatile props like likedIdeas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewMode, parentIdea, initialIdeas, contextIdeas, theme]);

  // Automatically fetch more ideas when the queue is empty in generation mode.
  useEffect(() => {
    if (ideas.length === 0 && !isReviewMode && !isInitialLoading && !isFetchingInBackground && !error) {
      setIsFetchingInBackground(true);
      fetchIdeas(BACKGROUND_FETCH_COUNT).finally(() => {
          setIsFetchingInBackground(false);
      });
    }
  }, [ideas.length, isReviewMode, isInitialLoading, isFetchingInBackground, error, fetchIdeas]);


  const activeIdeas = useMemo(() => ideas.slice(0, 2).reverse(), [ideas]);

  const handleSwipeInternal = useCallback((direction: 'right' | 'left') => {
    if (ideas.length === 0) return;
    const swipedIdea = ideas[0];
    onSwipe(swipedIdea, direction);
    
    setIdeas(currentIdeas => {
        const remainingIdeas = currentIdeas.slice(1);
        if (!isReviewMode && !isFetchingInBackground && remainingIdeas.length < PREFETCH_THRESHOLD) {
            setIsFetchingInBackground(true);
            fetchIdeas(BACKGROUND_FETCH_COUNT).finally(() => {
                setIsFetchingInBackground(false);
            });
        }
        return remainingIdeas;
    });
  }, [ideas.length, onSwipe, isReviewMode, isFetchingInBackground, fetchIdeas]);

  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
      if (!isInitialLoading && ideas.length > 0) {
          topCardRef.current?.swipe(direction);
      }
  }, [isInitialLoading, ideas.length]);

  const swipeHandlerRef = useRef(triggerSwipe);
  useEffect(() => {
    swipeHandlerRef.current = triggerSwipe;
  }, [triggerSwipe]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        swipeHandlerRef.current('right');
      } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        swipeHandlerRef.current('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); 

  const banner = useMemo(() => {
    let content = null;
    if (isReviewMode && folderName && folderPath) {
      content = (
        <>
          <p className="text-sm text-gray-400">
            Reviewing ideas from: <span className="font-semibold text-indigo-300">{folderName}</span>
          </p>
          <button onClick={() => setView({type: 'folders', path: folderPath})} className="text-xs text-indigo-400 hover:underline mt-1">
              Back to Folder
          </button>
        </>
      );
    } else if (parentIdea) {
      content = (
        <>
          <p className="text-sm text-gray-400">
            Generating ideas based on: <span className="font-semibold text-indigo-300">{parentIdea.name}</span>
          </p>
          <button onClick={() => setView({type: 'swipe'})} className="text-xs text-indigo-400 hover:underline mt-1">
            Start Fresh Session
          </button>
        </>
      );
    } else if (theme) {
        content = (
            <>
              <p className="text-sm text-gray-400">
                Generating ideas for theme: <span className="font-semibold text-indigo-300">{theme}</span>
              </p>
              <button onClick={() => setView({type: 'swipe'})} className="text-xs text-indigo-400 hover:underline mt-1">
                Start Fresh Session
              </button>
            </>
        );
    } else if (contextIdeas) {
      content = (
        <>
          <p className="text-sm text-gray-400">
            Generating ideas based on your collection's theme!
          </p>
          <button onClick={() => setView({type: 'swipe'})} className="text-xs text-indigo-400 hover:underline mt-1">
            Start Fresh Session
          </button>
        </>
      );
    }

    if (!content) {
      return null;
    }

    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-center max-w-2xl mx-auto mb-4">
        {content}
      </div>
    );
  }, [isReviewMode, folderName, folderPath, parentIdea, contextIdeas, setView, theme]);

  const renderCardContent = () => {
    if (isKeyInvalid) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-2xl text-center">
                <p className="font-semibold">API Key Invalid</p>
                <p className="text-sm mt-1 mb-4">{error}</p>
                <button 
                    onClick={handleSelectKey} 
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
                >
                    Select a New API Key
                </button>
                <p className="text-xs mt-3 text-gray-400">
                    Ensure your project has billing enabled. 
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                        Learn more
                    </a>
                </p>
            </div>
        );
    }

    if (isInitialLoading) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-2xl">
                <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
                <p className="mt-4 text-lg font-medium text-gray-300">Generating brilliant ideas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-2xl text-center">
                <p className="font-semibold">Something went wrong</p>
                <p className="text-sm mt-1">{error}</p>
                {!isReviewMode && (
                    <button 
                        onClick={() => { setIsInitialLoading(true); fetchIdeas(INITIAL_FETCH_COUNT).finally(() => setIsInitialLoading(false)) }} 
                        className="mt-4 px-4 py-2 bg-red-500/50 rounded-lg font-semibold hover:bg-red-500/70 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }
    
    if (ideas.length === 0) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                {isReviewMode ? (
                    <>
                        <p className="text-lg font-medium text-gray-400">You've reviewed all ideas in this folder!</p>
                        {folderPath && (
                            <button 
                                onClick={() => setView({type: 'folders', path: folderPath})} 
                                className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
                            >
                                Back to Folder
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
                        <p className="mt-4 text-lg font-medium text-gray-300">Generating more ideas...</p>
                    </div>
                )}
            </div>
        );
    }

    return activeIdeas.map((idea, index) => {
        const isTopCard = index === activeIdeas.length - 1;
        return (
            <IdeaCard
                ref={isTopCard ? topCardRef : null}
                key={idea.id}
                idea={idea}
                onSwipe={handleSwipeInternal}
                isTop={isTopCard}
            />
        );
    });
  };

  return (
      <div className="flex-1 flex flex-col bg-gray-800/50 p-4 overflow-hidden">
        {banner}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="relative w-full max-w-sm h-[500px]">
            {renderCardContent()}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
                <button 
                  onClick={() => triggerSwipe('left')} 
                  className="w-16 h-16 rounded-full bg-gray-800/80 border-2 border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-all duration-200 transform hover:scale-110"
                  aria-label="Trash idea"
                >
                    <XIcon className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => triggerSwipe('right')} 
                  className="w-20 h-20 rounded-full bg-gray-800/80 border-2 border-gray-700 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/50 transition-all duration-200 transform hover:scale-110"
                  aria-label="Like idea"
                >
                    <HeartIcon className="w-10 h-10" />
                </button>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-4 select-none">
                <span className="flex items-center gap-1.5"><kbd className="font-sans px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-700 rounded-md">A</kbd> or <kbd className="font-sans px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-700 rounded-md">←</kbd></span>
                <span className="flex items-center gap-1.5"><kbd className="font-sans px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-700 rounded-md">D</kbd> or <kbd className="font-sans px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-700 rounded-md">→</kbd></span>
            </div>
        </div>
      </div>
  );
};