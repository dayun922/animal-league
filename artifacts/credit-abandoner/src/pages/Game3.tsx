import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Coffee, Zap } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const LIVE_RANKINGS = [
  "사자👑 님의 심박수 250bpm",
  "고양이🐱 님이 손목 골절 직전",
  "펭귄🐧 님의 엄지가 연기를 피움",
  "토끼🐰 님은 이미 에너지드링크 3캔째",
  "곰돌이🐻 님이 폰을 뚫을 기세",
  "여우🦊 님의 클릭 소리가 관악산까지 들림",
  "햄스터🐹 님이 트레드밀 모드 돌입",
  "오리🦆 님의 손가락이 광속으로 움직임",
];

const getEndMessage = (clicks: number) => {
  if (clicks < 20) return { msg: "디카페인이신가요? 커피 원샷이 필요해요.", sub: "커피 한 잔도 못 마심" };
  if (clicks < 40) return { msg: "아메리카노 수혈 중입니다.", sub: "커피 1잔 분량의 카페인 흡수" };
  if (clicks < 60) return { msg: "시험기간 밤샘 가능! 그래도 공부는 안 함.", sub: "아이스 아메리카노 2잔 분량" };
  if (clicks < 80) return { msg: "심장이 너무 빨리 뛰어요... 괜찮으세요?", sub: "몬스터 에너지 1캔 분량!" };
  if (clicks < 100) return { msg: "당신은 몬스터 2캔 분량의 에너지를 뿜었습니다!", sub: "공부는 언제 하실 계획인가요?" };
  return { msg: "카페인 과다위험!!! 지금 당장 119 호출하세요", sub: `몬스터 ${Math.floor(clicks/50)}캔 분량 — 학점보다 심박수가 높습니다` };
};

const getMania = (clicks: number) => {
  if (clicks < 30) return { faceColor: '', label: '', mania: false };
  if (clicks < 60) return { faceColor: 'hue-rotate-[330deg] saturate-150', label: '⚡ 카페인 감지됨', mania: false };
  if (clicks < 90) return { faceColor: 'hue-rotate-[330deg] saturate-200 brightness-110', label: '🔥 달아오름!', mania: false };
  return { faceColor: 'hue-rotate-[300deg] saturate-[3] brightness-125', label: '🌋 광기 모드 돌입!!!!', mania: true };
};

