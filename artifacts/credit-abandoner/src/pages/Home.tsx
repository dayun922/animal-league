import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { usePlayer } from '../contexts/PlayerContext';
import { LionMascot } from '../components/LionMascot';
import { TierBadge } from '../components/TierBadge';
import { Play, Trophy, Sparkles, LogOut, Medal } from 'lucide-react';

export default function Home() {
  const { totalScore, tier, percentile, scores } = useGame();
  const { player, clearPlayer } = usePlayer();
  const [, navigate] = useLocation();

  const handleChangePlayer = () => {
    clearPlayer();
    navigate('/entry');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-yellow-400 opacity-50">
        <Sparkles className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 right-10 text-primary opacity-30">
        <Sparkles className="w-16 h-16" />
      </div>

      {/* Player Info Bar */}
      {player && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-4 z-10"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-card-border/60 rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground text-xs">플레이어</span>
              <div className="font-black text-foreground text-base">{player.nickname}</div>
              <div className="text-xs text-muted-foreground">{player.schoolName}</div>
            </div>
            <button
              onClick={handleChangePlayer}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              변경
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10"
      >
        <h2 className="text-primary font-bold tracking-widest text-lg mb-2">공부 빼고 다 재밌는 사람들의 대결</h2>
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-orange-500 to-accent mb-8 leading-tight py-2 drop-shadow-sm">
          학점 포기자
        </h1>
      </motion.div>

      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="mb-8 z-10"
      >
        <LionMascot state="happy" className="w-40 h-40 drop-shadow-xl" />
      </motion.div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mb-10 z-10"
      >
        <TierBadge tier={tier} percentile={percentile} className="mb-4 text-2xl px-6 py-3" />
        
        <div className="bg-card rounded-3xl p-6 shadow-xl border border-card-border flex flex-col items-center min-w-[280px]">
          <div className="text-muted-foreground font-bold mb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            총점
          </div>
          <div className="text-5xl font-black text-foreground font-mono">
            {totalScore.toLocaleString()}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="z-10 w-full max-w-md"
      >
        <Link href="/select" className="w-full">
          <button data-testid="btn-start" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-2xl py-6 rounded-full shadow-[0_8px_0_hsl(15,90%,45%)] active:shadow-[0_0px_0_hsl(15,90%,45%)] active:translate-y-[8px] transition-all flex items-center justify-center gap-3 mb-4">
            <Play fill="currentColor" className="w-8 h-8" />
            게임 시작하기
          </button>
        </Link>

        {/* Leaderboard button */}
        <Link href="/leaderboard" className="w-full">
          <button className="w-full bg-card hover:bg-card/80 text-foreground font-bold text-lg py-4 rounded-full border-2 border-card-border flex items-center justify-center gap-3 mb-8 transition-colors">
            <Medal className="w-6 h-6 text-yellow-400" />
            실시간 순위 보기
          </button>
        </Link>

        {/* Small score cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'game1', name: '가방 닫기', score: scores.game1 },
            { id: 'game2', name: '드랍쉽', score: scores.game2 },
            { id: 'game3', name: '커피 연타', score: scores.game3 },
            { id: 'game4', name: '열공 모드', score: scores.game4 },
          ].map((game) => (
            <div key={game.id} className="bg-card/80 backdrop-blur-sm p-3 rounded-2xl border border-card-border/50 text-center shadow-sm">
              <div className="text-xs font-bold text-muted-foreground mb-1">{game.name}</div>
              <div className="font-mono font-bold text-lg text-foreground">{game.score}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
