import { NextRequest, NextResponse } from 'next/server';

/**
 * Holiday AI - Wallet Top-up API
 * Endpoint: POST /api/wallet/topup
 * Description: Add funds to user's wallet
 */

interface TopupRequest {
  amount: number;
  currency?: string;
  paymentMethod: 'credit_card' | 'duitnow' | 'boost' | 'grabpay' | 'bank_transfer';
  paymentDetails?: any;
}

// Mock wallet database
const mockWallets: Record<string, any> = {
  'user123': {
    id: 'wallet-001',
    userId: 'user123',
    balance: 2500.00,
    currency: 'MYR'
  }
};

// Mock transactions database
const mockTransactions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user123';
    const body: TopupRequest = await request.json();

    // Validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Get user wallet
    const wallet = mockWallets[userId];

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check limits (example: max RM 5,000 per top-up)
    const MAX_TOPUP_AMOUNT = 5000.00;
    if (body.amount > MAX_TOPUP_AMOUNT) {
      return NextResponse.json(
        { error: `Maximum top-up amount is ${MAX_TOPUP_AMOUNT}` },
        { status: 400 }
      );
    }

    // Process payment based on method
    let paymentResult;
    switch (body.paymentMethod) {
      case 'credit_card':
        paymentResult = await processStripePayment(body.amount, body.paymentDetails);
        break;
      case 'duitnow':
        paymentResult = await processDuitNowPayment(body.amount);
        break;
      case 'boost':
        paymentResult = await processBoostPayment(body.amount);
        break;
      case 'grabpay':
        paymentResult = await processGrabPayPayment(body.amount);
        break;
      case 'bank_transfer':
        paymentResult = await processBankTransfer(body.amount);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        );
    }

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: 'Payment failed', details: paymentResult.error },
        { status: 402 }
      );
    }

    // Update wallet balance
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + body.amount;
    wallet.balance = balanceAfter;
    wallet.lastTransactionAt = new Date();

    // Create transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      walletId: wallet.id,
      type: 'credit',
      category: 'topup',
      amount: body.amount,
      balanceBefore,
      balanceAfter,
      description: `Wallet top-up via ${body.paymentMethod}`,
      status: 'completed',
      paymentMethod: body.paymentMethod,
      externalTransactionId: paymentResult.transactionId,
      createdAt: new Date()
    };

    mockTransactions.push(transaction);

    return NextResponse.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        transaction,
        wallet: {
          balance: wallet.balance,
          currency: wallet.currency
        }
      }
    });

  } catch (error) {
    console.error('Wallet top-up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// Payment Processing Functions (Mock Implementations)
// =====================================================

async function processStripePayment(amount: number, paymentDetails: any) {
  // TODO: Integrate with Stripe API
  console.log('Processing Stripe payment:', amount);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `stripe_${Date.now()}`,
    amount
  };
}

async function processDuitNowPayment(amount: number) {
  // TODO: Integrate with DuitNow QR API
  console.log('Generating DuitNow QR code:', amount);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `duitnow_${Date.now()}`,
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    amount
  };
}

async function processBoostPayment(amount: number) {
  // TODO: Integrate with Boost eWallet SDK
  console.log('Processing Boost payment:', amount);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `boost_${Date.now()}`,
    amount
  };
}

async function processGrabPayPayment(amount: number) {
  // TODO: Integrate with GrabPay SDK
  console.log('Processing GrabPay payment:', amount);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `grabpay_${Date.now()}`,
    amount
  };
}

async function processBankTransfer(amount: number) {
  // TODO: Generate bank transfer reference
  console.log('Generating bank transfer reference:', amount);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    transactionId: `bank_${Date.now()}`,
    referenceNumber: `REF${Date.now()}`,
    amount
  };
}
