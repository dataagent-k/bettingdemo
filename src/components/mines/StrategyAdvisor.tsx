'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MinesGameState, StrategyRecommendation, NashStrategy } from '@/types/mines';
import { Brain, TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyAdvisorProps {
  gameState: MinesGameState;
  onStrategyModeChange?: (mode: 'conservative' | 'balanced' | 'aggressive') => void;
  currentStrategyMode?: 'conservative' | 'balanced' | 'aggressive';
}

export default function StrategyAdvisor({ 
  gameState, 
  onStrategyModeChange,
  currentStrategyMode = 'balanced'
}: StrategyAdvisorProps) {
  const { nashEquilibrium, strategyRecommendation, gameTheoryMetrics } = gameState;

  if (!nashEquilibrium || !strategyRecommendation) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Nash Strategy Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Start a game to see Nash equilibrium analysis</p>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'reveal': return <Target className="w-4 h-4" />;
      case 'cashOut': return <DollarSign className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'reveal': return 'bg-blue-600';
      case 'cashOut': return 'bg-green-600';
      default: return 'bg-yellow-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Strategy Mode Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Strategy Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['conservative', 'balanced', 'aggressive'] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={currentStrategyMode === mode ? 'default' : 'outline'}
                onClick={() => onStrategyModeChange?.(mode)}
                className={cn(
                  'text-xs',
                  currentStrategyMode === mode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Strategy Recommendation */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Nash Strategy Advisor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Recommendation */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getActionIcon(strategyRecommendation.action)}
                <span className="text-white font-semibold">
                  {strategyRecommendation.action === 'reveal' && strategyRecommendation.tileId !== undefined
                    ? `Reveal Tile ${strategyRecommendation.tileId}`
                    : strategyRecommendation.action === 'cashOut'
                    ? 'Cash Out Now'
                    : 'Continue Playing'
                  }
                </span>
              </div>
              <Badge className={cn(getActionColor(strategyRecommendation.action), 'text-white')}>
                {strategyRecommendation.action.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-slate-300 text-sm mb-3">
              {strategyRecommendation.reasoning}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Confidence:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={strategyRecommendation.confidence * 100} 
                    className="flex-1 h-2"
                  />
                  <span className={getConfidenceColor(strategyRecommendation.confidence)}>
                    {(strategyRecommendation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Risk Level:</span>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <span className={getRiskColor(strategyRecommendation.riskLevel)}>
                    {strategyRecommendation.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-600">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Expected Value:</span>
                <span className="text-green-400">
                  ${strategyRecommendation.expectedValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Nash Equilibrium Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Player EV</div>
              <div className="text-lg font-semibold text-white">
                ${nashEquilibrium.equilibriumPoint.playerExpectedValue.toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">House EV</div>
              <div className="text-lg font-semibold text-white">
                ${nashEquilibrium.equilibriumPoint.houseExpectedValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Equilibrium Status */}
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Equilibrium Status</span>
              <Badge 
                variant={nashEquilibrium.equilibriumPoint.isEquilibrium ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {nashEquilibrium.equilibriumPoint.isEquilibrium ? 'STABLE' : 'UNSTABLE'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Stability:</span>
              <Progress 
                value={nashEquilibrium.equilibriumPoint.stabilityScore * 100} 
                className="flex-1 h-2"
              />
              <span className="text-xs text-white">
                {(nashEquilibrium.equilibriumPoint.stabilityScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Game Theory Metrics */}
          {gameTheoryMetrics && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Game Theory Analysis</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Risk:</span>
                  <span className="text-white">
                    {(gameTheoryMetrics.currentRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optimal Risk:</span>
                  <span className="text-white">
                    {(gameTheoryMetrics.optimalRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deviation:</span>
                  <span className={
                    gameTheoryMetrics.deviationFromEquilibrium < 0.1 
                      ? 'text-green-400' 
                      : gameTheoryMetrics.deviationFromEquilibrium < 0.3 
                      ? 'text-yellow-400' 
                      : 'text-red-400'
                  }>
                    {(gameTheoryMetrics.deviationFromEquilibrium * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Strategy Breakdown</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Cash-Out Threshold:</span>
                <div className="text-white font-semibold">
                  ${nashEquilibrium.playerStrategy.cashOutThreshold.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">House Multiplier:</span>
                <div className="text-white font-semibold">
                  {nashEquilibrium.houseStrategy.optimalMultiplier.toFixed(2)}x
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
