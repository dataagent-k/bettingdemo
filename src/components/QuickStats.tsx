'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';

export default function QuickStats() {
  const { userStats, balance } = useGame();

  if (!userStats) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">
            Sign in to see your stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalGames = userStats.total_games || 0;
  const wins = userStats.total_wins || 0;
  const losses = userStats.total_losses || 0;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  const totalWagered = userStats.total_wagered || 0;
  const totalWon = userStats.total_won || 0;
  const netProfit = totalWon - totalWagered;

  if (totalGames === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">
            Play some games to see your stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalGames}</div>
            <div className="text-sm text-slate-400">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{winRate}%</div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              {wins} Wins
            </Badge>
          </div>
          <div className="text-center">
            <Badge variant="destructive" className="text-sm">
              {losses} Losses
            </Badge>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-4">
          <div className="text-center">
            <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
            </div>
            <div className="text-sm text-slate-400">Net Profit</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">${(userStats.biggest_win || 0).toFixed(2)}</div>
            <div className="text-sm text-slate-400">Biggest Win</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{userStats.longest_win_streak || 0}</div>
            <div className="text-sm text-slate-400">Best Streak</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-white">${balance.toFixed(2)}</div>
          <div className="text-sm text-slate-400">Current Balance</div>
        </div>
      </CardContent>
    </Card>
  );
}
