

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateIdeas, InvalidApiKeyError } from '../services/geminiService';
import { Idea, View } from '../types';
import IdeaCard from './IdeaCard';
import { HeartIcon, XIcon, ArrowLeftIcon, LightbulbIcon } from './Icons';

interface SwipeScreenProps {
    onSwipe: (idea: Idea, direction: 'right' | 'left') => void;
    setView: (view: View) => void;

    // For 'swipe' mode (generating new ideas)
    parentIdea?: Idea | null;
    likedIdeas?: Idea[];
    contextIdeas?: Idea[];
    theme?: string;
    isDevMode?: boolean;

    // For 'review-swipe' mode
    initialIdeas?: Idea[];
    folderName?: string;
    folderPath?: string[];
}

const SwipeScreen: React.FC<SwipeScreenProps> = ({
    onSwipe,
    setView,
    parentIdea,
    likedIdeas,
    theme,
    isDevMode = false,
    initialIdeas,
    folderName,
    folderPath,
}) => {
    const [ideas, setIdeas] = useState<Idea[]>(() => initialIdeas ? [...initialIdeas] : []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [interactionState, setInteractionState] = useState<{
        status: 'idle' | 'dragging' | 'animating-out';
        startX: number;
        offsetX: number;
        direction?: 'left' | 'right';
    }>({
        status: 'idle',
        startX: 0,
        offsetX: 0,
    });


    const isReviewMode = !!initialIdeas;

    const loadIdeas = useCallback(async () => {
        if (isReviewMode || isLoading) return;

        setIsLoading(true);
        setError(null);
        try {
            const newIdeas = await generateIdeas(3, { parentIdea, likedIdeas, theme }, isDevMode);
            setIdeas(prev => [...prev, ...newIdeas]);
        } catch (err) {
            if (err instanceof InvalidApiKeyError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError("Failed to generate ideas. Please try again later.");
            } else {
                setError("An unknown error occurred.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isReviewMode, isLoading, parentIdea, likedIdeas, theme, isDevMode]);

    useEffect(() => {
        if (!isReviewMode && ideas.length === 0) {
            loadIdeas();
        }
    }, [isReviewMode, ideas.length, loadIdeas]);

    useEffect(() => {
        if (!isLoading && !isReviewMode && ideas.length > 0 && ideas.length - currentIndex < 3) {
            loadIdeas();
        }
    }, [ideas.length, currentIndex, loadIdeas, isLoading, isReviewMode]);

    const currentIdeas = useMemo(() => ideas.slice(currentIndex), [ideas, currentIndex]);
    
    const handleSwipe = useCallback((direction: 'right' | 'left') => {
        if (currentIndex >= ideas.length || interactionState.status === 'animating-out') return;
    
        const idea = ideas[currentIndex];
        if (idea) {
          // 1. Trigger animation
          setInteractionState(prev => ({ ...prev, status: 'animating-out', direction }));
    
          // 2. After animation, update state
          setTimeout(() => {
            onSwipe(idea, direction);
            setCurrentIndex(prev => prev + 1);
            setInteractionState({ status: 'idle', startX: 0, offsetX: 0 }); // Reset for the next card
          }, 150); // Animation duration
        }
    }, [currentIndex, ideas, onSwipe, interactionState.status]);

    const handleInteractionStart = useCallback((clientX: number) => {
        if (currentIdeas.length === 0 || interactionState.status !== 'idle') return;
        setInteractionState({ status: 'dragging', startX: clientX, offsetX: 0 });
    }, [currentIdeas.length, interactionState.status]);

    const handleInteractionMove = useCallback((clientX: number) => {
        if (interactionState.status !== 'dragging') return;
        setInteractionState(prev => ({ ...prev, offsetX: clientX - prev.startX }));
    }, [interactionState.status]);

    const handleInteractionEnd = useCallback(() => {
        if (interactionState.status !== 'dragging') return;
        
        const swipeThreshold = 100;
        if (interactionState.offsetX > swipeThreshold) {
            handleSwipe('right');
        } else if (interactionState.offsetX < -swipeThreshold) {
            handleSwipe('left');
        } else {
            // Animate back to center
            setInteractionState({ status: 'idle', startX: 0, offsetX: 0 });
        }
    }, [interactionState, handleSwipe]);
    
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleInteractionMove(e.touches[0].clientX);
        const onEnd = () => handleInteractionEnd();

        if (interactionState.status === 'dragging') {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [interactionState.status, handleInteractionMove, handleInteractionEnd]);

    const renderHeader = () => {
        if (isReviewMode && folderPath) {
            return (
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setView({ type: 'folders', path: folderPath })} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-2 rounded-md bg-white/50 dark:bg-brand-900/50 backdrop-blur-sm">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to {folderName || 'Folder'}
                    </button>
                </div>
            );
        }
        return null;
    }

    const renderMainContent = () => {
        if (isLoading && currentIdeas.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center">
                    <LightbulbIcon className="w-12 h-12 text-brand-500 animate-pulse mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generating awesome ideas...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please wait a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg max-w-md">
                    <h2 className="font-bold text-lg mb-2">An Error Occurred</h2>
                    <p>{error}</p>
                    {!isDevMode && error.includes("API key") && (
                        <p className="mt-2 text-sm text-red-300">Please check your API key is valid and has access to the Gemini API.</p>
                    )}
                     {!isReviewMode && <button onClick={loadIdeas} className="mt-4 bg-brand-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-500">
                        Try Again
                    </button>}
                </div>
            );
        }
    
        if (currentIdeas.length === 0) {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isReviewMode ? "All reviewed!" : "All out of ideas!"}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{isReviewMode ? `You've gone through all ideas in this folder.` : "Generate some more inspiration."}</p>
                    {isReviewMode && folderPath ? (
                        <button onClick={() => setView({ type: 'folders', path: folderPath })} className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-500 transition-colors flex items-center gap-2 mx-auto">
                           <ArrowLeftIcon className="w-5 h-5"/> Back to Folder
                        </button>
                    ) : (
                        <button onClick={loadIdeas} className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-500 transition-colors flex items-center gap-2 mx-auto">
                            <LightbulbIcon className="w-5 h-5"/> Generate More
                        </button>
                    )}
                </div>
            );
        }

        return (
            <>
                <div className="w-full max-w-sm h-[500px] sm:max-w-md sm:h-[550px] relative">
                    {currentIdeas.slice(0, 3).reverse().map((idea, reversedIndex) => {
                        const index = currentIdeas.slice(0, 3).length - 1 - reversedIndex;
                        const isTop = index === 0;
        
                        const getCardStyle = (): React.CSSProperties => {
                            const style: React.CSSProperties = {
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                zIndex: currentIdeas.length - index,
                                transform: `translateY(${index * 10}px) scale(${1 - index * 0.05})`,
                                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
                                cursor: isTop ? 'grab' : 'auto',
                                opacity: index < 2 ? 1 : 0, // Show top 2 cards, hide others
                            };

                            if (isTop) {
                                switch (interactionState.status) {
                                case 'dragging': {
                                    const rotation = interactionState.offsetX / 20;
                                    const FADE_START_OFFSET = 80; // Start fading after 80px
                                    const FADE_END_OFFSET = 400; // Fully faded at 400px
                                    const dragDistance = Math.abs(interactionState.offsetX);
                                    let opacity = 1;
                                    if (dragDistance > FADE_START_OFFSET) {
                                        const fadeProgress = Math.min(
                                            (dragDistance - FADE_START_OFFSET) / (FADE_END_OFFSET - FADE_START_OFFSET),
                                            1
                                        );
                                        opacity = 1 - fadeProgress;
                                    }
                                    style.transform = `translateX(${interactionState.offsetX}px) rotate(${rotation}deg)`;
                                    style.transition = 'none';
                                    style.opacity = opacity;
                                    break;
                                }
                                case 'animating-out': {
                                    const exitX = interactionState.direction === 'right' ? '150%' : '-150%';
                                    const exitRotation = (interactionState.offsetX / 20) || (interactionState.direction === 'right' ? 30 : -30);
                                    style.transform = `translateX(${exitX}) rotate(${exitRotation}deg)`;
                                    style.transition = `transform 0.15s ease-in, opacity 0.15s ease-in`;
                                    style.opacity = 0;
                                    break;
                                }
                                case 'idle':
                                default:
                                    style.transform = 'translateY(0) scale(1)';
                                    style.opacity = 1;
                                    break;
                                }
                            }
                            
                            return style;
                        };
        
                        return (
                            <div
                                key={idea.id}
                                className={interactionState.status === 'dragging' && isTop ? 'cursor-grabbing' : ''}
                                style={getCardStyle()}
                                onMouseDown={isTop ? (e) => handleInteractionStart(e.clientX) : undefined}
                                onTouchStart={isTop ? (e) => handleInteractionStart(e.touches[0].clientX) : undefined}
                            >
                                <IdeaCard
                                  idea={idea}
                                  isTop={isTop}
                                  swipeOffset={isTop ? interactionState.offsetX : 0}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-8">
                    <button onClick={() => handleSwipe('left')} className="w-20 h-20 rounded-full bg-white dark:bg-brand-900 border-2 border-gray-200 dark:border-brand-800 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all transform hover:scale-110" aria-label="Dislike">
                        <XIcon className="w-10 h-10" />
                    </button>
                    <button onClick={() => handleSwipe('right')} className="w-20 h-20 rounded-full bg-white dark:bg-brand-900 border-2 border-gray-200 dark:border-brand-800 flex items-center justify-center text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/50 transition-all transform hover:scale-110" aria-label="Like">
                        <HeartIcon className="w-10 h-10" />
                    </button>
                </div>
            </>
        )
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-8 relative overflow-hidden">
            {renderHeader()}
            {renderMainContent()}
        </div>
    );
};

export default SwipeScreen;