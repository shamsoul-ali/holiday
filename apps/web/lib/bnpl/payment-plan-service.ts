// Payment Plan Service for BNPL
// Manages payment plan creation, tracking, and modifications

import { calculateInstallmentPlan, InstallmentPlan, CalculatorInput } from './installment-calculator'
import { assessRisk, FinancialProfile, RiskAssessment } from './risk-calculator'

export interface PaymentPlanConfig {
  minAmount: number // Minimum trip cost for BNPL (e.g., RM 1000)
  maxAmount: number // Maximum trip cost for BNPL (e.g., RM 50000)
  availableTenures: number[] // e.g., [3, 6, 12, 24]
  interestRates: Record<number, number> // tenure -> APR mapping
  downPaymentOptions: number[] // e.g., [0, 10, 20, 30, 50]
  lateFeeConfig: {
    flatFee: number
    dailyPenaltyRate: number
  }
  maxConcurrentPlans: number // e.g., 3
}

export const DEFAULT_BNPL_CONFIG: PaymentPlanConfig = {
  minAmount: 1000,
  maxAmount: 50000,
  availableTenures: [3, 6, 12, 24],
  interestRates: {
    3: 0, // 0% promo for 3 months
    6: 6, // 6% APR for 6 months
    12: 8, // 8% APR for 12 months
    24: 10 // 10% APR for 24 months
  },
  downPaymentOptions: [0, 10, 20, 30, 50],
  lateFeeConfig: {
    flatFee: 50, // RM 50 flat fee
    dailyPenaltyRate: 0.05 // 0.05% per day
  },
  maxConcurrentPlans: 3
}

export interface CreatePaymentPlanRequest {
  userId: string
  bookingId: string
  tripAmount: number
  currency: string
  tenure: number
  downPaymentPercent: number
  financialProfile: FinancialProfile
}

export interface PaymentPlanResponse {
  success: boolean
  plan?: InstallmentPlan
  riskAssessment?: RiskAssessment
  paymentPlanId?: string
  error?: string
}

export interface PaymentPlanStatus {
  id: string
  userId: string
  bookingId: string
  status: 'active' | 'completed' | 'cancelled' | 'defaulted'
  plan: InstallmentPlan
  paidInstallments: number
  nextDueDate: Date
  totalPaid: number
  remainingAmount: number
  isOverdue: boolean
  daysOverdue: number
}

// Validate BNPL eligibility
export function validateBNPLEligibility(
  tripAmount: number,
  config: PaymentPlanConfig = DEFAULT_BNPL_CONFIG
): { eligible: boolean; reason?: string } {
  if (tripAmount < config.minAmount) {
    return {
      eligible: false,
      reason: `Trip cost must be at least RM ${config.minAmount.toLocaleString()}`
    }
  }

  if (tripAmount > config.maxAmount) {
    return {
      eligible: false,
      reason: `Trip cost exceeds maximum of RM ${config.maxAmount.toLocaleString()}`
    }
  }

  return { eligible: true }
}

// Create payment plan with risk assessment
export async function createPaymentPlan(
  request: CreatePaymentPlanRequest,
  config: PaymentPlanConfig = DEFAULT_BNPL_CONFIG
): Promise<PaymentPlanResponse> {
  const {
    userId,
    bookingId,
    tripAmount,
    currency,
    tenure,
    downPaymentPercent,
    financialProfile
  } = request

  // Validate eligibility
  const eligibility = validateBNPLEligibility(tripAmount, config)
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reason
    }
  }

  // Validate tenure
  if (!config.availableTenures.includes(tenure)) {
    return {
      success: false,
      error: `Invalid tenure. Available options: ${config.availableTenures.join(', ')} months`
    }
  }

  // Calculate installment plan
  const interestRate = config.interestRates[tenure] || 0
  const plan = calculateInstallmentPlan({
    principal: tripAmount,
    downPaymentPercent,
    tenure,
    interestRate,
    startDate: new Date()
  })

  // Perform risk assessment
  const riskAssessment = assessRisk(financialProfile, plan.monthlyPayment)

  // Check approval
  if (!riskAssessment.approved) {
    return {
      success: false,
      plan,
      riskAssessment,
      error: 'Application not approved. ' + riskAssessment.reasons.join('. ')
    }
  }

  // Generate payment plan ID
  const paymentPlanId = generatePaymentPlanId(userId, bookingId)

  // In production, save to database here
  // await savePaymentPlanToDatabase({ ...plan, userId, bookingId, paymentPlanId })

  return {
    success: true,
    plan,
    riskAssessment,
    paymentPlanId
  }
}

