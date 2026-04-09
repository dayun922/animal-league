import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import classroomBgSrc from '@assets/image_1775732459196.png';

/* ── Constants ─────────────────────────────────────────────── */
const GAME_DURATION = 30;
const CATCH_PTS     = 10;
const MISS_PTS      = 5;
// Approx 22 A+'s fall over 30s → max ≈ 220
const MAX_SCORE     = 220;

function getGrade(score: number) {
  const r = score / MAX_SCORE;
  if (r >= 0.90) return { grade: 'A+', color: '#d97706', bg: '#fef3c7', msg: '이 손으로 수강신청 해봐요 👑' };
  if (r >= 0.80) return { grade: 'A',  color: '#059669', bg: '#d1fae5', msg: '좋은 학점이에요! 조금만 더 ✨' };
  if (r >= 0.70) return { grade: 'B+', color: '#2563eb', bg: '#dbeafe', msg: '중상위권 수준이에요 📚' };
  if (r >= 0.60) return { grade: 'B',  color: '#7c3aed', bg: '#ede9fe', msg: '평범한 대학생... 😅' };
                 return { grade: 'F',  color: '#dc2626', bg: '#fee2e2', msg: '재수강 확정입니다 💀' };
}

/* ── Types ─────────────────────────────────────────────────── */
interface APlusItem {
  id: number;
  x: number;   // canvas px
  y: number;
  vy: number;  // px/frame
  rot: number;
  rotV: number;
  size: number;
  caught: boolean;
  missed: boolean;
  sparkle: number; // frames remaining
  sx: number; sy: number; // sparkle origin
}

interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string; }

