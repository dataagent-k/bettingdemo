'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GameHelp() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        How to Play
      </Button>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg">How to Play Mines</CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-white font-semibold mb-2">🎯 Objective</h3>
          <p className="text-slate-300 text-sm">
            Reveal as many safe tiles as possible without hitting a mine. The more tiles you reveal, the higher your multiplier!
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">🎮 How to Play</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Set your bet amount and number of mines</li>
            <li>• Click "Start Game" to begin</li>
            <li>• Click tiles to reveal them</li>
            <li>• Cash out anytime to secure your winnings</li>
            <li>• Hit a mine and lose everything!</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">💰 Payouts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Difficulty:</span>
              <div className="flex gap-2">
                <Badge className="bg-green-600 text-xs">Easy (3 mines)</Badge>
                <Badge className="bg-yellow-600 text-xs">Medium (5 mines)</Badge>
                <Badge className="bg-red-600 text-xs">Hard (8 mines)</Badge>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Higher risk = Higher rewards! More mines mean bigger multipliers.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">💡 Tips</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Start with smaller bets to learn the game</li>
            <li>• Cash out early for guaranteed smaller wins</li>
            <li>• Higher mine counts = higher risk but bigger rewards</li>
            <li>• Watch the probability indicator for guidance</li>
          </ul>
        </div>

        <div className="border-t border-slate-600 pt-4">
          <p className="text-slate-400 text-xs text-center">
            Remember: Gambling should be fun! Only bet what you can afford to lose.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
