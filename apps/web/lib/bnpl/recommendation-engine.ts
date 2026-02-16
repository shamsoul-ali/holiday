// Smart Recommendation Engine for BNPL
// AI-powered suggestions for optimal payment plans

import { calculateInstallmentPlan, type InstallmentPlan } from './installment-calculator'
import { assessRisk, type FinancialProfile, calculateDTI } from './risk-calculator'
import { DEFAULT_BNPL_CONFIG } from './payment-plan-service'

export interface PaymentPlanRecommendation {
  tenure: number
  plan: InstallmentPlan
  recommendationScore: number // 0-100
  badges: string[]
  pros: string[]
  cons: string[]
  bestFor: string
  aiInsight: string
}

export interface SmartRecommendation {
  topPick: PaymentPlanRecommendation
  alternatives: PaymentPlanRecommendation[]
  warnings: string[]
  insights: string[]
}

// Generate smart recommendations based on user's financial profile
export function generateSmartRecommendations(
  tripAmount: number,
  financialProfile: FinancialProfile,
  preferences?: {
    preferLowMonthly?: boolean
    preferLowInterest?: boolean
    targetPayoffDate?: Date
  }
): SmartRecommendation {
  const { monthlyIncome, existingMonthlyDebts } = financialProfile
  const config = DEFAULT_BNPL_CONFIG

  const warnings: string[] = []
  const insights: string[] = []
  const recommendations: PaymentPlanRecommendation[] = []

  // Calculate DTI before any new commitment
  const currentDTI = calculateDTI(monthlyIncome, existingMonthlyDebts)

  // Analyze each tenure option
  for (const tenure of config.availableTenures) {
    const interestRate = config.interestRates[tenure] || 0

    // Calculate optimal down payment
    let optimalDownPayment = 0
    const basePlan = calculateInstallmentPlan({
      principal: tripAmount,
      downPaymentPercent: 0,
      tenure,
      interestRate
    })

    // If monthly payment causes DTI > 35%, suggest down payment
    const newDTI = calculateDTI(monthlyIncome, existingMonthlyDebts + basePlan.monthlyPayment)
    if (newDTI > 35) {
      // Calculate required down payment to bring DTI to 35%
      const targetMonthlyPayment = (monthlyIncome * 0.35) - existingMonthlyDebts
      optimalDownPayment = Math.ceil(
        ((basePlan.monthlyPayment - targetMonthlyPayment) / basePlan.monthlyPayment) * 100
      )
      optimalDownPayment = Math.min(50, Math.max(0, optimalDownPayment))
    }

    const plan = calculateInstallmentPlan({
      principal: tripAmount,
      downPaymentPercent: optimalDownPayment,
      tenure,
      interestRate
    })

    const riskAssessment = assessRisk(financialProfile, plan.monthlyPayment)

    // Calculate recommendation score
    let score = 50 // Base score

    // Factor 1: Affordability (30 points)
    if (riskAssessment.approved) {
      score += 30
    } else {
      score -= 20
    }

    if (riskAssessment.debtToIncomeRatio <= 30) {
      score += 10
    } else if (riskAssessment.debtToIncomeRatio <= 40) {
      score += 5
    } else {
      score -= 10
    }

    // Factor 2: Interest cost (20 points)
    const interestPercentage = (plan.totalInterest / tripAmount) * 100
    if (interestPercentage === 0) {
      score += 20 // 0% interest is best
    } else if (interestPercentage < 5) {
      score += 15
    } else if (interestPercentage < 10) {
      score += 10
    } else {
      score += 5
    }

    // Factor 3: User preferences (20 points)
    if (preferences?.preferLowMonthly && tenure >= 12) {
      score += 20
    } else if (preferences?.preferLowInterest && interestRate <= 6) {
      score += 20
    }

    // Factor 4: Payment flexibility (10 points)
    if (tenure >= 6 && tenure <= 12) {
      score += 10 // Sweet spot
    }

    // Cap score between 0-100
    score = Math.max(0, Math.min(100, score))

    // Generate badges
    const badges: string[] = []
    if (interestRate === 0) badges.push('0% Interest')
    if (score >= 80) badges.push('Recommended')
    if (tenure === 3) badges.push('Quick Payoff')
    if (tenure >= 12) badges.push('Low Monthly')
    if (riskAssessment.debtToIncomeRatio <= 30) badges.push('Comfortable')

    // Generate pros and cons
    const pros: string[] = []
    const cons: string[] = []

    if (interestRate === 0) {
      pros.push('No interest charges - save money')
    } else {
      cons.push(`${interestRate}% APR - RM ${plan.totalInterest.toLocaleString()} total interest`)
    }

    if (plan.monthlyPayment <= monthlyIncome * 0.15) {
      pros.push('Low monthly impact on budget')
    } else if (plan.monthlyPayment > monthlyIncome * 0.25) {
      cons.push('High monthly payment relative to income')
    }

    if (tenure <= 6) {
      pros.push('Debt-free quickly')
      cons.push('Higher monthly payments')
    } else {
      pros.push('Affordable monthly payments')
      if (interestRate > 0) {
        cons.push('More interest paid over time')
      }
    }

    // Best for description
    let bestFor = ''
    if (tenure === 3 && interestRate === 0) {
      bestFor = 'Those who want to pay quickly without interest'
    } else if (tenure === 6) {
      bestFor = 'Balanced approach between affordability and speed'
    } else if (tenure === 12) {
      bestFor = 'Spreading cost over a year with manageable payments'
    } else if (tenure === 24) {
      bestFor = 'Minimizing monthly budget impact'
    }

    // AI Insight
    const aiInsight = generateAIInsight(
      plan,
      tenure,
      interestRate,
      riskAssessment.debtToIncomeRatio,
      currentDTI,
      monthlyIncome
    )

    recommendations.push({
      tenure,
      plan,
      recommendationScore: Math.round(score),
      badges,
      pros,
      cons,
      bestFor,
      aiInsight
    })
  }

  // Sort by recommendation score
  recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

  // Generate warnings
  if (currentDTI > 40) {
    warnings.push('⚠️ Your current debt-to-income ratio is high. Consider reducing existing debts first.')
  }

  if (!recommendations[0].plan) {
    warnings.push('⚠️ Unable to generate recommendations. Please adjust your trip budget or increase income.')
  }

  const topPlan = recommendations[0]
  if (topPlan && topPlan.plan.totalInterest > tripAmount * 0.15) {
    warnings.push(`⚠️ Interest costs are ${((topPlan.plan.totalInterest / tripAmount) * 100).toFixed(0)}% of trip cost. Consider shorter tenure or higher down payment.`)
  }

  // Generate insights
  if (tripAmount > monthlyIncome * 3) {
    insights.push('💡 This trip costs more than 3x your monthly income. Consider saving up for a larger down payment.')
  }

  const bestPlan = recommendations[0]
  if (bestPlan && bestPlan.plan.totalInterest === 0) {
    insights.push(`💡 Take advantage of the 0% interest promotion on ${bestPlan.tenure}-month plan!`)
  }

  if (currentDTI <= 20 && monthlyIncome >= 5000) {
    insights.push('💡 You have excellent financial capacity. You may qualify for premium rates with RHB.')
  }

  // Calculate savings potential
  const fastestPlan = recommendations.find(r => r.tenure === 3)
  const longestPlan = recommendations.find(r => r.tenure === 24)
  if (fastestPlan && longestPlan && longestPlan.plan.totalInterest > 0) {
    const savings = longestPlan.plan.totalInterest - fastestPlan.plan.totalInterest
    insights.push(`💡 Choosing 3-month plan over 24-month saves RM ${savings.toLocaleString()} in interest.`)
  }

  return {
    topPick: recommendations[0],
    alternatives: recommendations.slice(1),
    warnings,
    insights
  }
}