/* ── Main component ────────────────────────────────────────── */
export default function Game2() {
  const { updateScore } = useGame();
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const bgImgRef   = useRef<HTMLImageElement | null>(null);

  // Preload background image once
  useEffect(() => {
    const img = new Image();
    img.src = classroomBgSrc;
    img.onload = () => { bgImgRef.current = img; };
  }, []);

  const [phase, setPhase]       = useState<'IDLE'|'PLAYING'|'END'>('IDLE');
  const [dispScore, setDispScore] = useState(0);
  const [dispTime,  setDispTime]  = useState(GAME_DURATION);

  /* mutable game state in a single ref — no stale closures */
  const G = useRef({
    phase:     'IDLE' as 'IDLE'|'PLAYING'|'END',
    score:     0,
    timeLeft:  GAME_DURATION,
    startMs:   0,
    frame:     0,
    lastSpawn: 0,
    basketX:   0,   // px (center of basket)
    basketW:   90,
    items:     [] as APlusItem[],
    sparks:    [] as Spark[],
    nextId:    0,
    dragging:  false,
    dragOffX:  0,
    canvasW:   0,
    canvasH:   0,
  });

  /* ── Draw helpers ──────────────────────────────────────── */
  function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // White base
    ctx.fillStyle = '#f0ebe0';
    ctx.fillRect(0, 0, w, h);

    // Draw classroom photo at 60% opacity (cover entire canvas)
    const img = bgImgRef.current;
    if (img && img.complete) {
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > canvasRatio) {
        sw = img.height * canvasRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / canvasRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.globalAlpha = 0.6;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  function drawStudent(ctx: CanvasRenderingContext2D, w: number, h: number, bx: number) {
    const cx = bx;
    const baseY = h * 0.84;
    const s = h * 0.00056; // scale factor (20% of original)

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ── Ground shadow ─────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Backpack (behind character — draw first so body goes on top) ──
    // Pack body (slightly right of center, peeking from behind)
    ctx.fillStyle = '#8b7355';
    ctx.beginPath();
    ctx.roundRect(14 * s, -110 * s, 26 * s, 38 * s, 4 * s);
    ctx.fill();
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 1 * s;
    ctx.stroke();
    // Pack top flap — OPEN (flipped back)
    ctx.fillStyle = '#a08860';
    ctx.beginPath();
    ctx.moveTo(14 * s, -110 * s);
    ctx.lineTo(40 * s, -110 * s);
    ctx.lineTo(44 * s, -122 * s);
    ctx.lineTo(10 * s, -122 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 0.8 * s;
    ctx.stroke();
    // Inside of empty bag (dark hollow)
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.roundRect(17 * s, -108 * s, 20 * s, 12 * s, 2 * s);
    ctx.fill();
    // Pocket detail
    ctx.fillStyle = '#6b5335';
    ctx.beginPath();
    ctx.roundRect(18 * s, -98 * s, 18 * s, 14 * s, 3 * s);
    ctx.fill();
    // Buckle
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(24 * s, -94 * s, 6 * s, 3 * s);

    // ── Shoes ─────────────────────────────────────────────
    ctx.fillStyle = '#222222';
    // Left shoe
    ctx.beginPath();
    ctx.roundRect(-18 * s, -12 * s, 16 * s, 10 * s, 3 * s);
    ctx.fill();
    // Right shoe
    ctx.beginPath();
    ctx.roundRect(2 * s, -12 * s, 16 * s, 10 * s, 3 * s);
    ctx.fill();
    // White sole line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(-18 * s, -6 * s); ctx.lineTo(-2 * s, -6 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2 * s,   -6 * s); ctx.lineTo(18 * s, -6 * s); ctx.stroke();

    // ── Pants (dark navy) ─────────────────────────────────
    ctx.fillStyle = '#2c3060';
    ctx.beginPath();
    ctx.roundRect(-16 * s, -65 * s, 14 * s, 54 * s, 2 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2 * s, -65 * s, 14 * s, 54 * s, 2 * s);
    ctx.fill();
    // Pants crease highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(-9 * s, -60 * s); ctx.lineTo(-9 * s, -16 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9 * s,  -60 * s); ctx.lineTo(9 * s,  -16 * s); ctx.stroke();

    // ── Sweater body (khaki/tan — like the reference) ─────
    ctx.fillStyle = '#c8a870';
    ctx.beginPath();
    ctx.roundRect(-20 * s, -120 * s, 40 * s, 58 * s, 5 * s);
    ctx.fill();
    // Sweater horizontal stripes (inner shirt peeking at collar/waist)
    ctx.strokeStyle = '#b09050';
    ctx.lineWidth = 2.5 * s;
    for (let i = 0; i < 4; i++) {
      const sy2 = -112 * s + i * 9 * s;
      ctx.beginPath();
      ctx.moveTo(-18 * s, sy2);
      ctx.lineTo(18 * s, sy2);
      ctx.stroke();
    }
    // Waistband
    ctx.fillStyle = '#a08040';
    ctx.fillRect(-20 * s, -68 * s, 40 * s, 6 * s);

    // Backpack shoulder straps (visible on chest)
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(-6 * s, -118 * s);
    ctx.bezierCurveTo(-6 * s, -100 * s, -10 * s, -90 * s, -8 * s, -70 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14 * s, -118 * s);
    ctx.bezierCurveTo(14 * s, -100 * s, 12 * s, -90 * s, 10 * s, -70 * s);
    ctx.stroke();

    // ── Arms (hanging naturally at sides) ─────────────────
    // Left arm
    ctx.fillStyle = '#c8a870';
    ctx.beginPath();
    ctx.roundRect(-32 * s, -118 * s, 13 * s, 48 * s, 6 * s);
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.roundRect(19 * s, -118 * s, 13 * s, 48 * s, 6 * s);
    ctx.fill();
    // Hands
    ctx.fillStyle = '#f0c8a0';
    ctx.beginPath(); ctx.ellipse(-26 * s, -70 * s, 7 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(26 * s,  -70 * s, 7 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();

    // ── Head ─────────────────────────────────────────────
    ctx.fillStyle = '#f0c8a0';
    ctx.beginPath();
    ctx.ellipse(0, -144 * s, 20 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e8b890';
    ctx.fillRect(-5 * s, -124 * s, 10 * s, 8 * s);

    // ── Hair (black, tousled style like reference) ────────
    ctx.fillStyle = '#1a1a1a';
    // Hair cap
    ctx.beginPath();
    ctx.ellipse(0, -154 * s, 21 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-21 * s, -154 * s, 42 * s, 14 * s);
    // Side tufts
    ctx.beginPath();
    ctx.ellipse(-18 * s, -146 * s, 6 * s, 10 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18 * s, -146 * s, 6 * s, 10 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Front hair swoosh
    ctx.beginPath();
    ctx.moveTo(-10 * s, -162 * s);
    ctx.bezierCurveTo(-6 * s, -168 * s, 4 * s, -168 * s, 8 * s, -162 * s);
    ctx.bezierCurveTo(4 * s, -156 * s, -6 * s, -158 * s, -10 * s, -162 * s);
    ctx.fill();

    // ── Glasses ───────────────────────────────────────────
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 1.5 * s;
    ctx.fillStyle = 'rgba(180,220,255,0.45)';
    // Left lens
    ctx.beginPath(); ctx.roundRect(-14 * s, -149 * s, 11 * s, 9 * s, 2.5 * s); ctx.fill(); ctx.stroke();
    // Right lens
    ctx.beginPath(); ctx.roundRect(3 * s, -149 * s, 11 * s, 9 * s, 2.5 * s); ctx.fill(); ctx.stroke();
    // Bridge
    ctx.beginPath(); ctx.moveTo(-3 * s, -145 * s); ctx.lineTo(3 * s, -145 * s); ctx.stroke();
    // Side temples
    ctx.beginPath(); ctx.moveTo(-14 * s, -145 * s); ctx.lineTo(-20 * s, -144 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14 * s,  -145 * s); ctx.lineTo(20 * s,  -144 * s); ctx.stroke();
    // Pupils — looking straight forward
    ctx.fillStyle = '#1a1208';
    ctx.beginPath(); ctx.arc(-8.5 * s, -145 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8.5 * s,  -145 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    // Shine dot
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(-7 * s, -147 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10 * s, -147 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();

    // Mouth — slight neutral/alert expression
    ctx.strokeStyle = '#8b4a20';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(-4 * s, -134 * s);
    ctx.lineTo(4 * s,  -134 * s);
    ctx.stroke();

    // ── Ear details ───────────────────────────────────────
    ctx.fillStyle = '#e8b890';
    ctx.beginPath(); ctx.ellipse(-20 * s, -143 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20 * s,  -143 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  function drawAPlus(ctx: CanvasRenderingContext2D, item: APlusItem) {
    if (item.caught && item.sparkle <= 0) return;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);

    if (item.caught && item.sparkle > 0) {
      const alpha = item.sparkle / 30;
      ctx.globalAlpha = alpha;
      const s = item.size * (1 + (30 - item.sparkle) * 0.06);
      // Glow
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(251,191,36,${alpha})`;
      ctx.font = `bold ${s}px "Noto Sans KR", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A+', 0, 0);
    } else if (!item.caught) {
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#111111';
      ctx.font = `bold ${item.size}px "Noto Sans KR", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A+', 0, 0);
      // Subtle circle background
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.fillText('A+', 0, 0);
    }
    ctx.restore();
  }

  function drawSparks(ctx: CanvasRenderingContext2D) {
    const g = G.current;
    for (const sp of g.sparks) {
      ctx.save();
      ctx.globalAlpha = sp.life / 25;
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3 + (1 - sp.life / 25) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number, score: number, timeLeft: number) {
    // Score badge
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.roundRect(12, 12, 120, 44, 12); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = `bold ${Math.round(w * 0.035)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`${score}점`, 22, 42);

    // Timer bar
    const barW = w - 24;
    const barH = 8;
    const barX = 12;
    const barY = h * 0.03;
    // Track
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 4); ctx.fill();
    // Fill
    const frac = timeLeft / GAME_DURATION;
    const barColor = frac > 0.5 ? '#10b981' : frac > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = barColor;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * frac, barH, 4); ctx.fill();

    // Time text
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.roundRect(w - 80, 12, 68, 44, 12); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(w * 0.035)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${timeLeft}s`, w - 18, 42);
  }

  /* ── Game loop ─────────────────────────────────────────── */
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = G.current;
    if (g.phase !== 'PLAYING') return;

    const w = canvas.width;
    const h = canvas.height;
    g.frame++;

    const nowMs   = Date.now();
    const elapsed = (nowMs - g.startMs) / 1000;
    const newTime = Math.max(0, GAME_DURATION - Math.floor(elapsed));
    if (newTime !== g.timeLeft) {
      g.timeLeft = newTime;
      setDispTime(newTime);
    }
    if (elapsed >= GAME_DURATION) {
      endGame();
      return;
    }

    /* spawn — interval decreases from 130 frames → 60 over 30s */
    const spawnInterval = Math.round(130 - (elapsed / GAME_DURATION) * 70);
    if (g.frame - g.lastSpawn >= spawnInterval) {
      g.lastSpawn = g.frame;
      const baseSpeed = (2.5 + (elapsed / GAME_DURATION) * 3.5) * 1.4;
      g.items.push({
        id: g.nextId++,
        x: w * (0.1 + Math.random() * 0.8),
        y: -30,
        vy: baseSpeed * (0.8 + Math.random() * 0.4),
        rot: (Math.random() - 0.5) * 0.3,
        rotV: (Math.random() - 0.5) * 0.015,
        size: 26 + Math.random() * 12,
        caught: false, missed: false, sparkle: 0, sx: 0, sy: 0,
      });
    }

    /* update items */
    // Character body bounds (matches drawStudent with scale = h * 0.00056)
    const charScale  = h * 0.00056;
    const baseY      = h * 0.84;
    const charHalfW  = 38 * charScale;  // standing character body width
    const charTop    = baseY - 170 * charScale; // top of head (standing pose)

    for (const item of g.items) {
      if (item.caught) {
        item.sparkle = Math.max(0, item.sparkle - 1);
        continue;
      }
      if (item.missed) continue;

      item.y  += item.vy;
      item.rot += item.rotV;

      // Catch detection — A+ touches anywhere on the character body
      const hitX = Math.abs(item.x - g.basketX) < charHalfW + item.size * 0.35;
      const hitY = item.y >= charTop - item.size * 0.4 && item.y <= baseY;

      if (hitX && hitY) {
        item.caught  = true;
        item.sparkle = 30;
        item.sx = item.x; item.sy = item.y;
        g.score = Math.min(9999, g.score + CATCH_PTS);
        setDispScore(g.score);
        // Burst sparks
        const colors = ['#fbbf24','#f59e0b','#34d399','#60a5fa','#f472b6'];
        for (let i = 0; i < 14; i++) {
          g.sparks.push({
            x: item.x, y: item.y,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 6 - 1,
            life: 20 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      } else if (item.y > h + 20) {
        item.missed = true;
        g.score = Math.max(0, g.score - MISS_PTS);
        setDispScore(g.score);
      }
    }

    /* update sparks */
    for (const sp of g.sparks) {
      sp.x += sp.vx; sp.y += sp.vy;
      sp.vy += 0.25;
      sp.life--;
    }
    g.sparks   = g.sparks.filter(sp => sp.life > 0);
    g.items    = g.items.filter(i => !(i.missed) && !(i.caught && i.sparkle === 0));

    /* draw */
    ctx.clearRect(0, 0, w, h);
    drawBackground(ctx, w, h);
    for (const item of g.items) drawAPlus(ctx, item);
    drawSparks(ctx);
    drawStudent(ctx, w, h, g.basketX);
    drawHUD(ctx, w, h, g.score, g.timeLeft);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const endGame = useCallback(() => {
    const g = G.current;
    cancelAnimationFrame(rafRef.current);
    g.phase = 'END';
    setPhase('END');
    updateScore('game2', g.score);
    setDispScore(g.score);
  }, [updateScore]);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = G.current;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width  = w;
    canvas.height = h;
    g.canvasW = w; g.canvasH = h;
    g.phase    = 'PLAYING';
    g.score    = 0;
    g.timeLeft = GAME_DURATION;
    g.startMs  = Date.now();
    g.frame    = 0;
    g.lastSpawn = 0;
    g.basketX  = w / 2;
    g.items    = [];
    g.sparks   = [];
    g.nextId   = 0;
    setPhase('PLAYING');
    setDispScore(0);
    setDispTime(GAME_DURATION);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  /* ── Pointer / touch handlers ──────────────────────────── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (G.current.phase !== 'PLAYING') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    G.current.dragging = true;
    G.current.basketX  = e.nativeEvent.offsetX;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!G.current.dragging || G.current.phase !== 'PLAYING') return;
    const bw2 = G.current.basketW / 2;
    const cw  = G.current.canvasW || canvasRef.current?.width || 400;
    G.current.basketX = Math.max(bw2, Math.min(cw - bw2, e.nativeEvent.offsetX));
  }, []);

  const handlePointerUp = useCallback(() => {
    G.current.dragging = false;
  }, []);

  /* Resize canvas when playing */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      if (G.current.phase === 'PLAYING') {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        G.current.canvasW = canvas.offsetWidth;
        G.current.canvasH = canvas.offsetHeight;
      }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* ── Render ────────────────────────────────────────────── */
  const grade = getGrade(dispScore);

  return (
    <div style={{
      minHeight: '100dvh', width: '100%', display: 'flex', flexDirection: 'column',
      background: '#1a1a2e', position: 'relative', overflow: 'hidden',
      touchAction: 'none', userSelect: 'none',
    }}>
      {/* Back button */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 50 }}>
        <Link href="/select">
          <button
            data-testid="btn-back"
            style={{ padding: 8, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex' }}
          >
            <ChevronLeft style={{ width: 24, height: 24, color: 'white' }} />
          </button>
        </Link>
      </div>

      {/* Canvas — always mounted so ref is stable */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          cursor: phase === 'PLAYING' ? 'grab' : 'default',
          display: phase === 'END' ? 'none' : 'block',
        }}
      />

      {/* IDLE screen */}
      {phase === 'IDLE' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
          background: 'linear-gradient(180deg,#12172b,#1a2240)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fbbf24', margin: '0 0 10px', textShadow: '0 4px 20px rgba(251,191,36,0.5)' }}>
            A+ 받기 특훈
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.7, marginBottom: 8 }}>
            하늘에서 <b style={{ color: '#fbbf24' }}>A+</b>이 떨어집니다!<br />
            <b style={{ color: '#34d399' }}>드래그</b>로 바구니를 움직여 받으세요.
          </p>
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 32 }}>놓치면 <b>-{MISS_PTS}점</b> 감점!</p>
          <button
            data-testid="btn-start"
            onClick={startGame}
            style={{
              background: '#d97706', color: 'white', fontWeight: 900,
              padding: '16px 44px', borderRadius: 50, fontSize: 22,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 6px 0 #92400e, 0 12px 30px rgba(217,119,6,0.4)',
            }}
          >
            시작!
          </button>
        </div>
      )}

      {/* END screen */}
      {phase === 'END' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 24,
          background: 'linear-gradient(180deg,#12172b,#1a2240)',
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '36px 32px',
            textAlign: 'center', maxWidth: 340, width: '100%',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: grade.color, lineHeight: 1, marginBottom: 4 }}>
              {grade.grade}
            </div>
            <div style={{
              display: 'inline-block',
              background: grade.bg, color: grade.color,
              fontWeight: 700, fontSize: 14, padding: '4px 14px',
              borderRadius: 20, marginBottom: 16,
            }}>
              {grade.msg}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>획득 점수</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: '#1e293b', fontFamily: 'monospace' }}>{dispScore}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>최대 가능</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: '#94a3b8', fontFamily: 'monospace' }}>{MAX_SCORE}</div>
              </div>
            </div>

            {/* Grade scale */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 12 }}>
              {[
                { g: 'A+', range: '상위 10%', c: '#d97706' },
                { g: 'A',  range: '10~20%',  c: '#059669' },
                { g: 'B+', range: '20~30%',  c: '#2563eb' },
                { g: 'B',  range: '30~40%',  c: '#7c3aed' },
                { g: 'F',  range: '40% 이하', c: '#dc2626' },
              ].map(row => (
                <div key={row.g} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '3px 0',
                  fontWeight: row.g === grade.grade ? 900 : 400,
                  background: row.g === grade.grade ? grade.bg : 'transparent',
                  borderRadius: 6, paddingLeft: 6, paddingRight: 6,
                }}>
                  <span style={{ color: row.c, fontWeight: 900, fontSize: 14, width: 24 }}>{row.g}</span>
                  <span style={{ color: '#64748b' }}>{row.range}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                data-testid="btn-retry"
                onClick={startGame}
                style={{
                  flex: 1, background: '#d97706', color: 'white',
                  padding: '14px 0', borderRadius: 14, fontWeight: 900,
                  border: 'none', cursor: 'pointer', fontSize: 15,
                  boxShadow: '0 4px 0 #92400e',
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
        </div>
      )}
    </div>
  );
}
