import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Idea, View } from '../types';
import { ArrowLeftIcon, SwordsIcon } from './Icons';
import { BattleIdeaCard } from './BattleIdeaCard';

interface BattleArenaViewProps {
  initialIdeas: Idea[];
  folderName: string;
  path: string[];
  setView: (view: View) => void;
  moveIdea: (ideaId: string, sourcePath: string[], destPath: string[]) => void;
  handleTournamentWin: (winnerIdea: Idea, sourcePath: string[]) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const createBracket = (ideas: Idea[]): (Idea | null)[][] => {
    const rounds: (Idea | null)[][] = [];
    let currentParticipants: (Idea | null)[] = shuffleArray(ideas);

    while (currentParticipants.length > 1) {
        if (currentParticipants.length % 2 !== 0) {
            currentParticipants.push(null);
        }
        rounds.push([...currentParticipants]);
        const nextParticipants: (Idea | null)[] = Array(currentParticipants.length / 2).fill(null);
        currentParticipants = nextParticipants;
    }

    rounds.push([null]); // Final winner slot
    return rounds;
};

export const BattleArenaView: React.FC<BattleArenaViewProps> = ({ initialIdeas, folderName, path, setView, moveIdea, handleTournamentWin }) => {
    const [rounds, setRounds] = useState(() => createBracket(initialIdeas));
    const [currentMatch, setCurrentMatch] = useState<{ round: number; match: number }>({ round: 0, match: 0 });
    const [winner, setWinner] = useState<Idea | null>(null);

    const bracketContainerRef = useRef<HTMLDivElement>(null);
    const activeMatchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
          activeMatchRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }, 100);
    
        return () => clearTimeout(timer);
    }, [currentMatch]);

    const advanceTournament = useCallback((startRounds: (Idea | null)[][], startMatch: { round: number; match: number }) => {
        let currentRounds = startRounds.map(r => [...r]);
        let { round, match } = startMatch;

        while (round < currentRounds.length - 1) {
            // If we've processed all matches in this round, move to the next round
            if (match >= currentRounds[round].length / 2) {
                round++;
                match = 0;
                continue;
            }

            const matchPairIndex = match * 2;
            const contestant1 = currentRounds[round][matchPairIndex];
            const contestant2 = currentRounds[round][matchPairIndex + 1];

            // Case 1: A playable match is found (two contestants)
            if (contestant1 && contestant2) {
                setRounds(currentRounds);
                setCurrentMatch({ round, match });
                return;
            }

            // Case 2: A bye is found (one contestant, one null)
            const isBye = (contestant1 && !contestant2) || (!contestant1 && contestant2);
            if (isBye) {
                const byeWinner = contestant1 || contestant2;
                const nextRoundIndex = round + 1;
                const nextMatchIndexInNextRound = match;

                if (byeWinner && currentRounds[nextRoundIndex]) {
                    currentRounds[nextRoundIndex][nextMatchIndexInNextRound] = byeWinner;
                }
                
                // Move to the next match in the same round and continue the loop to resolve more byes
                match++;
                continue;
            }
            
            // Case 3: A double bye (both null). Just move on.
            match++;
        }
    
        // If the loop completes, all remaining matches were byes and have been resolved.
        // We need to check if we have a final winner.
        const finalWinner = currentRounds[currentRounds.length - 1][0];
        if (finalWinner) {
            setWinner(finalWinner);
            handleTournamentWin(finalWinner, path);
        } else {
            setRounds(currentRounds);
            setCurrentMatch({ round, match });
        }
    }, [handleTournamentWin, path]);

    useEffect(() => {
        advanceTournament(rounds, { round: 0, match: 0 });
    }, []);

    const handleSelectWinner = (selectedWinner: Idea) => {
        const { round, match } = currentMatch;
        if (winner) return;
        
        const matchPairIndex = match * 2;
        const contestant1 = rounds[round]?.[matchPairIndex];
        const contestant2 = rounds[round]?.[matchPairIndex + 1];

        if (!contestant1 || !contestant2) return;

        const loser = contestant1.id === selectedWinner.id ? contestant2 : contestant1;
        moveIdea(loser.id, path, ['trashed']);
        
        const newRounds = rounds.map(r => [...r]);
        
        if (newRounds[round + 1]) {
            newRounds[round + 1][match] = selectedWinner;
        }

        const isLastMatchInRound = match >= newRounds[round].length / 2 - 1;
        const nextMatch = isLastMatchInRound
            ? { round: round + 1, match: 0 }
            : { round, match: match + 1 };
        
        advanceTournament(newRounds, nextMatch);
    };

    const currentContestants = useMemo(() => {
        if (!rounds.length || winner) return [null, null];
        const { round, match } = currentMatch;
        if (round >= rounds.length -1 || !rounds[round] || match >= rounds[round].length / 2) return [null, null];
        const matchPairIndex = match * 2;
        return [rounds[round][matchPairIndex], rounds[round][matchPairIndex + 1]];
    }, [rounds, currentMatch, winner]);
    
    if (winner) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900 animate-fade-in-up">
                <h1 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Tournament Winner</h1>
                <h2 className="text-4xl font-bold text-white mt-2 mb-8">Congratulations!</h2>
                <div className="w-full max-w-sm">
                    <BattleIdeaCard idea={winner} onClick={() => setView({type:'idea-detail', path: ['winners'], ideaId: winner.id })} />
                </div>
                <button onClick={() => setView({ type: 'folders', path })} className="mt-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Folder
                </button>
            </div>
        );
    }

    if (rounds.length > 0 && (currentContestants[0] === null || currentContestants[1] === null) && !winner) {
         return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/50 p-4">
                <div className="text-center">
                     <p className="text-2xl text-gray-400 animate-pulse">Finding next match...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in-up">
            <style>{`
                .bracket-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .bracket-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .bracket-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 4px; }
                .bracket-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
                
                .bracket-connector { position: relative; width: 1.5rem; }
                .bracket-line { position: absolute; left: 0; top: 50%; width: 100%; height: 2px; background-color: #374151; transform: translateY(-50%); }
                .bracket-arm { position: absolute; right: 0; width: 2px; background-color: #374151; }
            `}</style>
             <div className="p-4 sm:p-6 border-b border-gray-800 bg-gray-900/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Battle Arena</h1>
                        <p className="text-sm text-gray-400">Choosing the best idea from <span className="font-semibold text-purple-300">{folderName}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView({ type: 'folders', path })} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800">
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Folder</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
                {/* Bracket Column */}
                <div ref={bracketContainerRef} className="flex flex-col lg:w-7/12 flex-1 overflow-auto bg-gray-900 p-6 bracket-scrollbar">
                    <div className="flex justify-start items-center min-h-full gap-8">
                        {rounds.map((round, roundIndex) => (
                            <div key={roundIndex} className="flex flex-col h-full" style={{ justifyContent: 'space-around' }}>
                                {Array.from({ length: round.length / 2 }).map((_, matchIndex) => {
                                    const p1 = round[matchIndex * 2];
                                    const p2 = round[matchIndex * 2 + 1];
                                    const winnerOfThisMatch = rounds[roundIndex + 1]?.[matchIndex];
                                    const isCurrentActiveMatch = currentMatch.round === roundIndex && currentMatch.match === matchIndex && !winner;

                                    const getParticipantClass = (p: Idea | null) => {
                                        let classes = 'p-2 w-48 text-sm rounded border truncate transition-all ';
                                        if (!p) return classes + 'bg-gray-800/50 border-gray-700/50 text-gray-500';
                                        if (winnerOfThisMatch && p.id !== winnerOfThisMatch.id) classes += 'opacity-50 bg-gray-800 border-gray-700 ';
                                        else classes += 'bg-gray-800 border-gray-700 text-gray-300 ';
                                        if (isCurrentActiveMatch) classes += 'border-indigo-500 ring-2 ring-indigo-500/50 ';
                                        return classes;
                                    };
                                    
                                    const connectorHeight = `${(100 / (rounds[roundIndex-1]?.length / 2 || 1) - (100 / (round.length/2) || 0) ) / 2 * 100}%`;

                                    return (
                                        <div key={matchIndex} ref={isCurrentActiveMatch ? activeMatchRef : null} className="flex items-center relative">
                                            <div className="flex flex-col gap-2">
                                                <div className={getParticipantClass(p1)}>{p1?.name || '...'}</div>
                                                <div className={getParticipantClass(p2)}>{p2?.name || '...'}</div>
                                            </div>
                                            {roundIndex < rounds.length - 1 && (
                                                <div className="bracket-connector" style={{height: 'calc(2.5rem + 0.5rem)'}}>
                                                    <div className="bracket-arm" style={{ top: 0, height: '50%'}}></div>
                                                    <div className="bracket-line"></div>
                                                    <div className="bracket-arm" style={{ bottom: 0, height: '50%'}}></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>


                {/* Matchup Column */}
                <div className="flex flex-1 lg:w-5/12 flex-col items-center justify-center p-4 sm:p-6 bg-gray-800/50 overflow-y-auto border-t border-gray-800 lg:border-t-0 lg:border-l">
                    <div className="w-full max-w-md mx-auto">
                        <h2 className="text-center text-2xl font-bold mb-1">Choose an Idea</h2>
                        <p className="text-center text-gray-400 mb-4">Round {currentMatch.round + 1} / {rounds.length - 1} &middot; Match {currentMatch.match + 1}</p>
                        <div className="flex flex-col gap-4 items-stretch">
                           {currentContestants[0] && <BattleIdeaCard idea={currentContestants[0]} onClick={() => handleSelectWinner(currentContestants[0]!)} />}
                           {currentContestants[1] && <BattleIdeaCard idea={currentContestants[1]} onClick={() => handleSelectWinner(currentContestants[1]!)} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};