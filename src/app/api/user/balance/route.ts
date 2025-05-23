import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserBalance } from '@/lib/database';
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

export async function PUT(request: NextRequest) {
  try {
    const tokenData = getUserFromToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { balance } = await request.json();

    if (typeof balance !== 'number' || balance < 0) {
      return NextResponse.json(
        { error: 'Invalid balance amount' },
        { status: 400 }
      );
    }

    const success = updateUserBalance(tokenData.userId, balance);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    const updatedUser = getUserById(tokenData.userId);
    
    return NextResponse.json({
      message: 'Balance updated successfully',
      balance: updatedUser?.balance || 0,
    });

  } catch (error) {
    console.error('Update balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reset balance to default (1000)
export async function POST(request: NextRequest) {
  try {
    const tokenData = getUserFromToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const success = updateUserBalance(tokenData.userId, 1000);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Balance reset successfully',
      balance: 1000,
    });

  } catch (error) {
    console.error('Reset balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
