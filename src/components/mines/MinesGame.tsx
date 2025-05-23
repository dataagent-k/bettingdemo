'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MinesGameState, GameSettings } from '@/types/mines';
import { startNewGame, revealTile, cashOut } from '@/lib/mines-game';
import { useGame } from '@/contexts/GameContext';
import { soundManager } from '@/lib/sounds';
import MinesGrid from './MinesGrid';
import GameStats from './GameStats';

export default function MinesGame() {
  const { balance, updateBalance, addToHistory } = useGame();
  const [gameState, setGameState] = useState<MinesGameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    gridSize: 25,
    mineCount: 5,
    betAmount: 10,
  });

  const handleStartGame = useCallback(() => {
    if (settings.betAmount > balance) {
      alert('Insufficient balance!');
      return;
    }

    updateBalance(-settings.betAmount);
    const newGame = startNewGame(settings);
    setGameState(newGame);
  }, [settings, balance, updateBalance]);

  const handleTileClick = useCallback((tileId: number) => {
    if (!gameState) return;

    const newGameState = revealTile(gameState, tileId);
    setGameState(newGameState);

    if (newGameState.gameStatus === 'lost') {
      // Game over - no payout
      soundManager.playLoss();
      addToHistory({
        betAmount: settings.betAmount,
        mineCount: settings.mineCount,
        revealedTiles: newGameState.revealedCount,
        result: 'loss',
        payout: 0,
      });
      setTimeout(() => {
        alert(`Game Over! You hit a mine. Lost $${settings.betAmount}`);
      }, 500);
    } else if (newGameState.gameStatus === 'won') {
      // Auto cash out on win
      const payout = newGameState.potentialWin;
      soundManager.playWin();
      updateBalance(payout);
      addToHistory({
        betAmount: settings.betAmount,
        mineCount: settings.mineCount,
        revealedTiles: newGameState.revealedCount,
        result: 'win',
        payout,
      });
      setTimeout(() => {
        alert(`Congratulations! You won $${payout.toFixed(2)}!`);
      }, 500);
    }
  }, [gameState, settings, addToHistory, updateBalance]);

  const handleCashOut = useCallback(() => {
    if (!gameState) return;

    const payout = cashOut(gameState);
    if (payout > 0) {
      soundManager.playCashOut();
      updateBalance(payout);
      addToHistory({
        betAmount: settings.betAmount,
        mineCount: settings.mineCount,
        revealedTiles: gameState.revealedCount,
        result: 'win',
        payout,
      });
      setGameState(prev => prev ? { ...prev, gameStatus: 'won' } : null);
      alert(`Cashed out! You won $${payout.toFixed(2)}!`);
    }
  }, [gameState, updateBalance, addToHistory, settings]);

  const handleNewGame = useCallback(() => {
    setGameState(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return; // Don't trigger when typing in inputs

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
          event.preventDefault();
          if (canStartGame) {
            handleStartGame();
          } else if (canCashOut) {
            handleCashOut();
          }
          break;
        case 'n':
          if (gameState && gameState.gameStatus !== 'playing') {
            handleNewGame();
          }
          break;
        case 'escape':
          if (gameState && gameState.gameStatus !== 'playing') {
            handleNewGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleStartGame, handleCashOut, handleNewGame]);

  const canStartGame = !gameState || gameState.gameStatus !== 'playing';
  const canCashOut = gameState?.gameStatus === 'playing' && gameState.revealedCount > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="betAmount" className="text-slate-300">Bet Amount ($)</Label>
              <Input
                id="betAmount"
                type="number"
                min="1"
                max={balance}
                value={settings.betAmount}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  betAmount: Math.max(1, parseInt(e.target.value) || 1)
                }))}
                disabled={gameState?.gameStatus === 'playing'}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="mineCount" className="text-slate-300">Number of Mines</Label>
              <Input
                id="mineCount"
                type="number"
                min="1"
                max="20"
                value={settings.mineCount}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mineCount: Math.max(1, Math.min(20, parseInt(e.target.value) || 5))
                }))}
                disabled={gameState?.gameStatus === 'playing'}
                className="bg-slate-700 border-slate-600 text-white"
              />

              {/* Quick preset buttons */}
              <div className="flex gap-2 mt-2">
                {[
                  { mines: 3, label: 'Easy', color: 'bg-green-600 hover:bg-green-700' },
                  { mines: 5, label: 'Medium', color: 'bg-yellow-600 hover:bg-yellow-700' },
                  { mines: 8, label: 'Hard', color: 'bg-red-600 hover:bg-red-700' },
                ].map((preset) => (
                  <Button
                    key={preset.mines}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, mineCount: preset.mines }))}
                    disabled={gameState?.gameStatus === 'playing'}
                    className={`${preset.color} text-xs`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {canStartGame ? (
                <Button
                  onClick={handleStartGame}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={settings.betAmount > balance}
                >
                  Start Game (${settings.betAmount})
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={handleCashOut}
                    disabled={!canCashOut}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Cash Out (${gameState?.potentialWin.toFixed(2) || '0.00'})
                  </Button>
                  <Button
                    onClick={handleNewGame}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    New Game
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {gameState && <GameStats gameState={gameState} />}
      </div>

      {/* Game Grid */}
      <div className="lg:col-span-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Mines Game</CardTitle>
              {gameState && (
                <Badge
                  variant={
                    gameState.gameStatus === 'playing' ? 'default' :
                    gameState.gameStatus === 'won' ? 'secondary' : 'destructive'
                  }
                  className="text-sm"
                >
                  {gameState.gameStatus.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {gameState ? (
              <MinesGrid
                gameState={gameState}
                onTileClick={handleTileClick}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-slate-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Ready to play?</p>
                  <p className="text-sm">Set your bet amount and click "Start Game"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyboard shortcuts info */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-slate-400 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700">
          <span>⌨️ Shortcuts:</span>
          <span><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Space/Enter</kbd> Start/Cash Out</span>
          <span><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">N</kbd> New Game</span>
          <span><kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Esc</kbd> Reset</span>
        </div>
      </div>
    </div>
  );
}
