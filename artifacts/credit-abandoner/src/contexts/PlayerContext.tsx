import React, { createContext, useContext, useState, useCallback } from 'react';
import { submitScore } from '../lib/api';

export interface PlayerInfo {
  nickname: string;
  schoolId: number;
  schoolName: string;
}

interface PlayerContextType {
  player: PlayerInfo | null;
  setPlayer: (info: PlayerInfo) => void;
  clearPlayer: () => void;
  submitGameScore: (gameId: number, score: number) => Promise<void>;
}

const STORAGE_KEY = 'creditAbandoner_player';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayerState] = useState<PlayerInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPlayer = useCallback((info: PlayerInfo) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setPlayerState(info);
  }, []);

  const clearPlayer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayerState(null);
  }, []);

  const submitGameScore = useCallback(async (gameId: number, score: number) => {
    if (!player) return;
    try {
      await submitScore({
        nickname: player.nickname,
        schoolId: player.schoolId,
        gameId,
        score,
      });
    } catch (err) {
      console.error('Score submission failed:', err);
    }
  }, [player]);

  return (
    <PlayerContext.Provider value={{ player, setPlayer, clearPlayer, submitGameScore }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
