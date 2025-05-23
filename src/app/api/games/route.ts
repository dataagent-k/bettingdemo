import { NextRequest, NextResponse } from 'next/server';
import { addGameRecord, getUserGameHistory, getUserStats, updateUserBalance, getUserById } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Add a new game record
export async function POST(request: NextRequest) {
  try {
    const tokenData = getUserFromToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { betAmount, mineCount, revealedTiles, result, payout, multiplier, newBalance } = await request.json();

    // Validate input
    if (!betAmount || !mineCount || revealedTiles === undefined || !result || payout === undefined || !multiplier || newBalance === undefined) {
      return NextResponse.json(
        { error: 'Missing required game data' },
        { status: 400 }
      );
    }

    if (!['win', 'loss'].includes(result)) {
      return NextResponse.json(
        { error: 'Invalid result value' },
        { status: 400 }
      );
    }

    // Add game record
    const gameAdded = addGameRecord(
      tokenData.userId,
      betAmount,
      mineCount,
      revealedTiles,
      result,
      payout,
      multiplier
    );

    if (!gameAdded) {
      return NextResponse.json(
        { error: 'Failed to save game record' },
        { status: 500 }
      );
    }

    // Update user balance
    const balanceUpdated = updateUserBalance(tokenData.userId, newBalance);

    if (!balanceUpdated) {
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Game recorded successfully',
      balance: newBalance,
    });

  } catch (error) {
    console.error('Add game record error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's game history
export async function GET(request: NextRequest) {
  try {
    const tokenData = getUserFromToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const gameHistory = getUserGameHistory(tokenData.userId, limit);
    const userStats = getUserStats(tokenData.userId);

    return NextResponse.json({
      gameHistory,
      stats: userStats,
    });

  } catch (error) {
    console.error('Get game history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
