// Risk Calculator for BNPL Financial Assessment
// Evaluates user financial health and creditworthiness

export interface FinancialProfile {
  monthlyIncome: number
  existingMonthlyDebts: number
  employmentType: 'permanent' | 'contract' | 'self-employed' | 'part-time'
  employmentDuration: number // in months
  age: number
  dependents: number
  hasEmergencyFund: boolean
  creditScore?: number // from RHB if available
}

export interface RiskAssessment {
  riskScore: number // 0-100, higher is better
  riskLevel: 'low' | 'medium' | 'high' | 'very-high'
  debtToIncomeRatio: number
  affordableMonthlyPayment: number
  maxLoanAmount: number
  approved: boolean
  reasons: string[]
  recommendations: string[]
}

// Calculate Debt-to-Income Ratio
export function calculateDTI(monthlyIncome: number, totalMonthlyDebts: number): number {
  if (monthlyIncome <= 0) return 100
  const dti = (totalMonthlyDebts / monthlyIncome) * 100
  return Math.round(dti * 100) / 100
}

// Calculate disposable income
export function calculateDisposableIncome(profile: FinancialProfile): number {
  const { monthlyIncome, existingMonthlyDebts, dependents } = profile

  // Estimate living expenses based on dependents
  const baseExpenses = 1500 // RM per month for single person
  const perDependentExpense = 800 // RM per dependent

  const estimatedLivingExpenses = baseExpenses + (dependents * perDependentExpense)
  const disposable = monthlyIncome - existingMonthlyDebts - estimatedLivingExpenses

  return Math.max(0, disposable)
}

// Comprehensive risk assessment
export function assessRisk(
  profile: FinancialProfile,
  requestedMonthlyPayment: number
): RiskAssessment {
  const {
    monthlyIncome,
    existingMonthlyDebts,
    employmentType,
    employmentDuration,
    age,
    dependents,
    hasEmergencyFund,
    creditScore
  } = profile

  const newMonthlyDebts = existingMonthlyDebts + requestedMonthlyPayment
  const dti = calculateDTI(monthlyIncome, newMonthlyDebts)
  const disposable = calculateDisposableIncome(profile)

  let riskScore = 100
  const reasons: string[] = []
  const recommendations: string[] = []

  // DTI Assessment (most important factor)
  if (dti > 60) {
    riskScore -= 40
    reasons.push('Debt-to-income ratio exceeds 60% - very high risk')
    recommendations.push('Reduce existing debts or increase down payment')
  } else if (dti > 50) {
    riskScore -= 30
    reasons.push('Debt-to-income ratio exceeds 50% - high risk')
    recommendations.push('Consider longer tenure to reduce monthly payment')
  } else if (dti > 40) {
    riskScore -= 15
    reasons.push('Debt-to-income ratio exceeds 40% - moderate risk')
    recommendations.push('Review your monthly budget carefully')
  } else if (dti <= 30) {
    riskScore += 10
    reasons.push('Excellent debt-to-income ratio')
  }

  // Employment stability
  if (employmentType === 'permanent') {
    riskScore += 10
  } else if (employmentType === 'self-employed' || employmentType === 'contract') {
    riskScore -= 10
    reasons.push('Non-permanent employment increases risk')
    recommendations.push('Consider providing 3 months bank statements')
  } else if (employmentType === 'part-time') {
    riskScore -= 20
    reasons.push('Part-time employment - income may be unstable')
  }

  if (employmentDuration < 6) {
    riskScore -= 15
    reasons.push('Employment duration less than 6 months')
  } else if (employmentDuration >= 24) {
    riskScore += 5
  }

  // Age assessment
  if (age < 21) {
    riskScore -= 15
    reasons.push('Limited credit history due to age')
  } else if (age >= 21 && age <= 55) {
    riskScore += 5
  } else if (age > 60) {
    riskScore -= 10
    reasons.push('Consider shorter tenure due to age')
  }

  // Emergency fund
  if (hasEmergencyFund) {
    riskScore += 10
    reasons.push('Has emergency fund - financial buffer available')
  } else {
    riskScore -= 10
    reasons.push('No emergency fund - limited financial buffer')
    recommendations.push('Build 3-6 months emergency fund for financial safety')
  }

  // Credit score (if available from RHB)
  if (creditScore !== undefined) {
    if (creditScore >= 750) {
      riskScore += 15
      reasons.push('Excellent credit score')
    } else if (creditScore >= 650) {
      riskScore += 5
      reasons.push('Good credit score')
    } else if (creditScore < 550) {
      riskScore -= 25
      reasons.push('Below-average credit score')
      recommendations.push('Improve credit score by paying existing debts on time')
    }
  }

  // Dependents impact
  if (dependents > 3) {
    riskScore -= 10
    reasons.push('High number of dependents increases financial burden')
  }

  // Cap risk score between 0-100
  riskScore = Math.max(0, Math.min(100, riskScore))

  // Determine risk level
  let riskLevel: RiskAssessment['riskLevel']
  if (riskScore >= 70) {
    riskLevel = 'low'
  } else if (riskScore >= 50) {
    riskLevel = 'medium'
  } else if (riskScore >= 30) {
    riskLevel = 'high'
  } else {
    riskLevel = 'very-high'
  }

  // Calculate affordable monthly payment (30% of disposable income max)
  const affordableMonthlyPayment = Math.min(disposable * 0.3, monthlyIncome * 0.3)

  // Calculate max loan amount based on affordable payment
  // Assuming 12 months tenure and 8% APR as baseline
  const maxLoanAmount = affordableMonthlyPayment * 12 * 0.92 // Approximate

  // Approval decision (DTI < 50% and riskScore >= 40)
  const approved = dti <= 50 && riskScore >= 40

  if (!approved) {
    if (dti > 50) {
      reasons.push('Application declined: DTI exceeds 50% limit')
    }
    if (riskScore < 40) {
      reasons.push('Application declined: Risk score below minimum threshold')
    }
  }

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    debtToIncomeRatio: dti,
    affordableMonthlyPayment: Math.round(affordableMonthlyPayment * 100) / 100,
    maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
    approved,
    reasons,
    recommendations
  }
}

