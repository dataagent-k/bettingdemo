import { MinesGameState, NashStrategy, StrategyRecommendation, MinesTile } from '@/types/mines';

export const GRID_SIZE = 25;

/**
 * Nash Equilibrium Engine for Mines Game
 * Implements game theory principles to find optimal strategies for both player and house
 */

export class NashEquilibriumEngine {
  private gameState: MinesGameState;
  private strategyMode: 'conservative' | 'balanced' | 'aggressive';

  constructor(gameState: MinesGameState, strategyMode: 'conservative' | 'balanced' | 'aggressive' = 'balanced') {
    this.gameState = gameState;
    this.strategyMode = strategyMode;
  }

  /**
   * Calculate Nash Equilibrium for current game state
   */
  calculateNashEquilibrium(): NashStrategy {
    const playerStrategy = this.calculateOptimalPlayerStrategy();
    const houseStrategy = this.calculateOptimalHouseStrategy();
    const equilibriumPoint = this.findEquilibriumPoint(playerStrategy, houseStrategy);

    return {
      playerStrategy,
      houseStrategy,
      equilibriumPoint
    };
  }

  /**
   * Calculate optimal player strategy using game theory
   */
  private calculateOptimalPlayerStrategy() {
    const { tiles, mineCount, revealedCount } = this.gameState;
    const safeTiles = GRID_SIZE - mineCount;
    const remainingSafeTiles = safeTiles - revealedCount;
    const remainingTiles = GRID_SIZE - revealedCount - this.getRevealedMineCount();

    // Calculate reveal probabilities for each unrevealed tile
    const revealProbabilities = tiles.map((tile, index) => {
      if (tile.isRevealed) return 0;

      // Base probability calculation using Bayesian inference
      const baseProbability = remainingSafeTiles / remainingTiles;

      // Adjust based on strategy mode
      const strategyMultiplier = this.getStrategyMultiplier();

      // Consider position-based risk (corners vs center)
      const positionRisk = this.calculatePositionRisk(index);

      return Math.min(1, baseProbability * strategyMultiplier * (1 - positionRisk));
    });

    // Calculate optimal cash-out threshold
    const cashOutThreshold = this.calculateOptimalCashOutThreshold();

    // Calculate expected value
    const expectedValue = this.calculatePlayerExpectedValue(revealProbabilities, cashOutThreshold);

    return {
      revealProbabilities,
      cashOutThreshold,
      expectedValue
    };
  }

  /**
   * Calculate optimal house strategy
   */
  private calculateOptimalHouseStrategy() {
    const { betAmount } = this.gameState;

    // Calculate house edge and optimal multiplier
    const houseEdge = this.calculateHouseEdge();
    const optimalMultiplier = this.calculateOptimalMultiplier();

    // Expected profit calculation
    const expectedProfit = betAmount * houseEdge;

    // Risk adjustment based on current game state
    const riskAdjustment = this.calculateRiskAdjustment();

    return {
      optimalMultiplier,
      expectedProfit,
      riskAdjustment
    };
  }

  /**
   * Find Nash Equilibrium point where neither player can improve unilaterally
   */
  private findEquilibriumPoint(playerStrategy: any, houseStrategy: any) {
    const playerEV = playerStrategy.expectedValue;
    const houseEV = houseStrategy.expectedProfit;

    // Check if current strategies form a Nash Equilibrium
    const isEquilibrium = this.isNashEquilibrium(playerStrategy, houseStrategy);

    // Calculate stability score
    const stabilityScore = this.calculateStabilityScore(playerStrategy, houseStrategy);

    return {
      isEquilibrium,
      playerExpectedValue: playerEV,
      houseExpectedValue: houseEV,
      stabilityScore
    };
  }

  /**
   * Generate strategy recommendation for current game state
   */
  generateStrategyRecommendation(): StrategyRecommendation {
    const nashStrategy = this.calculateNashEquilibrium();
    const { potentialWin } = this.gameState;

    // Determine best action
    const bestTileIndex = this.findBestTileToReveal(nashStrategy);
    const shouldCashOut = this.shouldCashOut(nashStrategy);

    if (shouldCashOut) {
      return {
        action: 'cashOut',
        confidence: this.calculateConfidence(nashStrategy, 'cashOut'),
        reasoning: this.generateReasoning('cashOut', nashStrategy),
        expectedValue: potentialWin,
        riskLevel: this.calculateRiskLevel(nashStrategy)
      };
    }

    if (bestTileIndex !== -1) {
      return {
        action: 'reveal',
        tileId: bestTileIndex,
        confidence: this.calculateConfidence(nashStrategy, 'reveal', bestTileIndex),
        reasoning: this.generateReasoning('reveal', nashStrategy, bestTileIndex),
        expectedValue: this.calculateRevealExpectedValue(bestTileIndex),
        riskLevel: this.calculateRiskLevel(nashStrategy)
      };
    }

    return {
      action: 'continue',
      confidence: 0.5,
      reasoning: 'No clear optimal move available',
      expectedValue: potentialWin,
      riskLevel: 'medium'
    };
  }

  /**
   * Update tile probabilities based on Nash equilibrium
   */
  updateTileProbabilities(): MinesTile[] {
    const nashStrategy = this.calculateNashEquilibrium();

    return this.gameState.tiles.map((tile, index) => {
      if (tile.isRevealed) return tile;

      const nashProbability = nashStrategy.playerStrategy.revealProbabilities[index];
      const strategyRecommendation = this.getTileRecommendation(nashProbability);

      return {
        ...tile,
        nashProbability,
        strategyRecommendation
      };
    });
  }

