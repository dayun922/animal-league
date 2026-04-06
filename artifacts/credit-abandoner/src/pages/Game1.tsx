import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
// import Confetti from 'react-confetti'; // Normally we'd use this, but might fail without it installed fully

type GameState = 'IDLE' | 'WAITING' | 'READY' | 'SUCCESS' | 'FAIL' | 'FAKE' | 'END';

export default function Game1() {
  const { updateScore } = useGame();
  
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeRef = useRef<number>(0);

  const startRound = () => {
    setGameState('WAITING');
    setMessage("기다리세요...");
    
    // Random wait time decreases slightly as rounds progress
    const baseWait = Math.random() * 3000 + 1500;
    const waitTime = Math.max(500, baseWait - (round * 100));

    timerRef.current = setTimeout(() => {
      // 30% chance for a fake
      const isFake = Math.random() < 0.3;
      if (isFake) {
        setGameState('FAKE');
        setMessage("가방 여는 척 (인형)");
        timerRef.current = setTimeout(() => {
          if (gameState === 'FAKE') { // if user didn't click
            startRound();
          }
        }, 1500);
      } else {
        setGameState('READY');
        setMessage("지금 닫아!!");
        readyTimeRef.current = Date.now();
        
        // Auto fail if not clicked in time (gets faster)
        const reactTime = Math.max(400, 1000 - (round * 50));
        timerRef.current = setTimeout(() => {
          handleFail("시간 초과! 교수님이 과제를 꺼냈습니다.");
        }, reactTime);
      }
    }, waitTime);
  };

  const startGame = () => {
    setRound(1);
    setScore(0);
    startRound();
  };

  const handleFail = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('FAIL');
    setMessage(msg);
    
    setTimeout(() => {
      endGame();
    }, 2000);
  };

  const handleClick = () => {
    if (gameState === 'WAITING') {
      handleFail("너무 일찍 닫았습니다! (재수강ㅠㅠ)");
      return;
    }
    
    if (gameState === 'FAKE') {
      handleFail("그건 인형이잖아요... (감점)");
      return;
    }
    
    if (gameState === 'READY') {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      const reactionTime = Date.now() - readyTimeRef.current;
      const points = Math.max(10, Math.floor(200 - reactionTime / 5));
      
      setScore(prev => prev + points);
      setGameState('SUCCESS');
      setMessage(`찰칵! 가방 닫음! (+${points}점)`);
      
      setTimeout(() => {
        if (round >= 10) {
          endGame();
        } else {
          setRound(r => r + 1);
          startRound();
        }
      }, 1500);
    }
  };

  const endGame = () => {
    setGameState('END');
    updateScore('game1', score);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-slate-900 w-full flex flex-col text-white touch-none overflow-hidden relative">
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/select">
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <div className="font-mono font-bold text-xl">SCORE: {score}</div>
        <div className="font-bold text-rose-400 bg-rose-400/20 px-3 py-1 rounded-full">
          ROUND {round}/10
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative" onClick={handleClick}>
        <AnimatePresence mode="wait">
          {gameState === 'IDLE' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-black mb-4 text-rose-500">교수님 가방 닫기</h1>
              <p className="mb-8 text-gray-300">가방이 열리려고 할 때 화면을 터치해서 닫으세요!<br/>인형에 속지 마세요.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="bg-rose-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-rose-600 active:scale-95 transition-transform"
              >
                게임 시작
              </button>
            </motion.div>
          )}

          {(gameState === 'WAITING' || gameState === 'READY' || gameState === 'FAKE' || gameState === 'SUCCESS' || gameState === 'FAIL') && (
            <motion.div 
              key="playing"
              className="flex flex-col items-center w-full"
            >
              <div className="text-2xl font-bold mb-10 h-8 text-yellow-300">
                {message}
              </div>
              
              {/* The Bag Visual */}
              <div className="relative w-64 h-64 mx-auto cursor-pointer">
                {/* Professor silhouette */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-700 rounded-full border-4 border-slate-800" />
                
                {/* The Bag */}
                <motion.div 
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-40 rounded-2xl border-4 ${
                    gameState === 'SUCCESS' ? 'bg-emerald-800 border-emerald-500' :
                    gameState === 'FAIL' ? 'bg-rose-900 border-rose-500' :
                    'bg-slate-600 border-slate-500'
                  }`}
                  animate={
                    gameState === 'READY' || gameState === 'FAKE' ? { y: [-5, 5, -5] } :
                    gameState === 'FAIL' ? { x: [-10, 10, -10, 10, 0] } :
                    { y: 0 }
                  }
                  transition={{ repeat: (gameState === 'READY' || gameState === 'FAKE') ? Infinity : 0, duration: 0.1 }}
                >
                  {/* Zipper line */}
                  <div className="absolute top-4 left-4 right-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-slate-400"
                      initial={{ width: "10%" }}
                      animate={{ 
                        width: (gameState === 'READY' || gameState === 'FAKE') ? "90%" : 
                               gameState === 'SUCCESS' ? "10%" : "50%" 
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  {/* Contents popping out */}
                  <AnimatePresence>
                    {gameState === 'READY' && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: -60, opacity: 1 }}
                        exit={{ y: 0, opacity: 0 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-white rounded flex items-center justify-center text-black font-black rotate-12"
                      >
                        기말 과제
                      </motion.div>
                    )}
                    {gameState === 'FAKE' && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: -50, opacity: 1 }}
                        exit={{ y: 0, opacity: 0 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center text-2xl -rotate-12"
                      >
                        🧸
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* BIG FAIL TEXT */}
                <AnimatePresence>
                  {gameState === 'FAIL' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: -10 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-red-500 whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] z-50"
                      style={{ WebkitTextStroke: '2px white' }}
                    >
                      재수강
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-20 text-slate-400 animate-pulse text-sm">
                화면 아무곳이나 터치하세요
              </div>
            </motion.div>
          )}

          {gameState === 'END' && (
            <motion.div 
              key="end"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 text-black text-center max-w-sm w-full"
            >
              <h2 className="text-2xl font-bold mb-2">게임 종료!</h2>
              <div className="text-6xl font-black text-rose-500 mb-6 font-mono">{score}</div>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 flex-1"
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