export default function Game3() {
  const { updateScore } = useGame();
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'END'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(10);
  const [clicks, setClicks] = useState(0);
  const [rankIdx, setRankIdx] = useState(0);
  const [showRankUpdate, setShowRankUpdate] = useState(false);
  const clicksRef = useRef(0);

  useEffect(() => { clicksRef.current = clicks; }, [clicks]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('END');
      updateScore('game3', clicksRef.current);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, updateScore]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setRankIdx(i => (i + 1) % LIVE_RANKINGS.length);
      setShowRankUpdate(true);
      setTimeout(() => setShowRankUpdate(false), 600);
    }, 2000);
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setGameState('PLAYING');
    setTimeLeft(10);
    setClicks(0);
    clicksRef.current = 0;
    setRankIdx(0);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      setClicks(c => c + 1);
    }
  };

  const fillPercentage = Math.min(100, (clicks / 100) * 100);
  const { faceColor, label, mania } = getMania(clicks);
  const endData = getEndMessage(clicks);

  return (
    <div className="min-h-[100dvh] bg-[#fdf5e6] w-full flex flex-col touch-none relative select-none overflow-hidden">
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/select">
          <button data-testid="btn-back" className="p-2 bg-white rounded-full shadow-sm border border-amber-200 hover:bg-amber-50 text-amber-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        {gameState === 'PLAYING' && (
          <div className={`font-mono font-black text-4xl tracking-widest ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-800'}`}>
            {timeLeft.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Live ranking ticker */}
      {gameState === 'PLAYING' && (
        <div className="px-4 mb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={rankIdx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className={`bg-amber-100/80 border border-amber-300 rounded-xl px-4 py-2 text-amber-800 text-sm font-bold flex items-center gap-2 ${showRankUpdate ? 'bg-amber-200' : ''}`}
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              현재 1위: {LIVE_RANKINGS[rankIdx]}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {gameState === 'IDLE' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="bg-amber-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Coffee className="w-16 h-16 text-amber-600" />
            </div>
            <h1 className="text-4xl font-black mb-1 text-amber-900">커피 수혈 릴레이</h1>
            <p className="text-amber-600 font-bold mb-4 text-sm">커피 연타</p>
            <p className="mb-8 text-amber-700/80 font-medium">10초 동안 커피컵을 미친듯이 누르세요!<br/>학점을 살리려면 카페인이 필요합니다.</p>
            <button 
              data-testid="btn-start"
              onClick={startGame}
              className="bg-amber-500 text-white font-bold py-4 px-12 rounded-full text-2xl shadow-[0_6px_0_rgb(180,83,9)] hover:bg-amber-600 active:shadow-[0_0px_0_rgb(180,83,9)] active:translate-y-[6px] transition-all"
            >
              원샷 GO!
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 0.4 }}
              className="text-7xl font-black font-mono text-amber-900 mb-4 select-none tabular-nums"
            >
              {clicks}
            </motion.div>

            {label && (
              <motion.div 
                key={label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-black text-amber-700 mb-2 bg-amber-100 px-3 py-1 rounded-full"
              >
                {label}
              </motion.div>
            )}

            <motion.div 
              className={`relative w-52 h-72 cursor-pointer touch-manipulation ${mania ? 'animate-bounce' : ''}`}
              onPointerDown={handleClick}
              whileTap={{ scale: 0.92, rotate: (clicks % 2 === 0 ? -3 : 3) }}
              style={{ filter: faceColor ? faceColor : undefined }}
            >
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-b-[40px] border-4 border-amber-900/20 shadow-2xl overflow-hidden">
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-amber-950 via-amber-800 to-amber-600 transition-all duration-75"
                     style={{ height: `${fillPercentage}%` }}
                >
                  <div className="absolute top-0 w-full h-3 bg-amber-500/50 rounded-full -translate-y-1/2" />
                  {fillPercentage > 90 && (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-amber-400/40 animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="absolute top-[35%] left-0 w-full h-20 bg-amber-200/90 border-y-2 border-amber-300 flex items-center justify-center">
                <Coffee className={`w-9 h-9 text-amber-800 opacity-60 ${mania ? 'animate-spin' : ''}`} />
              </div>
              
              <div className="absolute -top-3 -left-3 -right-3 h-10 bg-white rounded-t-xl border-4 border-amber-900/20 rounded-b-md shadow-md" />
            </motion.div>
            
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="mt-8 text-amber-700/60 font-black uppercase tracking-widest text-sm"
            >
              TAP TAP TAP TAP!
            </motion.div>

            <div className="mt-3 text-amber-600/50 text-xs font-medium">
              초당 {(clicks / Math.max(1, 10 - timeLeft)).toFixed(1)}회
            </div>
          </div>
        )}

        {gameState === 'END' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 text-center max-w-sm w-full shadow-2xl border border-amber-100"
          >
            <div className="text-amber-500 font-bold mb-1 text-sm uppercase tracking-widest">기록 달성!</div>
            <div className="text-8xl font-black text-amber-900 mb-1 font-mono tabular-nums">{clicks}</div>
            <div className="text-sm text-amber-700/60 mb-1">초당 {(clicks/10).toFixed(1)}번 클릭</div>
            <div className="text-xs text-amber-500/60 mb-6">
              {clicks > 0 ? `커피 약 ${(clicks * 0.05).toFixed(1)}잔 분량의 에너지` : ''}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl font-bold mb-2 text-base">
              {endData.msg}
            </div>
            <div className="text-amber-600/70 text-xs mb-8 font-medium">{endData.sub}</div>
            
            <div className="flex gap-3">
              <button 
                data-testid="btn-retry"
                onClick={startGame}
                className="bg-amber-500 text-white py-4 rounded-xl font-bold hover:bg-amber-600 flex-1 shadow-[0_4px_0_rgb(180,83,9)] active:translate-y-[4px] active:shadow-none transition-all"
              >
                다시 원샷
              </button>
              <Link href="/" className="flex-[0.7]">
                <button data-testid="btn-home" className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 shadow-[0_4px_0_rgb(203,213,225)] active:translate-y-[4px] active:shadow-none transition-all">
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