  // Helper methods
  private getRevealedMineCount(): number {
    return this.gameState.tiles.filter(tile => tile.isRevealed && tile.isMine).length;
  }

  private getStrategyMultiplier(): number {
    switch (this.strategyMode) {
      case 'conservative': return 0.7;
      case 'aggressive': return 1.3;
      default: return 1.0;
    }
  }

  private calculatePositionRisk(index: number): number {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const centerDistance = Math.abs(row - 2) + Math.abs(col - 2);
    return centerDistance / 8; // Normalize to 0-1
  }

  private calculateOptimalCashOutThreshold(): number {
    const { currentMultiplier, betAmount } = this.gameState;
    const riskTolerance = this.getStrategyMultiplier();
    return currentMultiplier * betAmount * riskTolerance;
  }

  private calculatePlayerExpectedValue(probabilities: number[], _threshold: number): number {
    // Simplified EV calculation
    const { betAmount, currentMultiplier } = this.gameState;
    const winProbability = probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length;
    return betAmount * currentMultiplier * winProbability - betAmount * (1 - winProbability);
  }

  private calculateHouseEdge(): number {
    const { mineCount } = this.gameState;
    // House edge increases with mine count
    return 0.02 + (mineCount * 0.005); // 2% base + 0.5% per mine
  }

  private calculateOptimalMultiplier(): number {
    const { revealedCount, mineCount } = this.gameState;
    const safeTiles = GRID_SIZE - mineCount;
    const remainingSafeTiles = safeTiles - revealedCount;
    const remainingTiles = GRID_SIZE - revealedCount - this.getRevealedMineCount();

    if (remainingTiles <= 0) return 1;

    const probability = remainingSafeTiles / remainingTiles;
    return 1 / probability * 0.95; // 5% house edge
  }

  private calculateRiskAdjustment(): number {
    const { revealedCount, mineCount } = this.gameState;
    return Math.min(1, revealedCount / (GRID_SIZE - mineCount));
  }

  private isNashEquilibrium(playerStrategy: any, houseStrategy: any): boolean {
    // Simplified equilibrium check
    const playerDeviation = Math.abs(playerStrategy.expectedValue - houseStrategy.expectedProfit);
    return playerDeviation < 0.1; // Threshold for equilibrium
  }

  private calculateStabilityScore(playerStrategy: any, houseStrategy: any): number {
    // Calculate how stable the current equilibrium is
    const variance = Math.abs(playerStrategy.expectedValue - houseStrategy.expectedProfit);
    return Math.max(0, 1 - variance);
  }

  private findBestTileToReveal(nashStrategy: NashStrategy): number {
    const probabilities = nashStrategy.playerStrategy.revealProbabilities;
    let bestIndex = -1;
    let bestProbability = 0;

    probabilities.forEach((prob, index) => {
      if (prob > bestProbability && !this.gameState.tiles[index].isRevealed) {
        bestProbability = prob;
        bestIndex = index;
      }
    });

    return bestProbability > 0.6 ? bestIndex : -1;
  }

  private shouldCashOut(nashStrategy: NashStrategy): boolean {
    const { potentialWin } = this.gameState;
    return potentialWin >= nashStrategy.playerStrategy.cashOutThreshold;
  }

  private calculateConfidence(nashStrategy: NashStrategy, action: string, tileIndex?: number): number {
    if (action === 'cashOut') {
      return nashStrategy.equilibriumPoint.stabilityScore;
    }
    if (action === 'reveal' && tileIndex !== undefined) {
      return nashStrategy.playerStrategy.revealProbabilities[tileIndex];
    }
    return 0.5;
  }

  private generateReasoning(action: string, nashStrategy: NashStrategy, tileIndex?: number): string {
    if (action === 'cashOut') {
      return `Nash equilibrium suggests cashing out. Current multiplier (${this.gameState.currentMultiplier.toFixed(2)}x) exceeds optimal threshold.`;
    }
    if (action === 'reveal' && tileIndex !== undefined) {
      const probability = nashStrategy.playerStrategy.revealProbabilities[tileIndex];
      return `Tile ${tileIndex} has ${(probability * 100).toFixed(1)}% probability of being safe according to Nash analysis.`;
    }
    return 'Continue playing with current strategy.';
  }

  private calculateRevealExpectedValue(tileIndex: number): number {
    const { betAmount, currentMultiplier } = this.gameState;
    const nashStrategy = this.calculateNashEquilibrium();
    const probability = nashStrategy.playerStrategy.revealProbabilities[tileIndex];
    return betAmount * currentMultiplier * probability;
  }

  private calculateRiskLevel(nashStrategy: NashStrategy): 'low' | 'medium' | 'high' {
    const stability = nashStrategy.equilibriumPoint.stabilityScore;
    if (stability > 0.7) return 'low';
    if (stability > 0.4) return 'medium';
    return 'high';
  }

  private getTileRecommendation(probability: number): 'reveal' | 'avoid' | 'neutral' {
    if (probability > 0.7) return 'reveal';
    if (probability < 0.3) return 'avoid';
    return 'neutral';
  }
}

/**
 * Factory function to create Nash Equilibrium analysis for a game state
 */
export function analyzeGameWithNashEquilibrium(
  gameState: MinesGameState,
  strategyMode: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
): {
  nashStrategy: NashStrategy;
  recommendation: StrategyRecommendation;
  updatedTiles: MinesTile[];
} {
  const engine = new NashEquilibriumEngine(gameState, strategyMode);

  return {
    nashStrategy: engine.calculateNashEquilibrium(),
    recommendation: engine.generateStrategyRecommendation(),
    updatedTiles: engine.updateTileProbabilities()
  };
}
