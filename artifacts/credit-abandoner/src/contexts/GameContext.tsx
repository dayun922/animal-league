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
  resetScores: () => void;
};

const defaultScores: GameScores = { game1: 0, game2: 0, game3: 0, game4: 0 };

const SCORES_KEY   = 'creditAbandoner_scores';
const RESET_DATE_KEY = 'creditAbandoner_resetDate';

const TIERS = [
  { max: 100, min: 90, name: "제적 위기" },
  { max: 89,  min: 75, name: "학사경고" },
  { max: 74,  min: 60, name: "재수강러" },
  { max: 59,  min: 45, name: "C학점 생존자" },
  { max: 44,  min: 30, name: "B급 인재" },
  { max: 29,  min: 15, name: "A학점 도전자" },
  { max: 14,  min: 5,  name: "장학금 수령자" },
  { max: 4,   min: 0,  name: "명예 교수" },
];

/** 한국 시간(KST) 기준 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 */
function todayKST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [scores, setScores] = useState<GameScores>(() => {
    const savedDate  = localStorage.getItem(RESET_DATE_KEY);
    const savedScores = localStorage.getItem(SCORES_KEY);

    // 날짜가 바뀌었으면 초기화
    if (savedDate !== todayKST()) {
      localStorage.setItem(RESET_DATE_KEY, todayKST());
      localStorage.removeItem(SCORES_KEY);
      return defaultScores;
    }

    return savedScores ? JSON.parse(savedScores) : defaultScores;
  });

  // 날짜 감시: 자정이 되면 자동 초기화
  useEffect(() => {
    const checkMidnight = () => {
      const today = todayKST();
      const stored = localStorage.getItem(RESET_DATE_KEY);
      if (stored !== today) {
        localStorage.setItem(RESET_DATE_KEY, today);
        localStorage.removeItem(SCORES_KEY);
        setScores(defaultScores);
      }
    };

    // 자정까지 남은 ms 계산 (KST 기준)
    const nowKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const nextMidnight = new Date(nowKST);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - nowKST.getTime();

    const t = setTimeout(() => {
      checkMidnight();
      // 이후 24시간마다 반복
      const daily = setInterval(checkMidnight, 24 * 60 * 60 * 1000);
      return () => clearInterval(daily);
    }, msUntilMidnight);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  }, [scores]);

  const updateScore = (game: keyof GameScores, score: number) => {
    setScores(prev => ({
      ...prev,
      [game]: Math.max(prev[game], score),
    }));
  };

  const resetScores = () => {
    localStorage.setItem(RESET_DATE_KEY, todayKST());
    localStorage.removeItem(SCORES_KEY);
    setScores(defaultScores);
  };

  const totalScore  = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentile  = Math.max(0, Math.min(100, Math.round((1 - totalScore / 10000) * 100)));
  const tier        = TIERS.find(t => percentile <= t.max && percentile >= t.min)?.name ?? "학사경고";

  return (
    <GameContext.Provider value={{ scores, tier, totalScore, percentile, updateScore, resetScores }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
}
