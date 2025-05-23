'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameHistory } from '@/types/mines';
import { useAuth } from '@/contexts/AuthContext';

interface GameContextType {
  balance: number;
  gameHistory: GameHistory[];
  userStats: any;
  addToHistory: (game: Omit<GameHistory, 'id' | 'timestamp'>) => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  resetBalance: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, updateBalance: updateAuthBalance, resetBalance: resetAuthBalance } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [userStats, setUserStats] = useState(null);

  const refreshData = useCallback(async () => {
    if (!user) {
      setGameHistory([]);
      setUserStats(null);
      return;
    }

    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGameHistory(data.gameHistory || []);
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addToHistory = useCallback(async (game: Omit<GameHistory, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const newBalance = user.balance + (game.result === 'win' ? game.payout - game.betAmount : -game.betAmount);

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: game.betAmount,
          mineCount: game.mineCount,
          revealedTiles: game.revealedTiles,
          result: game.result,
          payout: game.payout,
          multiplier: game.payout / game.betAmount,
          newBalance,
        }),
      });

      if (response.ok) {
        await updateAuthBalance(newBalance);
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding game to history:', error);
    }
  }, [user, updateAuthBalance, refreshData]);

  const updateBalance = useCallback(async (amount: number) => {
    if (!user) return;
    const newBalance = Math.max(0, user.balance + amount);
    await updateAuthBalance(newBalance);
  }, [user, updateAuthBalance]);

  const resetBalance = useCallback(async () => {
    await resetAuthBalance();
    await refreshData();
  }, [resetAuthBalance, refreshData]);

  return (
    <GameContext.Provider value={{
      balance: user?.balance || 0,
      gameHistory,
      userStats,
      addToHistory,
      updateBalance,
      resetBalance,
      refreshData,
    }}>
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
