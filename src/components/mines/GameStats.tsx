'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MinesGameState } from '@/types/mines';

interface GameStatsProps {
  gameState: MinesGameState;
}

export default function GameStats({ gameState }: GameStatsProps) {
  const {
    mineCount,
    revealedCount,
    betAmount,
    currentMultiplier,
    potentialWin,
    gameStatus,
    tiles
  } = gameState;

  const safeTilesRemaining = (25 - mineCount) - revealedCount;
  const totalTilesRemaining = 25 - revealedCount - tiles.filter(t => t.isRevealed && t.isMine).length;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Game Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">Bet Amount:</span>
          <Badge variant="outline" className="text-green-400 border-green-400">
            ${betAmount.toFixed(2)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">Mines:</span>
          <Badge variant="destructive">
            {mineCount}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">Revealed:</span>
          <Badge variant="secondary">
            {revealedCount}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">Safe Tiles Left:</span>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {safeTilesRemaining}
          </Badge>
        </div>

        <div className="border-t border-slate-600 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Multiplier:</span>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              {currentMultiplier.toFixed(2)}x
            </Badge>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-300 text-sm">Potential Win:</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              ${potentialWin.toFixed(2)}
            </Badge>
          </div>
        </div>

        {gameStatus === 'playing' && revealedCount > 0 && (
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <div className="text-center">
              <p className="text-slate-300 text-xs mb-1">Next tile probability:</p>
              <p className="text-white font-bold">
                {((safeTilesRemaining / totalTilesRemaining) * 100).toFixed(1)}% safe
              </p>
              <p className="text-red-400 text-sm">
                {(((mineCount - tiles.filter(t => t.isRevealed && t.isMine).length) / totalTilesRemaining) * 100).toFixed(1)}% mine
              </p>
            </div>
          </div>
        )}

        {gameStatus === 'won' && (
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-600">
            <p className="text-green-400 text-center font-bold">
              🎉 You Won! 🎉
            </p>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="bg-red-900/30 p-3 rounded-lg border border-red-600">
            <p className="text-red-400 text-center font-bold">
              💥 Game Over 💥
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
