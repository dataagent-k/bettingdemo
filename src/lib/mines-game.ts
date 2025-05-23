import { MinesTile, MinesGameState, GameSettings } from '@/types/mines';
import { analyzeGameWithNashEquilibrium } from './nash-equilibrium';

export const GRID_SIZE = 25; // 5x5 grid

export function createInitialGameState(settings: GameSettings): MinesGameState {
  const tiles = generateTiles(settings.mineCount);

  const gameState: MinesGameState = {
    tiles,
    gameStatus: 'idle',
    mineCount: settings.mineCount,
    revealedCount: 0,
    betAmount: settings.betAmount,
    currentMultiplier: 1,
    potentialWin: settings.betAmount,
  };

  // Add Nash equilibrium analysis if enabled
  if (settings.enableNashAdvisor) {
    const analysis = analyzeGameWithNashEquilibrium(gameState, settings.strategyMode);
    gameState.nashEquilibrium = analysis.nashStrategy;
    gameState.strategyRecommendation = analysis.recommendation;
    gameState.tiles = analysis.updatedTiles;
    gameState.gameTheoryMetrics = calculateGameTheoryMetrics(gameState);
  }

  return gameState;
}

export function generateTiles(mineCount: number): MinesTile[] {
  const tiles: MinesTile[] = [];

  // Create all tiles
  for (let i = 0; i < GRID_SIZE; i++) {
    tiles.push({
      id: i,
      isMine: false,
      isRevealed: false,
      isExploded: false,
    });
  }

  // Randomly place mines
  const minePositions = new Set<number>();
  while (minePositions.size < mineCount) {
    const randomPosition = Math.floor(Math.random() * GRID_SIZE);
    minePositions.add(randomPosition);
  }

  minePositions.forEach(position => {
    tiles[position].isMine = true;
  });

  return tiles;
}

export function calculateMultiplier(revealedCount: number, mineCount: number): number {
  if (revealedCount === 0) return 1;

  const safeTiles = GRID_SIZE - mineCount;

  // More sophisticated multiplier calculation
  // Each revealed tile increases the multiplier based on the risk
  let multiplier = 1;

  for (let i = 1; i <= revealedCount; i++) {
    const remainingSafeTiles = safeTiles - i + 1;
    const remainingTiles = GRID_SIZE - i + 1;
    const probability = remainingSafeTiles / remainingTiles;

    // Higher risk (lower probability) = higher multiplier increase
    const riskFactor = 1 / probability;
    multiplier *= (1 + (riskFactor - 1) * 0.08); // 8% of the risk factor
  }

  return Math.max(1, multiplier);
}

export function revealTile(
  gameState: MinesGameState,
  tileId: number,
  settings?: GameSettings
): MinesGameState {
  const newTiles = [...gameState.tiles];
  const tile = newTiles[tileId];

  if (tile.isRevealed || gameState.gameStatus !== 'playing') {
    return gameState;
  }

  tile.isRevealed = true;

  if (tile.isMine) {
    tile.isExploded = true;
    const lostState = {
      ...gameState,
      tiles: newTiles,
      gameStatus: 'lost' as const,
    };

    // Update Nash analysis for lost game
    if (settings?.enableNashAdvisor) {
      const analysis = analyzeGameWithNashEquilibrium(lostState, settings.strategyMode);
      lostState.nashEquilibrium = analysis.nashStrategy;
      lostState.strategyRecommendation = analysis.recommendation;
      lostState.gameTheoryMetrics = calculateGameTheoryMetrics(lostState);
    }

    return lostState;
  }

  const newRevealedCount = gameState.revealedCount + 1;
  const newMultiplier = calculateMultiplier(newRevealedCount, gameState.mineCount);
  const potentialWin = gameState.betAmount * newMultiplier;

  // Check if all safe tiles are revealed
  const safeTilesCount = GRID_SIZE - gameState.mineCount;
  const gameWon = newRevealedCount === safeTilesCount;

  const updatedState = {
    ...gameState,
    tiles: newTiles,
    revealedCount: newRevealedCount,
    currentMultiplier: newMultiplier,
    potentialWin,
    gameStatus: gameWon ? 'won' as const : 'playing' as const,
  };

  // Update Nash equilibrium analysis after each move
  if (settings?.enableNashAdvisor && !gameWon) {
    const analysis = analyzeGameWithNashEquilibrium(updatedState, settings.strategyMode);
    updatedState.nashEquilibrium = analysis.nashStrategy;
    updatedState.strategyRecommendation = analysis.recommendation;
    updatedState.tiles = analysis.updatedTiles;
    updatedState.gameTheoryMetrics = calculateGameTheoryMetrics(updatedState);
  }

  return updatedState;
}

export function cashOut(gameState: MinesGameState): number {
  if (gameState.gameStatus !== 'playing' || gameState.revealedCount === 0) {
    return 0;
  }

  return gameState.potentialWin;
}

export function startNewGame(settings: GameSettings): MinesGameState {
  const newGameState = createInitialGameState(settings);
  const playingState = {
    ...newGameState,
    gameStatus: 'playing' as const,
  };

  // Update Nash analysis for the starting game state
  if (settings.enableNashAdvisor) {
    const analysis = analyzeGameWithNashEquilibrium(playingState, settings.strategyMode);
    playingState.nashEquilibrium = analysis.nashStrategy;
    playingState.strategyRecommendation = analysis.recommendation;
    playingState.tiles = analysis.updatedTiles;
    playingState.gameTheoryMetrics = calculateGameTheoryMetrics(playingState);
  }

  return playingState;
}

/**
 * Calculate game theory metrics for the current state
 */
export function calculateGameTheoryMetrics(gameState: MinesGameState) {
  const { mineCount, revealedCount, tiles } = gameState;
  const safeTiles = GRID_SIZE - mineCount;
  const remainingSafeTiles = safeTiles - revealedCount;
  const remainingTiles = GRID_SIZE - revealedCount - tiles.filter(t => t.isRevealed && t.isMine).length;

  if (remainingTiles <= 0) {
    return {
      currentRisk: 0,
      optimalRisk: 0,
      deviationFromEquilibrium: 0,
    };
  }

  const currentRisk = mineCount / remainingTiles;
  const optimalRisk = gameState.nashEquilibrium?.houseStrategy.riskAdjustment || currentRisk;
  const deviationFromEquilibrium = Math.abs(currentRisk - optimalRisk);

  return {
    currentRisk,
    optimalRisk,
    deviationFromEquilibrium,
  };
}

/**
 * Update game state with new Nash equilibrium analysis
 */
export function updateGameWithNashAnalysis(
  gameState: MinesGameState,
  settings: GameSettings
): MinesGameState {
  if (!settings.enableNashAdvisor) {
    return gameState;
  }

  const analysis = analyzeGameWithNashEquilibrium(gameState, settings.strategyMode);

  return {
    ...gameState,
    nashEquilibrium: analysis.nashStrategy,
    strategyRecommendation: analysis.recommendation,
    tiles: analysis.updatedTiles,
    gameTheoryMetrics: calculateGameTheoryMetrics(gameState),
  };
}
