import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Idea } from '../types';
import { CheckCircleIcon } from './Icons';

interface IdeaCardProps {
  idea: Idea;
  onSwipe: (direction: 'right' | 'left') => void;
  isTop: boolean;
}

export interface IdeaCardRef {
    swipe: (direction: 'left' | 'right') => void;
}

const SWIPE_THRESHOLD = 120;

export const IdeaCard = forwardRef<IdeaCardRef, IdeaCardProps>(({ idea, onSwipe, isTop }, ref) => {
    const [dragState, setDragState] = useState({
        isDragging: false,
        startX: 0,
        x: 0,
    });
    const cardRef = useRef<HTMLDivElement>(null);

    const programmaticSwipe = useCallback((direction: 'left' | 'right') => {
        if (!isTop || !cardRef.current) return;
        
        cardRef.current.style.transition = 'transform 0.5s ease-out';
        const flyOutX = (direction === 'right' ? 1 : -1) * (window.innerWidth / 2 + 300);
        setDragState(prev => ({ ...prev, isDragging: false, x: flyOutX }));
        
        setTimeout(() => onSwipe(direction), 200);
    }, [isTop, onSwipe]);

    useImperativeHandle(ref, () => ({
        swipe: (direction: 'left' | 'right') => {
            programmaticSwipe(direction);
        }
    }));

    const handleDragStart = useCallback((clientX: number) => {
        if (!isTop) return;
        setDragState(prev => ({ ...prev, isDragging: true, startX: clientX, x: 0 }));
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
    }, [isTop]);

    const handleDragMove = useCallback((clientX: number) => {
        if (!dragState.isDragging || !isTop) return;
        const x = clientX - dragState.startX;
        setDragState(prev => ({ ...prev, x }));
    }, [dragState.isDragging, dragState.startX, isTop]);

    const handleDragEnd = useCallback(() => {
        if (!dragState.isDragging || !isTop) return;

        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.3s ease';
        }

        if (Math.abs(dragState.x) > SWIPE_THRESHOLD) {
            const direction = dragState.x > 0 ? 'right' : 'left';
            const flyOutX = (dragState.x > 0 ? 1 : -1) * (window.innerWidth / 2 + 300);
            setDragState(prev => ({...prev, isDragging: false, x: flyOutX }));
            setTimeout(() => onSwipe(direction), 100);
        } else {
            setDragState({ isDragging: false, startX: 0, x: 0 });
        }
    }, [dragState, onSwipe, isTop]);

    // Mouse events
    const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    const onMouseLeave = () => handleDragEnd();

    // Touch events
    const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const onTouchEnd = () => handleDragEnd();
    
    const rotation = dragState.x / 20;
    const opacity = Math.max(0, 1 - Math.abs(dragState.x) / (SWIPE_THRESHOLD * 2));
    const likeOpacity = dragState.x > 0 ? Math.min(1, dragState.x / SWIPE_THRESHOLD) : 0;
    const nopeOpacity = dragState.x < 0 ? Math.min(1, Math.abs(dragState.x) / SWIPE_THRESHOLD) : 0;

    return (
        <div
            ref={cardRef}
            className="absolute inset-0 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col cursor-grab select-none"
            style={{ 
                transform: `translateX(${dragState.x}px) rotate(${rotation}deg) scale(${isTop ? 1 : 0.95})`,
                zIndex: isTop ? 10 : 0,
                top: isTop ? 0 : '-10px',
                opacity: isTop ? 1 : 0.8
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 text-4xl font-bold border-2 rounded-lg px-4 py-2 transition-opacity" style={{ opacity: likeOpacity, color: '#34D399', borderColor: '#34D399' }}>LIKE</div>
                <div className="absolute top-2 left-2 text-4xl font-bold border-2 rounded-lg px-4 py-2 transition-opacity" style={{ opacity: nopeOpacity, color: '#F87171', borderColor: '#F87171' }}>NOPE</div>

                <div className="h-full overflow-y-auto pr-4" style={{ opacity }}>
                    <h2 className="text-2xl font-bold text-white mb-2">{idea.name}</h2>
                    <p className="text-gray-300 text-base leading-relaxed">{idea.description}</p>
                    <hr className="my-4 border-gray-700"/>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Features</h3>
                    <ul className="space-y-2 pb-4">
                        {idea.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});