// Generate AI-powered insight for a specific plan
function generateAIInsight(
  plan: InstallmentPlan,
  tenure: number,
  interestRate: number,
  newDTI: number,
  currentDTI: number,
  monthlyIncome: number
): string {
  const insights: string[] = []

  // DTI impact
  const dtiIncrease = newDTI - currentDTI
  if (dtiIncrease <= 10) {
    insights.push(`This plan adds only ${dtiIncrease.toFixed(1)}% to your debt burden`)
  } else if (dtiIncrease <= 20) {
    insights.push(`This plan increases your debt load by ${dtiIncrease.toFixed(1)}%`)
  } else {
    insights.push(`Caution: This significantly increases your debt-to-income ratio`)
  }

  // Monthly payment context
  const paymentAsPercentage = (plan.monthlyPayment / monthlyIncome) * 100
  if (paymentAsPercentage <= 10) {
    insights.push('with minimal impact on your monthly budget')
  } else if (paymentAsPercentage <= 20) {
    insights.push('while keeping monthly payments manageable')
  } else {
    insights.push('but requires careful budget management')
  }

  // Interest efficiency
  if (interestRate === 0) {
    insights.push('Pay zero interest - maximum value for money')
  } else if (plan.totalInterest < plan.monthlyPayment) {
    insights.push(`Total interest is less than one monthly payment`)
  } else {
    const interestMonths = Math.round(plan.totalInterest / plan.monthlyPayment)
    insights.push(`Interest equals ~${interestMonths} additional month${interestMonths > 1 ? 's' : ''} of payment`)
  }

  // Payoff timeline
  const payoffDate = new Date()
  payoffDate.setMonth(payoffDate.getMonth() + tenure)
  insights.push(`Debt-free by ${payoffDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`)

  return insights.join('. ') + '.'
}

