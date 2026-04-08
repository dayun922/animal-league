import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import professorNoBg from '../assets/professor_nobg.png';

type GameState = 'IDLE' | 'WAITING' | 'READY' | 'SUCCESS' | 'FAIL' | 'FAKE' | 'END';

/* ─── CSS book component ─────────────────────────────────────────── */
function AdvancedPhysicsBook({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="book"
          initial={{ y: 80, opacity: 0, rotate: -8, scale: 0.6 }}
          animate={{ y: -20, opacity: 1, rotate: -5, scale: 1 }}
          exit={{ y: 80, opacity: 0, rotate: -12, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          style={{
            position: 'absolute',
            left: '22%',
            top: '30%',
            zIndex: 10,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))',
          }}
        >
          {/* Book spine + cover */}
          <div style={{ display: 'flex', height: 110 }}>
            {/* Spine */}
            <div style={{
              width: 14, background: 'linear-gradient(180deg,#1a2a5e,#0d1a3a)',
              borderRadius: '3px 0 0 3px', border: '1px solid #2a3a6e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                writingMode: 'vertical-rl', color: '#8aadff',
                fontSize: 7, fontWeight: 900, letterSpacing: 1,
              }}>PHYSICS</span>
            </div>
            {/* Cover */}
            <div style={{
              width: 78,
              background: 'linear-gradient(160deg,#1e3a7a 0%,#0d1f4a 60%,#091530 100%)',
              borderRadius: '0 4px 4px 0',
              border: '1px solid #2a4a8e',
              borderLeft: 'none',
              padding: '8px 7px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 2, padding: '3px 4px',
              }}>
                <div style={{ color: '#c8deff', fontSize: 9, fontWeight: 900, letterSpacing: 0.5 }}>ADVANCED</div>
                <div style={{ color: '#ffffff', fontSize: 11, fontWeight: 900 }}>PHYSICS</div>
                <div style={{ color: '#8aadff', fontSize: 7, fontStyle: 'italic' }}>Professional Edition</div>
              </div>
              <div style={{ color: '#6a9aff', fontSize: 7, lineHeight: 1.4, opacity: 0.85 }}>
                E=mc² f=mc³<br/>∇·E=ρ/ε₀<br/>F=ma ΔS≥0
              </div>
              <div style={{
                marginTop: 'auto', height: 2,
                background: 'linear-gradient(90deg, transparent, #4a7aff, transparent)',
              }} />
            </div>
          </div>
          {/* Pages edge */}
          <div style={{
            position: 'absolute', right: -3, top: 4, bottom: 4,
            width: 5, background: 'repeating-linear-gradient(180deg,#e8e4d8,#c8c4b8 2px,#e8e4d8 2px)',
            borderRadius: '0 2px 2px 0',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── CSS plushie bear ───────────────────────────────────────────── */
function PlushieBear({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bear"
          initial={{ y: 70, opacity: 0, rotate: 20, scale: 0.4 }}
          animate={{ y: -10, opacity: 1, rotate: 8, scale: 1 }}
          exit={{ y: 70, opacity: 0, rotate: 25, scale: 0.4 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          style={{
            position: 'absolute',
            left: '20%',
            top: '32%',
            zIndex: 10,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))',
          }}
        >
          <div style={{ position: 'relative', width: 64, height: 70 }}>
            {/* Ears */}
            <div style={{ position: 'absolute', top: -6, left: 4, width: 20, height: 20, borderRadius: '50%', background: '#d4a055', border: '2px solid #b8843a' }} />
            <div style={{ position: 'absolute', top: -6, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#d4a055', border: '2px solid #b8843a' }} />
            <div style={{ position: 'absolute', top: -3, left: 7, width: 14, height: 14, borderRadius: '50%', background: '#e8b870' }} />
            <div style={{ position: 'absolute', top: -3, right: 7, width: 14, height: 14, borderRadius: '50%', background: '#e8b870' }} />
            {/* Head */}
            <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 52, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #e8b870, #c89040)', border: '2px solid #b8843a' }}>
              {/* Muzzle */}
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', width: 26, height: 18, borderRadius: '50%', background: '#f0c880' }}>
                <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: 10, height: 7, borderRadius: '50%', background: '#8b5e20' }} />
              </div>
              {/* Eyes */}
              <div style={{ position: 'absolute', top: 16, left: 11, width: 9, height: 9, borderRadius: '50%', background: '#2a1a0a', boxShadow: '0 0 0 2px #6b4020' }}>
                <div style={{ position: 'absolute', top: 1, left: 1, width: 3, height: 3, borderRadius: '50%', background: 'white' }} />
              </div>
              <div style={{ position: 'absolute', top: 16, right: 11, width: 9, height: 9, borderRadius: '50%', background: '#2a1a0a', boxShadow: '0 0 0 2px #6b4020' }}>
                <div style={{ position: 'absolute', top: 1, left: 1, width: 3, height: 3, borderRadius: '50%', background: 'white' }} />
              </div>
            </div>
            {/* Label */}
            <div style={{
              position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
              background: '#ff6b9d', color: 'white', fontSize: 10, fontWeight: 900,
              padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap',
            }}>인형!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main game ──────────────────────────────────────────────────── */
export default function Game1() {
  const { updateScore } = useGame();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [reactionMs, setReactionMs] = useState(0);
  const [zipText, setZipText] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('IDLE');
  const currentRoundRef = useRef(1);
  const currentScoreRef = useRef(0);

  const setState = (s: GameState) => {
    setGameState(s);
    gameStateRef.current = s;
  };

  const startRound = (r: number) => {
    setState('WAITING');
    setZipText('');

    const waitTime = Math.random() * 3000 + 1500;

    timerRef.current = setTimeout(() => {
      // 30% chance of a fake on round 1
      const isFake = Math.random() < 0.3;
      if (isFake) {
        setState('FAKE');
        setZipText('..??');
        timerRef.current = setTimeout(() => {
          if (gameStateRef.current === 'FAKE') {
            startRound(r); // retry same round after fake
          }
        }, 1700);
      } else {
        setState('READY');
        setZipText('징~~~~!!!!');
        readyTimeRef.current = Date.now();
        // 1.5 second window to react
        timerRef.current = setTimeout(() => {
          if (gameStateRef.current === 'READY') {
            triggerFail('시간 초과!! 교수님이 과제를 꺼내셨습니다...');
          }
        }, 1500);
      }
    }, waitTime);
  };

  const triggerFail = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState('FAIL');
    setZipText('재수강!!');
    setTimeout(() => endGame(), 2400);
  };

  const handleClick = () => {
    const gs = gameStateRef.current;
    if (gs === 'WAITING') { triggerFail('너무 일찍 눌렀어요! (재수강ㅠㅠ)'); return; }
    if (gs === 'FAKE')    { triggerFail('그건 인형이잖아요! (감점!!)');       return; }
    if (gs === 'READY') {
      if (timerRef.current) clearTimeout(timerRef.current);
      const ms = Date.now() - readyTimeRef.current;
      // Score: faster = higher. Max ~1000 for instant, decreases with time
      const pts = Math.max(0, Math.round(1000 - ms * 1.8));
      currentScoreRef.current = pts;
      setScore(pts);
      setReactionMs(ms);
      setState('SUCCESS');
      setZipText(`${ms}ms ⚡`);

      // Single shot — go straight to END
      setTimeout(() => endGame(), 1600);
    }
  };

  const endGame = () => {
    setState('END');
    updateScore('game1', currentScoreRef.current);
  };

  const startGame = () => {
    currentRoundRef.current = 1;
    currentScoreRef.current = 0;
    setRound(1);
    setScore(0);
    setReactionMs(0);
    startRound(1);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isPlaying = !['IDLE', 'END'].includes(gameState);

  /* Professor image animation per state */
  const profAnim =
    gameState === 'WAITING' ? { rotate: [-0.5, 0.5], y: [0, -3, 0], filter: 'brightness(1) saturate(1)' } :
    gameState === 'READY'   ? { rotate: [-2, 2, -2], x: [-3, 3, -3], scale: 1.03, filter: 'brightness(1.1) saturate(1.3)' } :
    gameState === 'SUCCESS' ? { rotate: [-6, 4, -2, 0], scale: [1, 1.05, 1], filter: 'brightness(1.2) saturate(1.5)' } :
    gameState === 'FAIL'    ? { x: [-8, 8, -6, 6, 0], rotate: [-3, 3, -2, 0], filter: 'brightness(0.55) saturate(0.2) grayscale(0.8)' } :
    gameState === 'FAKE'    ? { rotate: [0, 1, -1, 0], filter: 'brightness(1) saturate(1)' } :
    { rotate: 0, scale: 1, filter: 'brightness(1) saturate(1)' };

  const profTransition =
    gameState === 'WAITING' ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } :
    gameState === 'READY'   ? { repeat: Infinity, duration: 0.1 } :
    gameState === 'FAKE'    ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } :
    { duration: 0.4 };

  const msgColor =
    gameState === 'READY'   ? '#fbbf24' :
    gameState === 'SUCCESS' ? '#34d399' :
    gameState === 'FAIL'    ? '#f87171' :
    gameState === 'FAKE'    ? '#f472b6' :
    'rgba(255,255,255,0.6)';

  const msg =
    gameState === 'WAITING' ? '가방을 주시하세요...' :
    gameState === 'READY'   ? '지금 닫아!!!' :
    gameState === 'SUCCESS' ? `찰칵!! ${reactionMs}ms — +${score}점` :
    gameState === 'FAIL'    ? '재수강...' :
    gameState === 'FAKE'    ? '어라?' :
    '';

  return (
    <div
      data-testid="game1-area"
      onClick={isPlaying ? handleClick : undefined}
      style={{
        minHeight: '100dvh', width: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg,#12172b 0%,#1a2240 40%,#1e2a50 100%)',
        touchAction: 'none', userSelect: 'none', overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, position: 'relative' }}>
        <Link href="/select">
          <button
            data-testid="btn-back"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex' }}
          >
            <ChevronLeft style={{ width: 24, height: 24, color: 'white' }} />
          </button>
        </Link>
        <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 20, color: 'white', letterSpacing: 3 }}>
          {reactionMs > 0 ? <><span style={{ color: '#fbbf24' }}>{reactionMs}</span><span style={{ fontSize: 13, opacity: 0.7 }}>ms</span></> : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>반응속도 테스트</span>}
        </div>
        <div style={{ fontWeight: 700, color: '#fca5a5', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
          1 SHOT
        </div>
      </div>

      {/* Message */}
      {isPlaying && (
        <div style={{ textAlign: 'center', padding: '0 16px 4px', zIndex: 20, minHeight: 36 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={msg}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 20, fontWeight: 900, color: msgColor, letterSpacing: 1 }}
            >
              {msg}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Scene */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* IDLE overlay */}
        <AnimatePresence>
          {gameState === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', inset: 0, zIndex: 30,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 24,
              }}
            >
              <motion.h1
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: 38, fontWeight: 900, color: '#fb7185', margin: '0 0 12px', textShadow: '0 4px 20px rgba(251,113,133,0.5)' }}
              >
                교수님 가방 닫기
              </motion.h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.7, marginBottom: 32 }}>
                교수님이 가방에서 책을 꺼내려는 찰나에<br />
                <b style={{ color: '#fbbf24' }}>화면을 TAP!</b>해서 가방을 닫으세요.<br />
                <span style={{ color: '#f472b6', fontSize: 14 }}>인형에 속으면 감점이에요!</span>
              </p>
              <motion.button
                data-testid="btn-start"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={startGame}
                style={{
                  background: '#e11d48', color: 'white', fontWeight: 900,
                  padding: '16px 40px', borderRadius: 50, fontSize: 22,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 0 #9f1239, 0 12px 30px rgba(225,29,72,0.4)',
                }}
              >
                게임 시작
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* END screen */}
        <AnimatePresence>
          {gameState === 'END' && (
            <motion.div
              key="end"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', inset: 0, zIndex: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
              }}
            >
              <div style={{
                background: 'white', borderRadius: 28, padding: '32px 28px',
                textAlign: 'center', maxWidth: 340, width: '100%',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              }}>
                {(() => {
                  const tier =
                    score === 0   ? { label: '재수강 확정', color: '#ef4444', emoji: '💀' } :
                    score >= 820  ? { label: '황금 반사 신경', color: '#f59e0b', emoji: '⚡' } :
                    score >= 640  ? { label: 'A+ 사냥꾼', color: '#10b981', emoji: '🎯' } :
                    score >= 460  ? { label: '평범한 대학생', color: '#3b82f6', emoji: '📚' } :
                    score >= 280  ? { label: '졸린 눈', color: '#8b5cf6', emoji: '😪' } :
                                    { label: '손가락이 느려요', color: '#94a3b8', emoji: '🐢' };
                  return (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{tier.emoji}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: tier.color, marginBottom: 2 }}>{tier.label}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>교수님 가방 닫기</div>
                      {reactionMs > 0 ? (
                        <>
                          <div style={{ fontSize: 64, fontWeight: 900, color: '#1e293b', marginBottom: 0, fontFamily: 'monospace' }}>{reactionMs}</div>
                          <div style={{ fontSize: 16, color: '#64748b', marginBottom: 4 }}>ms</div>
                          <div style={{ fontSize: 28, fontWeight: 900, color: tier.color, marginBottom: 2, fontFamily: 'monospace' }}>+{score}점</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 64, fontWeight: 900, color: '#ef4444', marginBottom: 4 }}>0</div>
                          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>반응 실패</div>
                        </>
                      )}
                    </>
                  );
                })()}
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>최종 점수</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    data-testid="btn-retry"
                    onClick={startGame}
                    style={{
                      flex: 1, background: '#e11d48', color: 'white',
                      padding: '14px 0', borderRadius: 14, fontWeight: 900,
                      border: 'none', cursor: 'pointer', fontSize: 15,
                      boxShadow: '0 4px 0 #9f1239',
                    }}
                  >
                    다시하기
                  </button>
                  <Link href="/" style={{ flex: 1, display: 'block' }}>
                    <button
                      data-testid="btn-home"
                      style={{
                        width: '100%', background: '#f1f5f9', color: '#334155',
                        padding: '14px 0', borderRadius: 14, fontWeight: 900,
                        border: 'none', cursor: 'pointer', fontSize: 15,
                        boxShadow: '0 4px 0 #cbd5e1',
                      }}
                    >
                      홈으로
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Professor + animated layers ── */}
        {isPlaying && (
          <div
            style={{
              position: 'relative',
              width: '100%', maxWidth: 540,
              margin: '0 auto',
            }}
          >
            {/* Book emerging from bag */}
            <AdvancedPhysicsBook visible={gameState === 'READY'} />

            {/* Plushie bear for fake */}
            <PlushieBear visible={gameState === 'FAKE'} />

            {/* Reaction time badge */}
            <AnimatePresence>
              {gameState === 'SUCCESS' && reactionMs > 0 && (
                <motion.div
                  key="badge"
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 6 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  style={{
                    position: 'absolute', top: '8%', right: '8%', zIndex: 20,
                    background: '#10b981', color: 'white', fontWeight: 900,
                    padding: '6px 14px', borderRadius: 20, fontSize: 14,
                    boxShadow: '0 4px 20px rgba(16,185,129,0.5)',
                    pointerEvents: 'none',
                  }}
                >
                  {reactionMs}ms ⚡
                </motion.div>
              )}
            </AnimatePresence>

            {/* 재수강 stamp on FAIL */}
            <AnimatePresence>
              {gameState === 'FAIL' && (
                <motion.div
                  key="fail-stamp"
                  initial={{ scale: 0, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: -12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                  style={{
                    position: 'absolute', top: '15%', left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20, pointerEvents: 'none',
                    fontSize: 52, fontWeight: 900, color: '#ef4444',
                    WebkitTextStroke: '2.5px white',
                    textShadow: '0 0 30px rgba(239,68,68,0.9)',
                    letterSpacing: 2, whiteSpace: 'nowrap',
                    fontFamily: '"Noto Sans KR", sans-serif',
                  }}
                >
                  재수강!!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sound text effect */}
            <AnimatePresence>
              {zipText && gameState !== 'END' && (
                <motion.div
                  key={zipText + gameState}
                  initial={{ opacity: 0, x: -20, y: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 0.8, 0], x: [- 20, 10, 30], y: [-5, -25], scale: [0.8, 1.1, 0.9] }}
                  transition={{ duration: 1.1 }}
                  style={{
                    position: 'absolute', left: '15%', top: '40%', zIndex: 20,
                    pointerEvents: 'none',
                    fontSize: gameState === 'READY' ? 18 : 14,
                    fontWeight: 900,
                    color: gameState === 'SUCCESS' ? '#34d399' : gameState === 'FAIL' ? '#f87171' : gameState === 'FAKE' ? '#f472b6' : '#fbbf24',
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.1em',
                  }}
                >
                  {zipText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Red vignette on FAIL */}
            <AnimatePresence>
              {gameState === 'FAIL' && (
                <motion.div
                  key="vignette"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', borderRadius: 12,
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(239,68,68,0.35) 100%)',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Green flash on SUCCESS */}
            <AnimatePresence>
              {gameState === 'SUCCESS' && (
                <motion.div
                  key="flash"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.45) 0%, transparent 70%)',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Professor character — transparent PNG, animated */}
            <motion.img
              src={professorNoBg}
              alt="교수님"
              animate={profAnim}
              transition={profTransition}
              style={{
                width: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 6,
                pointerEvents: 'none',
                display: 'block',
              }}
            />

            {/* Tap hint pulse */}
            {gameState === 'WAITING' && (
              <motion.div
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                style={{
                  position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700,
                  letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}
              >
                화면을 터치하세요...
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
