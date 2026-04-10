import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Briefcase, Package, Coffee, BookOpen, ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const GAMES = [
  {
    id: 'game1',
    path: '/game1',
    name: '교수님, 가방 닫으세요',
    desc: '눈보다 빠른 손! 가방이 열리기 전에 닫아라!',
    icon: Briefcase,
    color: 'bg-rose-500',
    shadow: 'shadow-[0_6px_0_rgb(190,18,60)]',
    activeShadow: 'active:shadow-[0_0px_0_rgb(190,18,60)]',
  },
  {
    id: 'game2',
    path: '/game2',
    name: '학점 수거함 : 줍지 않으면 F',
    desc: '택배 상자를 피해 커피를 사수하라!',
    icon: Package,
    color: 'bg-blue-500',
    shadow: 'shadow-[0_6px_0_rgb(29,78,216)]',
    activeShadow: 'active:shadow-[0_0px_0_rgb(29,78,216)]',
  },
  {
    id: 'game3',
    path: '/game3',
    name: '오늘 밤도 카페인 엔딩',
    desc: '10초 동안 미친듯이 커피를 들이켜라!',
    icon: Coffee,
    color: 'bg-amber-500',
    shadow: 'shadow-[0_6px_0_rgb(180,83,9)]',
    activeShadow: 'active:shadow-[0_0px_0_rgb(180,83,9)]',
  },
  {
    id: 'game4',
    path: '/game4',
    name: '열공 모드',
    desc: '5분 동안 딴짓하지 않고 버티기 (불가능)',
    icon: BookOpen,
    color: 'bg-emerald-500',
    shadow: 'shadow-[0_6px_0_rgb(4,120,87)]',
    activeShadow: 'active:shadow-[0_0px_0_rgb(4,120,87)]',
  }
];

export default function GameSelect() {
  const { scores } = useGame();

  return (
    <div className="min-h-[100dvh] bg-background w-full p-4 md:p-8 flex flex-col max-w-2xl mx-auto">
      <div className="flex items-center mb-8 pt-4">
        <Link href="/">
          <button data-testid="btn-back" className="p-2 bg-card rounded-full shadow-sm border border-card-border hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        </Link>
        <h1 className="text-2xl font-black text-foreground ml-4">게임 선택</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map((game, i) => {
          const Icon = game.icon;
          const bestScore = scores[game.id as keyof typeof scores] || 0;

          return (
            <Link key={game.id} href={game.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`card-${game.id}`}
                className={`cursor-pointer rounded-3xl p-6 text-white ${game.color} ${game.shadow} ${game.activeShadow} active:translate-y-[6px] transition-transform flex flex-col h-full relative overflow-hidden`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex flex-col items-center">
                    <span className="text-[10px] opacity-70">BEST</span>
                    <span className="font-mono">{bestScore}</span>
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <h2 className="text-xl font-black mb-2 drop-shadow-md">{game.name}</h2>
                  <p className="text-white/90 text-sm font-medium leading-snug">{game.desc}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