// Calculate financial health score (0-100)
export function calculateFinancialHealthScore(
  profile: FinancialProfile,
  paymentHistory: {
    totalPayments: number
    onTimePayments: number
    latePayments: number
    missedPayments: number
  },
  accountAgeMonths: number
): {
  score: number
  breakdown: {
    paymentHistory: number // 40 points
    debtToIncome: number // 30 points
    creditUtilization: number // 20 points
    accountAge: number // 10 points
  }
  tips: string[]
} {
  const tips: string[] = []

  // Payment history (40 points)
  let paymentHistoryScore = 0
  if (paymentHistory.totalPayments > 0) {
    const onTimeRate = paymentHistory.onTimePayments / paymentHistory.totalPayments
    paymentHistoryScore = onTimeRate * 40

    if (paymentHistory.missedPayments > 0) {
      paymentHistoryScore -= paymentHistory.missedPayments * 5
      tips.push('Missed payments significantly impact your score - set up auto-pay')
    }

    if (onTimeRate < 0.95) {
      tips.push('Improve payment history by paying all bills on time')
    }
  } else {
    paymentHistoryScore = 20 // Neutral for new customers
    tips.push('Build your payment history by making timely payments')
  }

  // DTI score (30 points)
  const dti = calculateDTI(profile.monthlyIncome, profile.existingMonthlyDebts)
  let dtiScore = 30
  if (dti > 50) {
    dtiScore = 5
    tips.push('Reduce debt-to-income ratio below 40% for better rates')
  } else if (dti > 40) {
    dtiScore = 15
  } else if (dti > 30) {
    dtiScore = 25
  } else {
    dtiScore = 30
  }

  // Credit utilization (20 points) - based on multiple active plans
  // Assuming max 3 concurrent BNPL plans is healthy
  const creditUtilizationScore = 20 // Placeholder - would calculate from active plans

  // Account age (10 points)
  let accountAgeScore = 0
  if (accountAgeMonths >= 24) {
    accountAgeScore = 10
  } else if (accountAgeMonths >= 12) {
    accountAgeScore = 7
  } else if (accountAgeMonths >= 6) {
    accountAgeScore = 4
  } else {
    accountAgeScore = 2
    tips.push('Your score will improve as you build account history')
  }

  const totalScore = Math.min(
    100,
    paymentHistoryScore + dtiScore + creditUtilizationScore + accountAgeScore
  )

  return {
    score: Math.round(totalScore),
    breakdown: {
      paymentHistory: Math.round(paymentHistoryScore),
      debtToIncome: Math.round(dtiScore),
      creditUtilization: Math.round(creditUtilizationScore),
      accountAge: Math.round(accountAgeScore)
    },
    tips: tips.length > 0 ? tips : ['Great! Keep maintaining healthy financial habits']
  }
}

// Check if user can afford additional BNPL
export function canAffordAdditionalBNPL(
  profile: FinancialProfile,
  existingBNPLPayments: number,
  newMonthlyPayment: number
): {
  canAfford: boolean
  currentCommitment: number
  newCommitment: number
  maxAdditionalPayment: number
  reason?: string
} {
  const totalNewDebts = profile.existingMonthlyDebts + existingBNPLPayments + newMonthlyPayment
  const newDTI = calculateDTI(profile.monthlyIncome, totalNewDebts)

  const canAfford = newDTI <= 40 // Conservative 40% limit

  const disposable = calculateDisposableIncome(profile)
  const maxAdditionalPayment = Math.max(0, (profile.monthlyIncome * 0.40) - profile.existingMonthlyDebts - existingBNPLPayments)

  return {
    canAfford,
    currentCommitment: existingBNPLPayments,
    newCommitment: existingBNPLPayments + newMonthlyPayment,
    maxAdditionalPayment: Math.round(maxAdditionalPayment * 100) / 100,
    reason: canAfford
      ? undefined
      : `New commitment would bring DTI to ${newDTI.toFixed(1)}%, exceeding safe limit of 40%`
  }
}
