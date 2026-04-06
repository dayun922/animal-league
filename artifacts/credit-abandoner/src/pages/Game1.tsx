import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import professorImg from '@assets/image_1775490251058.png';

type GameState = 'IDLE' | 'WAITING' | 'READY' | 'SUCCESS' | 'FAIL' | 'FAKE' | 'END';

export default function Game1() {
  const { updateScore } = useGame();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [reactionMs, setReactionMs] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('IDLE');

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const startRound = (currentRound: number) => {
    setGameState('WAITING');
    gameStateRef.current = 'WAITING';
    setMessage("가방을 주시하세요...");

    const baseWait = Math.random() * 3000 + 1500;
    const waitTime = Math.max(600, baseWait - currentRound * 120);

    timerRef.current = setTimeout(() => {
      const isFake = Math.random() < (0.2 + currentRound * 0.03);
      if (isFake) {
        setGameState('FAKE');
        gameStateRef.current = 'FAKE';
        setMessage("...");
        timerRef.current = setTimeout(() => {
          if (gameStateRef.current === 'FAKE') {
            startRound(currentRound);
          }
        }, 1600);
      } else {
        setGameState('READY');
        gameStateRef.current = 'READY';
        setMessage("지금 닫아!!!");
        readyTimeRef.current = Date.now();
        const reactWindow = Math.max(350, 1000 - currentRound * 55);
        timerRef.current = setTimeout(() => {
          if (gameStateRef.current === 'READY') {
            handleFail("시간 초과!! 교수님이 과제를 꺼냈습니다...", currentRound);
          }
        }, reactWindow);
      }
    }, waitTime);
  };

  const startGame = () => {
    setRound(1);
    setScore(0);
    setReactionMs(0);
    startRound(1);
  };

  const handleFail = (msg: string, currentRound?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('FAIL');
    gameStateRef.current = 'FAIL';
    setMessage(msg);
    setTimeout(() => endGame(score), 2200);
  };

  const handleClick = () => {
    const gs = gameStateRef.current;

    if (gs === 'WAITING') {
      handleFail("너무 일찍 눌렀어요! (재수강ㅠㅠ)");
      return;
    }
    if (gs === 'FAKE') {
      handleFail("그건 인형이잖아요... (감점!!)");
      return;
    }
    if (gs === 'READY') {
      if (timerRef.current) clearTimeout(timerRef.current);
      const ms = Date.now() - readyTimeRef.current;
      const points = Math.max(10, Math.floor(200 - ms / 5));
      const newScore = score + points;
      setScore(newScore);
      setReactionMs(ms);
      setGameState('SUCCESS');
      gameStateRef.current = 'SUCCESS';
      setMessage(`찰칵! 가방 닫음! (+${points}점)`);

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound > 10) {
          endGame(newScore);
        } else {
          setRound(nextRound);
          startRound(nextRound);
        }
      }, 1400);
    }
  };

  const endGame = (finalScore: number) => {
    setGameState('END');
    gameStateRef.current = 'END';
    updateScore('game1', finalScore);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Derive professor animation from game state
  const profVariants = {
    idle: { rotate: 0, scale: 1, x: 0, filter: 'brightness(1) saturate(1)' },
    waiting: { rotate: [0, -1, 1, 0], scale: 1, x: 0, filter: 'brightness(1) saturate(1)' },
    ready: { rotate: [-2, 2, -2], scale: 1.04, x: [-4, 4, -4], filter: 'brightness(1.05) saturate(1.2)' },
    success: { rotate: [0, -8, 5, 0], scale: [1, 1.08, 1], x: 0, filter: 'brightness(1.15) saturate(1.4)' },
    fail: { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.03, 0.97, 1], x: [0, -10, 10, -8, 8, 0], filter: 'brightness(0.7) saturate(0.3)' },
    fake: { rotate: [0, 1.5, -1.5, 0], scale: 1.02, x: 0, filter: 'brightness(1) saturate(1)' },
  };

  const getProfAnim = () => {
    if (gameState === 'WAITING') return profVariants.waiting;
    if (gameState === 'READY') return profVariants.ready;
    if (gameState === 'SUCCESS') return profVariants.success;
    if (gameState === 'FAIL') return profVariants.fail;
    if (gameState === 'FAKE') return profVariants.fake;
    return profVariants.idle;
  };

  const getProfTransition = () => {
    if (gameState === 'READY') return { repeat: Infinity, duration: 0.08 };
    if (gameState === 'WAITING') return { repeat: Infinity, duration: 2, ease: 'easeInOut' };
    if (gameState === 'SUCCESS') return { duration: 0.4, ease: 'easeOut' };
    if (gameState === 'FAIL') return { duration: 0.5, ease: 'easeOut' };
    if (gameState === 'FAKE') return { repeat: Infinity, duration: 1.5, ease: 'easeInOut' };
    return { duration: 0.3 };
  };

  const isPlaying = gameState !== 'IDLE' && gameState !== 'END';

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col touch-none overflow-hidden relative select-none"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      onClick={isPlaying ? handleClick : undefined}
      data-testid="game1-area"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-20 relative">
        <Link href="/select">
          <button
            data-testid="btn-back"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <div className="font-mono font-bold text-xl text-white tracking-widest">
          SCORE: <span className="text-yellow-400">{score}</span>
        </div>
        <div className="font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-full text-sm">
          ROUND {round}/10
        </div>
      </div>

      {/* Message bar */}
      {isPlaying && (
        <div className="relative z-20 text-center px-4 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-xl font-black tracking-wide ${
                gameState === 'READY' ? 'text-yellow-300 animate-pulse' :
                gameState === 'SUCCESS' ? 'text-emerald-400' :
                gameState === 'FAIL' ? 'text-red-400' :
                gameState === 'FAKE' ? 'text-pink-400' :
                'text-white/60'
              }`}
            >
              {message}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-end relative overflow-hidden pb-8">

        {/* IDLE state */}
        <AnimatePresence>
          {gameState === 'IDLE' && (
            <motion.div
              key="idle-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h1
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl font-black text-rose-400 mb-2 drop-shadow-lg"
              >
                교수님 가방 닫기
              </motion.h1>
              <p className="text-white/70 text-center mb-8 leading-relaxed">
                교수님이 가방에서 책을 꺼내려는 찰나에<br/>
                <b className="text-yellow-300">화면을 TAP!</b>해서 가방을 닫으세요.<br/>
                <span className="text-pink-400 text-sm">인형에 속으면 감점이에요!</span>
              </p>
              <motion.button
                data-testid="btn-start"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-rose-500 text-white font-black py-4 px-10 rounded-full text-2xl shadow-[0_6px_0_rgb(159,18,57)] hover:bg-rose-600 active:translate-y-[6px] active:shadow-none transition-all"
              >
                게임 시작
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professor image */}
        {gameState !== 'IDLE' && gameState !== 'END' && (
          <div className="relative w-full max-w-lg mx-auto px-2">

            {/* Book flying out of bag — READY state */}
            <AnimatePresence>
              {gameState === 'READY' && (
                <motion.div
                  key="book-real"
                  initial={{ y: 60, x: -60, opacity: 0, rotate: -15, scale: 0.5 }}
                  animate={{ y: -30, x: -20, opacity: 1, rotate: -5, scale: 1 }}
                  exit={{ y: 60, x: -60, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute left-[18%] top-[10%] z-20 pointer-events-none"
                >
                  <div className="w-20 h-24 bg-slate-800 border-2 border-slate-600 rounded-sm shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-blue-900 flex-1 flex items-center justify-center p-1">
                      <div className="text-white text-[9px] font-black text-center leading-tight">
                        ADVANCED<br/>PHYSICS<br/>
                        <div className="text-[7px] font-normal opacity-70 mt-1">E=mc²</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-600" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fake item — plushie/toy */}
            <AnimatePresence>
              {gameState === 'FAKE' && (
                <motion.div
                  key="fake-item"
                  initial={{ y: 50, x: -50, opacity: 0, rotate: 20, scale: 0.3 }}
                  animate={{ y: -10, x: -15, opacity: 1, rotate: 10, scale: 1 }}
                  exit={{ y: 50, x: -50, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute left-[20%] top-[15%] z-20 pointer-events-none"
                >
                  {/* CSS plushie bear */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-amber-400 rounded-full border-2 border-amber-600 shadow-xl flex items-center justify-center">
                      <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center gap-0.5">
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                      </div>
                    </div>
                    {/* Ears */}
                    <div className="absolute -top-2.5 left-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-amber-600" />
                    <div className="absolute -top-2.5 right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-amber-600" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-900 whitespace-nowrap">인형!</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reaction time badge — SUCCESS */}
            <AnimatePresence>
              {gameState === 'SUCCESS' && reactionMs > 0 && (
                <motion.div
                  key="react-badge"
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, y: -20 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute top-[5%] right-[8%] z-30 bg-emerald-400 text-white font-black text-sm px-3 py-1.5 rounded-2xl shadow-lg rotate-6 pointer-events-none"
                >
                  {reactionMs}ms ⚡
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUCCESS flash overlay */}
            <AnimatePresence>
              {gameState === 'SUCCESS' && (
                <motion.div
                  key="success-flash"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 70%)' }}
                />
              )}
            </AnimatePresence>

            {/* FAIL overlay */}
            <AnimatePresence>
              {gameState === 'FAIL' && (
                <motion.div
                  key="fail-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(0,0,0,0.5) 100%)' }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 text-5xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.9)] whitespace-nowrap"
                    style={{ WebkitTextStroke: '2px white', fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    재수강!!
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The professor image — animated */}
            <motion.img
              src={professorImg}
              alt="교수님"
              className="w-full object-contain relative z-0 pointer-events-none"
              style={{ maxHeight: '55vh' }}
              animate={getProfAnim()}
              transition={getProfTransition()}
            />

            {/* Tap hint */}
            {gameState === 'WAITING' && (
              <motion.div
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold uppercase tracking-widest"
              >
                화면을 터치하세요...
              </motion.div>
            )}

            {/* Zip sound text effect — WAITING/READY */}
            {(gameState === 'WAITING' || gameState === 'READY') && (
              <AnimatePresence>
                <motion.div
                  key={`zip-${gameState}`}
                  initial={{ opacity: 0, x: -30, scale: 0.7 }}
                  animate={{ opacity: [0, 1, 0.7, 0], x: [- 30, 10, 20, 40], scale: [0.7, 1.1, 1, 0.8] }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className={`absolute left-[12%] top-[40%] z-20 font-black text-lg pointer-events-none ${gameState === 'READY' ? 'text-yellow-400' : 'text-white/50'}`}
                  style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}
                >
                  {gameState === 'READY' ? '징~~~~~~!!' : '징~징~'}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* END screen */}
        <AnimatePresence>
          {gameState === 'END' && (
            <motion.div
              key="end"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-8 text-black text-center max-w-sm w-full shadow-2xl">
                <div className="text-2xl font-black mb-1 text-slate-800">게임 종료!</div>
                <div className="text-slate-500 text-sm mb-4">교수님 가방 닫기</div>
                <div className="text-7xl font-black text-rose-500 mb-2 font-mono tabular-nums">{score}</div>
                <div className="text-slate-400 text-sm mb-6">최종 점수</div>

                <div className="flex gap-3">
                  <button
                    data-testid="btn-retry"
                    onClick={startGame}
                    className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 flex-1 shadow-[0_4px_0_rgb(159,18,57)] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    다시하기
                  </button>
                  <Link href="/" className="flex-1">
                    <button
                      data-testid="btn-home"
                      className="w-full bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 shadow-[0_4px_0_rgb(203,213,225)] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                      홈으로
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
