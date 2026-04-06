import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LionMascot } from '../components/LionMascot';
import { ShareCard } from '../components/ShareCard';

const TAUNTS = [
  "지금 이거 읽을 시간에 공부했으면 A+였다",
  "시선 처리 잘하시네요",
  "집중력 3초컷이시군요",
  "폰 내려놓으세요",
  "이 앱 만든 사람도 공부 안 함",
  "당신의 GPA가 보고 싶어함",
  "교수님이 보고 계십니다",
  "도망가면 안 됩니다",
  "졸음이 오신다면... 자도 됩니다",
  "지금 몇 번째 메시지예요?",
  "이 화면 스크린샷 찍으셨나요?",
  "5분만 버텨보세요, 어차피 못 버팀",
  "학점이 내려가는 소리 들리세요?",
  "다음 메시지는 10초 후입니다",
  "아직도 여기 있네요?",
  "열공 중이시군요... 맞죠?",
  "이 게임 이기면 A+ 줄까요? 안 줌",
  "지금 제일 열심히 하는 게 이 앱임",
  "졸업이 멀어지고 있습니다",
  "그냥 공부하세요",
  "재수강 각이 날카롭습니다",
  "부모님이 이 사실을 아시나요?"
];

export default function Game4() {
  const { updateScore, tier, percentile } = useGame();
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'END'>('IDLE');
  // Use a shorter time for testing, real game is 5 mins (300s)
  const [timeLeft, setTimeLeft] = useState(30); 
  const [penalties, setPenalties] = useState(0);
  const [taunt, setTaunt] = useState("");
  const [showDistraction, setShowDistraction] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tauntTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextEventRef = useRef(false);

  const startGame = () => {
    setGameState('PLAYING');
    setTimeLeft(60); // 1 minute for demo
    setPenalties(0);
    setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
    ignoreNextEventRef.current = true;
    setTimeout(() => { ignoreNextEventRef.current = false; }, 1000);
  };

  const handleEndGame = useCallback(() => {
    setGameState('END');
    const score = Math.max(0, 500 - penalties * 10);
    setFinalScore(score);
    updateScore('game4', score);
    if (timerRef.current) clearInterval(timerRef.current);
    if (tauntTimerRef.current) clearInterval(tauntTimerRef.current);
  }, [penalties, updateScore]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleEndGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      tauntTimerRef.current = setInterval(() => {
        setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
      }, 8000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (tauntTimerRef.current) clearInterval(tauntTimerRef.current);
    };
  }, [gameState, handleEndGame]);

  // Distraction detection
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleDistraction = () => {
      if (ignoreNextEventRef.current || showDistraction) return;
      
      setPenalties(p => p + 1);
      setTimeLeft(t => t + 5); // Add penalty time!
      setShowDistraction(true);
      
      ignoreNextEventRef.current = true;
      setTimeout(() => { 
        setShowDistraction(false); 
        ignoreNextEventRef.current = false;
      }, 2000);
    };

    window.addEventListener('mousemove', handleDistraction);
    window.addEventListener('click', handleDistraction);
    window.addEventListener('keydown', handleDistraction);
    window.addEventListener('touchstart', handleDistraction);

    return () => {
      window.removeEventListener('mousemove', handleDistraction);
      window.removeEventListener('click', handleDistraction);
      window.removeEventListener('keydown', handleDistraction);
      window.removeEventListener('touchstart', handleDistraction);
    };
  }, [gameState, showDistraction]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col transition-colors duration-1000 ${gameState === 'PLAYING' ? 'bg-black' : 'bg-slate-50'}`}>
      {gameState !== 'PLAYING' && (
        <div className="p-4 flex items-center z-10 absolute top-0 left-0">
          <Link href="/select">
            <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden w-full max-w-md mx-auto">
        
        {gameState === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <h1 className="text-4xl font-black mb-4 text-emerald-600">열공 모드</h1>
            <p className="mb-8 text-slate-600">
              목표 시간 동안 화면을 켜두고<br/>
              <b>절대 아무것도 조작하지 마세요.</b><br/>
              마우스를 움직이거나 터치하면 페널티!
            </p>
            <button 
              onClick={startGame}
              className="bg-emerald-500 text-white font-bold py-4 w-full rounded-2xl text-xl shadow-[0_6px_0_rgb(4,120,87)] hover:bg-emerald-600 active:translate-y-[6px] active:shadow-none transition-all"
            >
              수양 시작
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="absolute top-8 text-slate-500 font-serif opacity-50 font-bold">
              방해 횟수: {penalties}회
            </div>

            <motion.div 
              key={taunt}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 0.7, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute top-1/4 text-center w-full px-8"
            >
              <p className="text-white/60 font-serif text-lg leading-relaxed font-light italic">
                "{taunt}"
              </p>
            </motion.div>

            <div className={`text-7xl md:text-8xl font-serif text-white transition-all duration-500 ${showDistraction ? 'text-red-500 blur-sm scale-95' : 'text-white/90 scale-100'}`}>
              {formatTime(timeLeft)}
            </div>

            <AnimatePresence>
              {showDistraction && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="text-red-500 font-black text-3xl md:text-4xl px-8 py-4 border-4 border-red-500 rounded-3xl bg-black/80 backdrop-blur-md -rotate-12">
                    집중력 부족! (+5초)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {gameState === 'END' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center py-10"
          >
            <h2 className="text-3xl font-black text-slate-800 mb-8">수행 종료</h2>
            
            <ShareCard 
              score={finalScore} 
              tier={tier} 
              percentile={percentile} 
              title={penalties > 5 ? "의지박약 인증" : "인간승리 인증"} 
            />

            <div className="w-full mt-8 flex flex-col gap-3 px-4">
              <button className="w-full bg-[#f91b37] text-white py-4 rounded-xl font-bold shadow-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                에브리타임에 자랑하기 (척)
              </button>
              <button 
                onClick={startGame}
                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-md hover:bg-slate-900 transition-colors"
              >
                다시 수양하기
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
