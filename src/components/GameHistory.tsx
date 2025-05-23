'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';

export default function GameHistory() {
  const { gameHistory } = useGame();

  if (gameHistory.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">
            No games played yet. Start playing to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {gameHistory.slice(0, 10).map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-center space-x-3">
                <Badge
                  variant={game.result === 'win' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {game.result.toUpperCase()}
                </Badge>
                <div className="text-sm text-slate-300">
                  <div>Bet: ${game.bet_amount}</div>
                  <div className="text-xs text-slate-400">
                    {game.mine_count} mines, {game.revealed_tiles} revealed
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    game.result === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {game.result === 'win' ? '+' : '-'}${Math.abs(
                    game.result === 'win' ? game.payout - game.bet_amount : game.bet_amount
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(game.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