// Generate payment plan recommendations
export function generatePaymentPlanRecommendations(
  tripAmount: number,
  financialProfile: FinancialProfile,
  config: PaymentPlanConfig = DEFAULT_BNPL_CONFIG
): Array<{
  tenure: number
  plan: InstallmentPlan
  riskAssessment: RiskAssessment
  recommended: boolean
  reason: string
}> {
  const recommendations: Array<{
    tenure: number
    plan: InstallmentPlan
    riskAssessment: RiskAssessment
    recommended: boolean
    reason: string
  }> = []

  for (const tenure of config.availableTenures) {
    const interestRate = config.interestRates[tenure] || 0
    const plan = calculateInstallmentPlan({
      principal: tripAmount,
      downPaymentPercent: 0, // No down payment for comparison
      tenure,
      interestRate
    })

    const riskAssessment = assessRisk(financialProfile, plan.monthlyPayment)

    let recommended = false
    let reason = ''

    if (riskAssessment.approved && riskAssessment.debtToIncomeRatio <= 30) {
      recommended = true
      reason = 'Excellent fit - Low DTI and approved'
    } else if (riskAssessment.approved && riskAssessment.debtToIncomeRatio <= 40) {
      recommended = tenure === 6 || tenure === 12 // Recommend medium tenures
      reason = recommended
        ? 'Good balance of affordability and interest cost'
        : 'Consider this as an alternative option'
    } else if (riskAssessment.approved) {
      recommended = tenure === config.availableTenures[config.availableTenures.length - 1] // Longest tenure
      reason = recommended
        ? 'Recommended for lower monthly payments'
        : 'Monthly payment may be challenging'
    } else {
      recommended = false
      reason = 'Not recommended - DTI too high or not approved'
    }

    recommendations.push({
      tenure,
      plan,
      riskAssessment,
      recommended,
      reason
    })
  }

  return recommendations
}

// Calculate optimal down payment
export function calculateOptimalDownPayment(
  tripAmount: number,
  tenure: number,
  targetMonthlyPayment: number,
  interestRate: number
): {
  recommendedDownPayment: number
  recommendedDownPaymentPercent: number
  resultingMonthlyPayment: number
} {
  // Binary search for optimal down payment
  let low = 0
  let high = 50 // Max 50% down payment

  while (high - low > 0.1) {
    const mid = (low + high) / 2
    const plan = calculateInstallmentPlan({
      principal: tripAmount,
      downPaymentPercent: mid,
      tenure,
      interestRate
    })

    if (plan.monthlyPayment > targetMonthlyPayment) {
      low = mid // Need more down payment
    } else {
      high = mid // Can reduce down payment
    }
  }

  const optimalDownPaymentPercent = Math.ceil(high)
  const finalPlan = calculateInstallmentPlan({
    principal: tripAmount,
    downPaymentPercent: optimalDownPaymentPercent,
    tenure,
    interestRate
  })

  return {
    recommendedDownPayment: finalPlan.downPayment,
    recommendedDownPaymentPercent: optimalDownPaymentPercent,
    resultingMonthlyPayment: finalPlan.monthlyPayment
  }
}

// Generate payment plan ID
function generatePaymentPlanId(userId: string, bookingId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BNPL-${timestamp}-${random}`
}

// Format payment plan for display
export function formatPaymentPlanSummary(plan: InstallmentPlan): {
  tenure: string
  monthlyPayment: string
  totalAmount: string
  totalInterest: string
  interestRate: string
  firstPaymentDate: string
  lastPaymentDate: string
} {
  return {
    tenure: `${plan.tenure} months`,
    monthlyPayment: `RM ${plan.monthlyPayment.toLocaleString()}`,
    totalAmount: `RM ${plan.totalAmount.toLocaleString()}`,
    totalInterest: `RM ${plan.totalInterest.toLocaleString()}`,
    interestRate: `${plan.interestRate}% APR`,
    firstPaymentDate: plan.installments[0].dueDate.toLocaleDateString('en-MY'),
    lastPaymentDate: plan.installments[plan.installments.length - 1].dueDate.toLocaleDateString('en-MY')
  }
}

// Get promotional campaigns
export function getPromotionalCampaigns(): Array<{
  id: string
  name: string
  description: string
  tenures: number[]
  interestRate: number
  minAmount: number
  maxAmount: number
  validUntil: Date
  badge: string
}> {
  return [
    {
      id: 'promo-3m-zero',
      name: '0% Interest for 3 Months',
      description: 'Pay zero interest when you choose 3-month installments',
      tenures: [3],
      interestRate: 0,
      minAmount: 1000,
      maxAmount: 10000,
      validUntil: new Date('2025-12-31'),
      badge: '0% APR'
    },
    {
      id: 'promo-raya',
      name: 'Raya Special - 5% off interest',
      description: 'Enjoy 5% reduced interest rates for Raya season bookings',
      tenures: [6, 12],
      interestRate: 3, // Reduced from 6-8%
      minAmount: 2000,
      maxAmount: 30000,
      validUntil: new Date('2025-04-30'),
      badge: 'Limited Time'
    },
    {
      id: 'promo-rhb-members',
      name: 'RHB Preferred Rate',
      description: 'Exclusive rates for RHB bank account holders',
      tenures: [6, 12, 24],
      interestRate: 5, // Better than standard
      minAmount: 5000,
      maxAmount: 50000,
      validUntil: new Date('2026-12-31'),
      badge: 'RHB Exclusive'
    }
  ]
}