// Suggest optimal down payment
export function suggestOptimalDownPayment(
  tripAmount: number,
  tenure: number,
  financialProfile: FinancialProfile
): {
  suggestedPercent: number
  suggestedAmount: number
  reason: string
  savings: number
} {
  const interestRate = DEFAULT_BNPL_CONFIG.interestRates[tenure] || 0
  const { monthlyIncome, existingMonthlyDebts } = financialProfile

  // Calculate max affordable monthly payment (30% of disposable income)
  const maxAffordable = (monthlyIncome - existingMonthlyDebts) * 0.3

  // Binary search for optimal down payment
  let low = 0
  let high = 50
  let optimalPercent = 0

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    const plan = calculateInstallmentPlan({
      principal: tripAmount,
      downPaymentPercent: mid,
      tenure,
      interestRate
    })

    if (plan.monthlyPayment > maxAffordable) {
      low = mid // Need more down payment
    } else {
      high = mid
      optimalPercent = mid
    }
  }

  const finalPlan = calculateInstallmentPlan({
    principal: tripAmount,
    downPaymentPercent: optimalPercent,
    tenure,
    interestRate
  })

  const zeroDo wnPlan = calculateInstallmentPlan({
    principal: tripAmount,
    downPaymentPercent: 0,
    tenure,
    interestRate
  })

  const savings = zeroDownPlan.totalInterest - finalPlan.totalInterest

  let reason = ''
  if (optimalPercent === 0) {
    reason = 'No down payment needed - your monthly payment is comfortably within budget'
  } else if (optimalPercent <= 20) {
    reason = `A ${optimalPercent}% down payment keeps your monthly payment at a comfortable level`
  } else {
    reason = `A ${optimalPercent}% down payment is recommended to keep monthly payments affordable`
  }

  return {
    suggestedPercent: optimalPercent,
    suggestedAmount: finalPlan.downPayment,
    reason,
    savings: Math.round(savings)
  }
}

// Check if user should wait before taking new BNPL
export function shouldWaitBeforeBNPL(
  financialProfile: FinancialProfile,
  existingPlansEndDates: Date[]
): {
  shouldWait: boolean
  reason?: string
  waitUntil?: Date
  alternativeSuggestion?: string
} {
  const { monthlyIncome, existingMonthlyDebts } = financialProfile
  const currentDTI = calculateDTI(monthlyIncome, existingMonthlyDebts)

  // Check if DTI is already high
  if (currentDTI > 40) {
    return {
      shouldWait: true,
      reason: 'Your debt-to-income ratio is already at 40%+',
      alternativeSuggestion: 'Consider paying off some existing debts first, or save up for this trip'
    }
  }

  // Check if multiple plans ending soon
  const now = new Date()
  const plansEndingSoon = existingPlansEndDates.filter(date => {
    const monthsUntilEnd = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsUntilEnd <= 3
  })

  if (plansEndingSoon.length >= 2) {
    const earliestEnd = plansEndingSoon.sort((a, b) => a.getTime() - b.getTime())[0]
    return {
      shouldWait: true,
      reason: `You have ${plansEndingSoon.length} payment plans ending within 3 months`,
      waitUntil: earliestEnd,
      alternativeSuggestion: `Wait ${Math.ceil((earliestEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days to free up your monthly budget`
    }
  }

  return {
    shouldWait: false
  }
}
