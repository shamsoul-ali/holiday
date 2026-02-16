import { NextRequest, NextResponse } from 'next/server';

/**
 * Holiday AI - Savings Goals API
 * Endpoints:
 * - GET /api/wallet/savings - List all savings goals
 * - POST /api/wallet/savings - Create new savings goal
 */

interface SavingsGoal {
  id: string;
  userId: string;
  walletId: string;
  tripId?: string;
  goalName: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'active' | 'paused' | 'achieved' | 'cancelled';
  priority: number;
  autoTransferEnabled: boolean;
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining: number;
  createdAt: Date;
}

// Mock database
const mockSavingsGoals: Record<string, SavingsGoal[]> = {
  'user123': [
    {
      id: 'goal-001',
      userId: 'user123',
      walletId: 'wallet-001',
      tripId: 'trip-tokyo-2025',
      goalName: 'Tokyo Summer Trip 2025',
      description: '10-day trip to Tokyo with family',
      targetAmount: 15000.00,
      currentAmount: 5500.00,
      targetDate: '2025-06-01',
      status: 'active',
      priority: 1,
      autoTransferEnabled: true,
      progressPercentage: 36.67,
      remainingAmount: 9500.00,
      daysRemaining: 120,
      createdAt: new Date('2024-10-01')
    },
    {
      id: 'goal-002',
      userId: 'user123',
      walletId: 'wallet-001',
      goalName: 'Emergency Travel Fund',
      description: 'Buffer for unexpected trips',
      targetAmount: 5000.00,
      currentAmount: 2100.00,
      targetDate: '2025-12-31',
      status: 'active',
      priority: 2,
      autoTransferEnabled: false,
      progressPercentage: 42.00,
      remainingAmount: 2900.00,
      daysRemaining: 240,
      createdAt: new Date('2024-08-15')
    }
  ]
};

/**
 * GET /api/wallet/savings
 * Get all savings goals for user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user123';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Fetch savings goals
    let goals = mockSavingsGoals[userId] || [];

    // Filter by status if provided
    if (status) {
      goals = goals.filter(g => g.status === status);
    }

    // Calculate totals
    const summary = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      overallProgress: goals.length > 0
        ? (goals.reduce((sum, g) => sum + g.currentAmount, 0) /
           goals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        goals,
        summary
      }
    });

  } catch (error) {
    console.error('Savings goals fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/savings
 * Create new savings goal
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user123';
    const body = await request.json();

    // Validation
    if (!body.goalName || body.goalName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Goal name is required' },
        { status: 400 }
      );
    }

    if (!body.targetAmount || body.targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.targetDate) {
      return NextResponse.json(
        { error: 'Target date is required' },
        { status: 400 }
      );
    }

    // Validate target date is in the future
    const targetDate = new Date(body.targetDate);
    if (targetDate <= new Date()) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
        { status: 400 }
      );
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create new savings goal
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      userId,
      walletId: body.walletId || 'wallet-001',
      tripId: body.tripId,
      goalName: body.goalName,
      description: body.description,
      targetAmount: body.targetAmount,
      currentAmount: body.initialContribution || 0,
      targetDate: body.targetDate,
      status: 'active',
      priority: body.priority || 1,
      autoTransferEnabled: body.autoTransferEnabled || false,
      progressPercentage: body.initialContribution
        ? (body.initialContribution / body.targetAmount) * 100
        : 0,
      remainingAmount: body.targetAmount - (body.initialContribution || 0),
      daysRemaining,
      createdAt: new Date()
    };

    // Save to database
    if (!mockSavingsGoals[userId]) {
      mockSavingsGoals[userId] = [];
    }
    mockSavingsGoals[userId].push(newGoal);

    // Calculate recommended contribution
    const recommendedMonthlyContribution = calculateRecommendedContribution(
      newGoal.targetAmount,
      newGoal.currentAmount,
      daysRemaining
    );

    return NextResponse.json({
      success: true,
      message: 'Savings goal created successfully',
      data: {
        goal: newGoal,
        recommendations: {
          monthlyContribution: recommendedMonthlyContribution,
          weeklyContribution: recommendedMonthlyContribution / 4,
          achievementProbability: calculateAchievementProbability(newGoal)
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Savings goal creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================

function calculateRecommendedContribution(
  targetAmount: number,
  currentAmount: number,
  daysRemaining: number
): number {
  const remainingAmount = targetAmount - currentAmount;
  const monthsRemaining = daysRemaining / 30;

  if (monthsRemaining <= 0) return remainingAmount;

  return Math.ceil(remainingAmount / monthsRemaining);
}

function calculateAchievementProbability(goal: SavingsGoal): number {
  // Simple probability calculation based on progress and time
  const progressScore = goal.progressPercentage / 100;
  const timeScore = goal.daysRemaining > 90 ? 1 : goal.daysRemaining / 90;

  const probability = (progressScore * 0.6 + timeScore * 0.4) * 100;

  return Math.min(Math.max(probability, 0), 100);
}
