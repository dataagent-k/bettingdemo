export interface MinesTile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isExploded: boolean;
}

export interface MinesGameState {
  tiles: MinesTile[];
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  mineCount: number;
  revealedCount: number;
  betAmount: number;
  currentMultiplier: number;
  potentialWin: number;
}

export interface GameSettings {
  gridSize: number;
  mineCount: number;
  betAmount: number;
}

export interface GameHistory {
  id: string;
  betAmount: number;
  mineCount: number;
  revealedTiles: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: Date;
}
