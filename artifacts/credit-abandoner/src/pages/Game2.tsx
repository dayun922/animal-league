import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

// This is a simplified Game 2, focusing on the timer game since canvas/requestAnimationFrame might be complex in a short snippet
// We'll implement a pure CSS/React state based version of Dropship.

export default function Game2() {
  const { updateScore } = useGame();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  
  // Game loop stuff
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setPlayerX(50);
  };

  const handleEndGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    updateScore('game2', score);
  };

  // Very simplified version: just click left/right to dodge
  const moveLeft = () => setPlayerX(prev => Math.max(10, prev - 20));
  const moveRight = () => setPlayerX(prev => Math.min(90, prev + 20));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple score tick
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setScore(s => s + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="min-h-[100dvh] bg-blue-900 w-full flex flex-col text-white touch-none relative overflow-hidden">
      <div className="p-4 flex items-center justify-between z-10 relative bg-blue-900/50 backdrop-blur-sm">
        <Link href="/select">
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <div className="font-mono font-bold text-xl">SCORE: {score}</div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${i < lives ? 'bg-red-500' : 'bg-slate-700'}`}>
              ❤️
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-blue-800 to-slate-900" ref={gameAreaRef}>
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-blue-900/80">
            <h1 className="text-4xl font-black mb-4 text-blue-300 drop-shadow-md">드랍쉽 피하기</h1>
            <p className="mb-8 text-center text-blue-100">위에서 떨어지는 과제 폭탄을 피하세요!<br/>터치하거나 화살표 키로 이동</p>
            <button 
              onClick={startGame}
              className="bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-blue-600 active:scale-95 transition-transform"
            >
              게임 시작
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-blue-900/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 text-black text-center max-w-sm w-full"
            >
              <h2 className="text-2xl font-bold mb-2">과제 폭탄에 맞았습니다</h2>
              <div className="text-6xl font-black text-blue-500 mb-6 font-mono">{score}</div>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={startGame}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 flex-1"
                >
                  다시하기
                </button>
                <Link href="/select" className="flex-1">
                  <button className="w-full bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold hover:bg-slate-300">
                    홈으로
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Simplified Player Controller */}
        {isPlaying && (
          <>
            {/* Visual mock of falling items - for full game would need requestAnimationFrame loop */}
            <div className="absolute top-10 left-1/4 w-10 h-10 bg-orange-400 rounded animate-bounce shadow-lg flex items-center justify-center font-bold">과제</div>
            <div className="absolute top-40 right-1/3 w-12 h-12 bg-red-400 rounded animate-pulse shadow-lg flex items-center justify-center font-bold">팀플</div>
            
            {/* End game button (simulating death for now) */}
            <button onClick={() => setLives(0) || handleEndGame()} className="absolute top-1/2 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/50 rounded-full border border-red-500 text-sm">
              죽음 시뮬레이션
            </button>

            {/* Player */}
            <motion.div 
              className="absolute bottom-20 w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10"
              animate={{ left: `${playerX}%`, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              🏃
            </motion.div>

            {/* Touch Controls */}
            <div className="absolute bottom-0 inset-x-0 h-40 flex">
              <div className="flex-1 bg-white/5 active:bg-white/10" onPointerDown={moveLeft} />
              <div className="flex-1 bg-white/5 active:bg-white/10" onPointerDown={moveRight} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
