import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      balance REAL DEFAULT 1000.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Game history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bet_amount REAL NOT NULL,
      mine_count INTEGER NOT NULL,
      revealed_tiles INTEGER NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('win', 'loss')),
      payout REAL NOT NULL,
      multiplier REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User statistics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      total_games INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      total_losses INTEGER DEFAULT 0,
      total_wagered REAL DEFAULT 0.0,
      total_won REAL DEFAULT 0.0,
      biggest_win REAL DEFAULT 0.0,
      longest_win_streak INTEGER DEFAULT 0,
      current_win_streak INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// User management functions
export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface GameRecord {
  id: number;
  user_id: number;
  bet_amount: number;
  mine_count: number;
  revealed_tiles: number;
  result: 'win' | 'loss';
  payout: number;
  multiplier: number;
  created_at: string;
}

export interface UserStats {
  total_games: number;
  total_wins: number;
  total_losses: number;
  total_wagered: number;
  total_won: number;
  biggest_win: number;
  longest_win_streak: number;
  current_win_streak: number;
}

export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(userData.username, userData.email, hashedPassword);

    // Create initial stats record
    const statsStmt = db.prepare(`
      INSERT INTO user_stats (user_id) VALUES (?)
    `);
    statsStmt.run(result.lastInsertRowid);

    return getUserById(result.lastInsertRowid as number);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const stmt = db.prepare(`
      SELECT id, username, email, password_hash, balance, created_at
      FROM users WHERE email = ?
    `);

    const user = stmt.get(email) as any;

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

export function getUserById(id: number): User | null {
  try {
    const stmt = db.prepare(`
      SELECT id, username, email, balance, created_at
      FROM users WHERE id = ?
    `);

    return stmt.get(id) as User | undefined || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export function getUserByEmail(email: string): User | null {
  try {
    const stmt = db.prepare(`
      SELECT id, username, email, balance, created_at
      FROM users WHERE email = ?
    `);

    return stmt.get(email) as User | undefined || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export function updateUserBalance(userId: number, newBalance: number): boolean {
  try {
    const stmt = db.prepare(`
      UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(newBalance, userId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating user balance:', error);
    return false;
  }
}

export function addGameRecord(
  userId: number,
  betAmount: number,
  mineCount: number,
  revealedTiles: number,
  result: 'win' | 'loss',
  payout: number,
  multiplier: number
): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO game_history (user_id, bet_amount, mine_count, revealed_tiles, result, payout, multiplier)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const gameResult = stmt.run(userId, betAmount, mineCount, revealedTiles, result, payout, multiplier);

    // Update user statistics
    updateUserStats(userId, result, betAmount, payout);

    return gameResult.changes > 0;
  } catch (error) {
    console.error('Error adding game record:', error);
    return false;
  }
}

export function getUserGameHistory(userId: number, limit: number = 50): GameRecord[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM game_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit) as GameRecord[];
  } catch (error) {
    console.error('Error getting user game history:', error);
    return [];
  }
}

export function getUserStats(userId: number): UserStats | null {
  try {
    const stmt = db.prepare(`
      SELECT total_games, total_wins, total_losses, total_wagered, total_won,
             biggest_win, longest_win_streak, current_win_streak
      FROM user_stats WHERE user_id = ?
    `);

    return stmt.get(userId) as UserStats | undefined || null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

function updateUserStats(userId: number, result: 'win' | 'loss', betAmount: number, payout: number): void {
  try {
    const currentStats = getUserStats(userId);
    if (!currentStats) return;

    const isWin = result === 'win';
    const netWin = payout - betAmount;

    const newStats = {
      total_games: currentStats.total_games + 1,
      total_wins: currentStats.total_wins + (isWin ? 1 : 0),
      total_losses: currentStats.total_losses + (isWin ? 0 : 1),
      total_wagered: currentStats.total_wagered + betAmount,
      total_won: currentStats.total_won + payout,
      biggest_win: Math.max(currentStats.biggest_win, netWin),
      current_win_streak: isWin ? currentStats.current_win_streak + 1 : 0,
      longest_win_streak: isWin
        ? Math.max(currentStats.longest_win_streak, currentStats.current_win_streak + 1)
        : currentStats.longest_win_streak,
    };

    const stmt = db.prepare(`
      UPDATE user_stats SET
        total_games = ?, total_wins = ?, total_losses = ?,
        total_wagered = ?, total_won = ?, biggest_win = ?,
        longest_win_streak = ?, current_win_streak = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(
      newStats.total_games, newStats.total_wins, newStats.total_losses,
      newStats.total_wagered, newStats.total_won, newStats.biggest_win,
      newStats.longest_win_streak, newStats.current_win_streak, userId
    );
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

// Initialize database on module load
initializeDatabase();
