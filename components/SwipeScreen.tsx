import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Idea } from '../types';
import IdeaCard from './IdeaCard';
import { HeartIcon, XIcon } from './Icons';

interface SwipeScreenProps {
  ideas: Idea[];
  onLike: (idea: Idea) => void;
  onDislike: (idea: Idea) => void;
  isLoading: boolean;
  loadMoreIdeas: () => void;
}

const SwipeScreen: React.FC<SwipeScreenProps> = ({ ideas, onLike, onDislike, isLoading, loadMoreIdeas }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitClass, setExitClass] = useState('');
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, offsetX: 0 });

  useEffect(() => {
    // When ideas array changes (e.g. from empty to filled), reset index
    if (ideas.length > 0 && currentIndex > ideas.length -1) {
      setCurrentIndex(0);
    }
  }, [ideas, currentIndex]);
  
  useEffect(() => {
    if (!isLoading && ideas.length > 0 && ideas.length - currentIndex < 5) {
      loadMoreIdeas();
    }
  }, [ideas.length, currentIndex, loadMoreIdeas, isLoading]);

  const currentIdeas = useMemo(() => ideas.slice(currentIndex), [ideas, currentIndex]);

  const handleSwipe = useCallback((action: 'like' | 'dislike') => {
    if (currentIndex >= ideas.length || exitClass) return;
    
    setExitClass(action === 'like' ? 'exit-right' : 'exit-left');

    setTimeout(() => {
        const idea = ideas[currentIndex];
        if (action === 'like') {
          onLike(idea);
        } else {
          onDislike(idea);
        }
        setCurrentIndex(prev => prev + 1);
        setExitClass('');
    }, 300); // match CSS animation duration
  }, [currentIndex, ideas, exitClass, onLike, onDislike]);

  // Drag handlers
  const handleInteractionStart = useCallback((clientX: number) => {
    if (exitClass) return;
    setDragState({ isDragging: true, startX: clientX, offsetX: 0 });
  }, [exitClass]);

  const handleInteractionMove = useCallback((clientX: number) => {
    if (!dragState.isDragging) return;
    setDragState(prev => ({ ...prev, offsetX: clientX - prev.startX }));
  }, [dragState.isDragging]);

  const handleInteractionEnd = useCallback(() => {
    if (!dragState.isDragging) return;
    
    const swipeThreshold = 100; // swipe if dragged 100px
    if (dragState.offsetX > swipeThreshold) {
      handleSwipe('like');
    } else if (dragState.offsetX < -swipeThreshold) {
      handleSwipe('dislike');
    }
    
    setDragState({ isDragging: false, startX: 0, offsetX: 0 });
  }, [dragState, handleSwipe]);
  
  // Add window event listeners for move/end to handle dragging outside the card
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleInteractionMove(e.touches[0].clientX);
    const onEnd = () => handleInteractionEnd();

    if (dragState.isDragging) {
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
  }, [dragState.isDragging, handleInteractionMove, handleInteractionEnd]);
  
  if (isLoading && currentIdeas.length === 0) {
    return <div className="loading-spinner"><div></div><div></div><div></div></div>;
  }

  if (currentIdeas.length === 0) {
    return (
      <div className="empty-state">
        <h2>All out of ideas!</h2>
        <p>Come back later for a fresh batch of inspiration.</p>
        <button onClick={loadMoreIdeas} className="button primary">Generate More</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .swipe-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 2rem;
          overflow: hidden;
        }
        .card-stack {
          position: relative;
          width: 100%;
          max-width: 500px;
          height: 600px;
        }
        .card-wrapper {
            position: absolute;
            width: 100%;
            height: 100%;
            cursor: grab;
        }
        .card-wrapper.is-dragging {
            cursor: grabbing;
        }
        .card-wrapper.exit-right { transform: translateX(100vw) rotate(15deg) !important; transition: transform 0.3s ease-out; }
        .card-wrapper.exit-left { transform: translateX(-100vw) rotate(-15deg) !important; transition: transform 0.3s ease-out; }

        .swipe-actions {
          display: flex;
          gap: 2rem;
        }
        .action-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          background-color: transparent;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.2s;
        }
        .action-button svg { width: 36px; height: 36px; }
        .action-button.dislike {
          color: #f06565;
          border-color: #f06565;
        }
        .action-button.like {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }
        .action-button:hover {
            transform: scale(1.1);
        }
        .action-button.dislike:hover {
          background-color: rgba(240, 101, 101, 0.1);
        }
        .action-button.like:hover {
          background-color: rgba(52, 211, 153, 0.1);
        }
      `}</style>
      <div className="swipe-screen">
        <div className="card-stack">
          {currentIdeas.slice(0, 3).reverse().map((idea, index) => {
            const isTop = index === currentIdeas.slice(0, 3).length - 1;
            
            const getCardStyle = (): React.CSSProperties => {
              const stackTransform = `translateY(${-index * 10}px) scale(${1 - index * 0.05})`;
              const style: React.CSSProperties = {
                zIndex: currentIdeas.length - index,
                transform: stackTransform,
                opacity: 1 - index * 0.2,
                transition: 'transform 0.3s ease-out',
              };
              
              if (isTop) {
                  if (dragState.isDragging) {
                      const rotation = dragState.offsetX / 20;
                      style.transform = `translateX(${dragState.offsetX}px) rotate(${rotation}deg) ${stackTransform}`;
                      style.transition = 'none';
                  }
              }
              return style;
            };

            return (
              <div
                key={idea.id}
                className={`card-wrapper ${isTop ? exitClass : ''} ${isTop && dragState.isDragging ? 'is-dragging' : ''}`}
                onMouseDown={isTop ? (e) => handleInteractionStart(e.clientX) : undefined}
                onTouchStart={isTop ? (e) => handleInteractionStart(e.touches[0].clientX) : undefined}
                style={getCardStyle()}
              >
                <IdeaCard idea={idea} isTop={isTop} />
              </div>
            );
          })}
        </div>
        <div className="swipe-actions">
          <button onClick={() => handleSwipe('dislike')} className="action-button dislike">
            <XIcon />
          </button>
          <button onClick={() => handleSwipe('like')} className="action-button like">
            <HeartIcon />
          </button>
        </div>
      </div>
    </>
  );
};

export default SwipeScreen;