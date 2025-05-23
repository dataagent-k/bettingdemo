import { MinesTile, MinesGameState, GameSettings } from '@/types/mines';

export const GRID_SIZE = 25; // 5x5 grid

export function createInitialGameState(settings: GameSettings): MinesGameState {
  const tiles = generateTiles(settings.mineCount);

  return {
    tiles,
    gameStatus: 'idle',
    mineCount: settings.mineCount,
    revealedCount: 0,
    betAmount: settings.betAmount,
    currentMultiplier: 1,
    potentialWin: settings.betAmount,
  };
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
  tileId: number
): MinesGameState {
  const newTiles = [...gameState.tiles];
  const tile = newTiles[tileId];

  if (tile.isRevealed || gameState.gameStatus !== 'playing') {
    return gameState;
  }

  tile.isRevealed = true;

  if (tile.isMine) {
    tile.isExploded = true;
    return {
      ...gameState,
      tiles: newTiles,
      gameStatus: 'lost',
    };
  }

  const newRevealedCount = gameState.revealedCount + 1;
  const newMultiplier = calculateMultiplier(newRevealedCount, gameState.mineCount);
  const potentialWin = gameState.betAmount * newMultiplier;

  // Check if all safe tiles are revealed
  const safeTilesCount = GRID_SIZE - gameState.mineCount;
  const gameWon = newRevealedCount === safeTilesCount;

  return {
    ...gameState,
    tiles: newTiles,
    revealedCount: newRevealedCount,
    currentMultiplier: newMultiplier,
    potentialWin,
    gameStatus: gameWon ? 'won' : 'playing',
  };
}

export function cashOut(gameState: MinesGameState): number {
  if (gameState.gameStatus !== 'playing' || gameState.revealedCount === 0) {
    return 0;
  }

  return gameState.potentialWin;
}

export function startNewGame(settings: GameSettings): MinesGameState {
  const newGameState = createInitialGameState(settings);
  return {
    ...newGameState,
    gameStatus: 'playing',
  };
}
