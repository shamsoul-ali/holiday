// Installment Calculator for Holiday Now Pay Later
// Calculates payment schedules, interest, and total costs

export interface InstallmentPlan {
  tenure: number // in months
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  interestRate: number // annual percentage rate
  downPayment: number
  installments: InstallmentDetail[]
}

export interface InstallmentDetail {
  installmentNumber: number
  dueDate: Date
  principal: number
  interest: number
  totalPayment: number
  remainingBalance: number
}

export interface CalculatorInput {
  principal: number // total trip cost
  downPaymentPercent: number // 0-50
  tenure: number // 3, 6, 12, 24 months
  interestRate: number // annual APR (0 for promo)
  startDate?: Date
}

// Calculate installment plan with amortization schedule
export function calculateInstallmentPlan(input: CalculatorInput): InstallmentPlan {
  const { principal, downPaymentPercent, tenure, interestRate, startDate = new Date() } = input

  // Calculate down payment and financed amount
  const downPayment = principal * (downPaymentPercent / 100)
  const financedAmount = principal - downPayment

  // Monthly interest rate
  const monthlyRate = interestRate / 12 / 100

  // Calculate monthly payment using amortization formula
  let monthlyPayment: number
  let totalInterest: number

  if (interestRate === 0) {
    // 0% interest - simple division
    monthlyPayment = financedAmount / tenure
    totalInterest = 0
  } else {
    // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, tenure)
    const denominator = Math.pow(1 + monthlyRate, tenure) - 1
    monthlyPayment = financedAmount * (numerator / denominator)
    totalInterest = (monthlyPayment * tenure) - financedAmount
  }

  // Generate installment schedule
  const installments: InstallmentDetail[] = []
  let remainingBalance = financedAmount

  for (let i = 1; i <= tenure; i++) {
    const interestPayment = interestRate === 0 ? 0 : remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment

    // Handle final payment rounding differences
    const isLastPayment = i === tenure
    const adjustedPrincipal = isLastPayment ? remainingBalance : principalPayment
    const adjustedPayment = adjustedPrincipal + interestPayment

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    installments.push({
      installmentNumber: i,
      dueDate,
      principal: adjustedPrincipal,
      interest: interestPayment,
      totalPayment: adjustedPayment,
      remainingBalance: remainingBalance - adjustedPrincipal
    })

    remainingBalance -= adjustedPrincipal
  }

  const totalAmount = downPayment + (monthlyPayment * tenure)

  return {
    tenure,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    interestRate,
    downPayment: Math.round(downPayment * 100) / 100,
    installments
  }
}

// Calculate early settlement amount with rebate
export function calculateEarlySettlement(
  plan: InstallmentPlan,
  paidInstallments: number
): {
  remainingPrincipal: number
  remainingInterest: number
  interestRebate: number
  settlementAmount: number
} {
  const remainingInstallments = plan.installments.slice(paidInstallments)

  const remainingPrincipal = remainingInstallments.reduce(
    (sum, inst) => sum + inst.principal,
    0
  )

  const remainingInterest = remainingInstallments.reduce(
    (sum, inst) => sum + inst.interest,
    0
  )

  // Rule of 78 rebate (standard in Malaysia)
  // Customer gets back unearned interest
  const interestRebate = remainingInterest * 0.8 // 80% rebate is common

  const settlementAmount = remainingPrincipal + remainingInterest - interestRebate

  return {
    remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    remainingInterest: Math.round(remainingInterest * 100) / 100,
    interestRebate: Math.round(interestRebate * 100) / 100,
    settlementAmount: Math.round(settlementAmount * 100) / 100
  }
}

// Calculate late payment fee
export function calculateLatePaymentFee(
  missedPayment: number,
  daysOverdue: number,
  config: { flatFee: number; dailyPenaltyRate: number }
): number {
  const { flatFee, dailyPenaltyRate } = config

  // Flat fee + daily penalty
  const dailyPenalty = missedPayment * (dailyPenaltyRate / 100) * daysOverdue
  const totalFee = flatFee + dailyPenalty

  // Cap at 20% of missed payment (reasonable limit)
  const maxFee = missedPayment * 0.20

  return Math.min(totalFee, maxFee)
}

// Compare multiple tenure options
export function compareTenureOptions(
  principal: number,
  downPaymentPercent: number,
  tenures: number[],
  interestRateMap: Record<number, number>
): InstallmentPlan[] {
  return tenures.map(tenure =>
    calculateInstallmentPlan({
      principal,
      downPaymentPercent,
      tenure,
      interestRate: interestRateMap[tenure] || 0
    })
  )
}

// Calculate savings from down payment
export function calculateDownPaymentSavings(
  principal: number,
  tenure: number,
  interestRate: number,
  downPaymentOptions: number[]
): Array<{
  downPaymentPercent: number
  downPaymentAmount: number
  monthlyPayment: number
  totalInterest: number
  savingsVsZeroDown: number
}> {
  const zeroDownPlan = calculateInstallmentPlan({
    principal,
    downPaymentPercent: 0,
    tenure,
    interestRate
  })

  return downPaymentOptions.map(downPaymentPercent => {
    const plan = calculateInstallmentPlan({
      principal,
      downPaymentPercent,
      tenure,
      interestRate
    })

    return {
      downPaymentPercent,
      downPaymentAmount: plan.downPayment,
      monthlyPayment: plan.monthlyPayment,
      totalInterest: plan.totalInterest,
      savingsVsZeroDown: zeroDownPlan.totalInterest - plan.totalInterest
    }
  })
}

// Effective APR calculator (includes all fees)
export function calculateEffectiveAPR(
  principal: number,
  monthlyPayment: number,
  tenure: number,
  upfrontFees: number = 0
): number {
  // Adjust principal for fees
  const adjustedPrincipal = principal + upfrontFees
  const totalPaid = monthlyPayment * tenure
  const totalInterest = totalPaid - principal

  // Simple effective rate
  const effectiveAPR = (totalInterest / principal) * (12 / tenure) * 100

  return Math.round(effectiveAPR * 100) / 100
}
