import React, { createContext, useContext, useState, useEffect } from 'react';

type GameScores = {
  game1: number;
  game2: number;
  game3: number;
  game4: number;
};

type GameContextType = {
  scores: GameScores;
  tier: string;
  totalScore: number;
  percentile: number;
  updateScore: (game: keyof GameScores, score: number) => void;
};

const defaultScores: GameScores = {
  game1: 0,
  game2: 0,
  game3: 0,
  game4: 0,
};

const TIERS = [
  { max: 100, min: 90, name: "제적 위기" },
  { max: 89, min: 75, name: "학사경고" },
  { max: 74, min: 60, name: "재수강러" },
  { max: 59, min: 45, name: "C학점 생존자" },
  { max: 44, min: 30, name: "B급 인재" },
  { max: 29, min: 15, name: "A학점 도전자" },
  { max: 14, min: 5, name: "장학금 수령자" },
  { max: 4, min: 0, name: "명예 교수" },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [scores, setScores] = useState<GameScores>(() => {
    const saved = localStorage.getItem('creditAbandoner_scores');
    return saved ? JSON.parse(saved) : defaultScores;
  });

  useEffect(() => {
    localStorage.setItem('creditAbandoner_scores', JSON.stringify(scores));
  }, [scores]);

  const updateScore = (game: keyof GameScores, score: number) => {
    setScores(prev => ({
      ...prev,
      [game]: Math.max(prev[game], score)
    }));
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentile = Math.max(0, Math.min(100, Math.round((1 - totalScore / 10000) * 100)));
  
  const tier = TIERS.find(t => percentile <= t.max && percentile >= t.min)?.name || "학사경고";

  return (
    <GameContext.Provider value={{ scores, tier, totalScore, percentile, updateScore }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
