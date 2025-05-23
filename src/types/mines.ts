export interface MinesTile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isExploded: boolean;
  nashProbability?: number; // Probability of being safe according to Nash equilibrium
  strategyRecommendation?: 'reveal' | 'avoid' | 'neutral';
}

export interface NashStrategy {
  playerStrategy: {
    revealProbabilities: number[]; // Probability of revealing each tile
    cashOutThreshold: number; // Optimal cash-out point
    expectedValue: number;
  };
  houseStrategy: {
    optimalMultiplier: number;
    expectedProfit: number;
    riskAdjustment: number;
  };
  equilibriumPoint: {
    isEquilibrium: boolean;
    playerExpectedValue: number;
    houseExpectedValue: number;
    stabilityScore: number; // How stable this equilibrium is (0-1)
  };
}

export interface StrategyRecommendation {
  action: 'reveal' | 'cashOut' | 'continue';
  tileId?: number;
  confidence: number; // 0-1 scale
  reasoning: string;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MinesGameState {
  tiles: MinesTile[];
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  mineCount: number;
  revealedCount: number;
  betAmount: number;
  currentMultiplier: number;
  potentialWin: number;
  nashEquilibrium?: NashStrategy;
  strategyRecommendation?: StrategyRecommendation;
  gameTheoryMetrics?: {
    currentRisk: number;
    optimalRisk: number;
    deviationFromEquilibrium: number;
  };
}

export interface GameSettings {
  gridSize: number;
  mineCount: number;
  betAmount: number;
  enableNashAdvisor?: boolean;
  strategyMode?: 'conservative' | 'balanced' | 'aggressive';
}

export interface GameHistory {
  id: string;
  betAmount: number;
  mineCount: number;
  revealedTiles: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: Date;
  nashMetrics?: {
    followedRecommendation: boolean;
    deviationScore: number;
    optimalPayout: number;
  };
}
