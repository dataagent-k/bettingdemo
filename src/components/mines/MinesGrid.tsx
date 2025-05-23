'use client';

import { MinesGameState } from '@/types/mines';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundManager } from '@/lib/sounds';

interface MinesGridProps {
  gameState: MinesGameState;
  onTileClick: (tileId: number) => void;
}

export default function MinesGrid({ gameState, onTileClick }: MinesGridProps) {
  const { tiles, gameStatus } = gameState;

  const getTileContent = (tile: any) => {
    if (!tile.isRevealed) {
      // Show Nash probability if available
      if (tile.nashProbability !== undefined && gameState.nashEquilibrium) {
        const percentage = Math.round(tile.nashProbability * 100);
        return `${percentage}%`;
      }
      return '?';
    }

    if (tile.isMine) {
      return '💣';
    }

    return '💎';
  };

  const getTileClassName = (tile: any) => {
    const baseClasses = "w-16 h-16 text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95";

    if (!tile.isRevealed) {
      let bgClasses = "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-slate-300 border-slate-500 shadow-lg";

      // Color code based on Nash strategy recommendation
      if (tile.strategyRecommendation === 'reveal') {
        bgClasses = "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white border-green-500 shadow-lg";
      } else if (tile.strategyRecommendation === 'avoid') {
        bgClasses = "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-red-500 shadow-lg";
      }

      return cn(
        baseClasses,
        bgClasses,
        gameStatus === 'playing' ? "cursor-pointer hover:shadow-xl" : "cursor-not-allowed opacity-75"
      );
    }

    if (tile.isMine) {
      return cn(
        baseClasses,
        tile.isExploded
          ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500 animate-pulse shadow-red-500/50 shadow-lg"
          : "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg"
      );
    }

    return cn(
      baseClasses,
      "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30 animate-bounce"
    );
  };

  const handleTileClick = (tileId: number) => {
    const tile = tiles[tileId];
    if (tile.isRevealed || gameStatus !== 'playing') {
      return;
    }

    // Play sound effect
    soundManager.playTileReveal();
    onTileClick(tileId);
  };

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="grid grid-cols-5 gap-3 p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-600 shadow-2xl backdrop-blur-sm">
          {tiles.map((tile, index) => (
            <div key={tile.id} className="relative">
              <Button
                onClick={() => handleTileClick(tile.id)}
                className={getTileClassName(tile)}
                disabled={tile.isRevealed || gameStatus !== 'playing'}
              >
                <span className="relative z-10">
                  {getTileContent(tile)}
                </span>
              </Button>
              {tile.isRevealed && !tile.isMine && (
                <div className="absolute inset-0 bg-green-400/20 rounded-md animate-ping pointer-events-none" />
              )}
              {tile.isExploded && (
                <div className="absolute inset-0 bg-red-500/30 rounded-md animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Game status overlay */}
        {gameStatus === 'lost' && (
          <div className="absolute inset-0 bg-red-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">💥</div>
              <div className="text-xl font-bold">BOOM!</div>
            </div>
          </div>
        )}

        {gameStatus === 'won' && (
          <div className="absolute inset-0 bg-green-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold">YOU WON!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
