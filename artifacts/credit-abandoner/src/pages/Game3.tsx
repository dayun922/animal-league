import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Coffee } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Game3() {
  const { updateScore } = useGame();
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'END'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(10);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('END');
      updateScore('game3', clicks);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, clicks, updateScore]);

  const startGame = () => {
    setGameState('PLAYING');
    setTimeLeft(10);
    setClicks(0);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      setClicks(c => c + 1);
    }
  };

  // Calculate cup fill percentage
  const fillPercentage = Math.min(100, (clicks / 80) * 100);
  
  // Caffeine messages
  const getMessage = () => {
    if (clicks < 20) return "디카페인인가요?";
    if (clicks < 40) return "아메리카노 수혈 중";
    if (clicks < 60) return "시험기간 밤샘 가능";
    if (clicks < 80) return "심장이 너무 빨리 뛰어요";
    return "카페인 과다 위험!!! 🚑";
  };

  return (
    <div className="min-h-[100dvh] bg-[#fdf5e6] w-full flex flex-col touch-none relative select-none">
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/select">
          <button className="p-2 bg-white rounded-full shadow-sm border border-amber-200 hover:bg-amber-50 text-amber-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        {gameState === 'PLAYING' && (
          <div className={`font-mono font-bold text-3xl ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-800'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {gameState === 'IDLE' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="bg-amber-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coffee className="w-16 h-16 text-amber-600" />
            </div>
            <h1 className="text-4xl font-black mb-4 text-amber-900">커피 연타</h1>
            <p className="mb-8 text-amber-700/80 font-medium">10초 동안 커피컵을 미친듯이 누르세요!<br/>학점을 살리려면 카페인이 필요합니다.</p>
            <button 
              onClick={startGame}
              className="bg-amber-500 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-[0_6px_0_rgb(180,83,9)] hover:bg-amber-600 active:shadow-[0_0px_0_rgb(180,83,9)] active:translate-y-[6px] transition-all"
            >
              마시기 시작
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="text-6xl font-black font-mono text-amber-900 mb-8 select-none">
              {clicks}
            </div>

            <motion.div 
              className="relative w-64 h-80 cursor-pointer touch-manipulation"
              onPointerDown={handleClick}
              whileTap={{ scale: 0.95, rotate: (clicks % 2 === 0 ? -2 : 2) }}
            >
              {/* Cup background */}
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-b-[40px] border-4 border-amber-900/20 shadow-xl overflow-hidden">
                {/* Coffee Liquid */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-amber-900 to-amber-700 transition-all duration-100"
                     style={{ height: `${fillPercentage}%` }}
                >
                  <div className="absolute top-0 w-full h-4 bg-amber-600/50 rounded-full -translate-y-1/2"></div>
                </div>
              </div>
              
              {/* Cup sleeve */}
              <div className="absolute top-1/2 left-0 w-full h-24 bg-amber-200/90 -translate-y-1/2 border-y-2 border-amber-300 flex items-center justify-center">
                <Coffee className="w-10 h-10 text-amber-800 opacity-50" />
              </div>
              
              {/* Lid */}
              <div className="absolute -top-4 -left-4 -right-4 h-12 bg-white rounded-t-xl border-4 border-amber-900/20 rounded-b-md shadow-md"></div>
              
              {/* Click particles effect could go here */}
            </motion.div>
            
            <div className="mt-12 text-amber-700/50 font-bold animate-pulse uppercase tracking-widest">
              TAP TAP TAP TAP!
            </div>
          </div>
        )}

        {gameState === 'END' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 text-center max-w-sm w-full shadow-2xl border border-amber-100"
          >
            <div className="text-amber-500 font-bold mb-2">기록 달성!</div>
            <div className="text-7xl font-black text-amber-900 mb-2 font-mono">{clicks}</div>
            <div className="text-sm text-amber-700/70 mb-6 font-medium bg-amber-50 py-2 rounded-xl">
              초당 {(clicks/10).toFixed(1)}번 클릭
            </div>
            
            <div className="bg-amber-100 text-amber-900 p-4 rounded-2xl font-bold mb-8 text-lg">
              {getMessage()}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={startGame}
                className="bg-amber-500 text-white py-4 rounded-xl font-bold hover:bg-amber-600 flex-1 shadow-[0_4px_0_rgb(180,83,9)] active:translate-y-[4px] active:shadow-none transition-all"
              >
                다시 마시기
              </button>
              <Link href="/select" className="flex-[0.7]">
                <button className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 shadow-[0_4px_0_rgb(203,213,225)] active:translate-y-[4px] active:shadow-none transition-all">
                  홈으로
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
