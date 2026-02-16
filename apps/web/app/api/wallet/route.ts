import { NextRequest, NextResponse } from 'next/server';

/**
 * Holiday AI - Wallet API
 * Endpoint: GET /api/wallet
 * Description: Get user's wallet balance and summary
 */

// Mock database - replace with actual database connection
const mockWallets: Record<string, any> = {
  'user123': {
    id: 'wallet-001',
    userId: 'user123',
    balance: 2500.00,
    currency: 'MYR',
    status: 'active',
    lastTransactionAt: new Date('2025-01-15T10:30:00Z'),
    totalTransactions: 45,
    totalCredits: 5000.00,
    totalDebits: 2500.00,
    createdAt: new Date('2024-01-01T00:00:00Z')
  }
};

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session/JWT token
    const userId = request.headers.get('x-user-id') || 'user123';

    // Fetch wallet from database
    const wallet = mockWallets[userId];

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: wallet
    });

  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet
 * Description: Create a new wallet for user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currency = 'MYR' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    if (mockWallets[userId]) {
      return NextResponse.json(
        { error: 'Wallet already exists for this user' },
        { status: 409 }
      );
    }

    // Create new wallet
    const newWallet = {
      id: `wallet-${Date.now()}`,
      userId,
      balance: 0.00,
      currency,
      status: 'active',
      lastTransactionAt: null,
      totalTransactions: 0,
      totalCredits: 0.00,
      totalDebits: 0.00,
      createdAt: new Date()
    };

    mockWallets[userId] = newWallet;

    return NextResponse.json({
      success: true,
      data: newWallet
    }, { status: 201 });

  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
