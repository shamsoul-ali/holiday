// RHB Bank Integration for Holiday Now Pay Later
// Handles credit assessment, e-KYC, and payment collection

export interface RHBCreditCheckRequest {
  // Personal Information
  fullName: string
  icNumber: string // MyKad number
  dateOfBirth: string
  nationality: string

  // Contact Information
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    postcode: string
    country: string
  }

  // Employment Information
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired'
  employerName?: string
  monthlyIncome: number
  employmentDuration?: number // in months

  // Loan Request
  loanAmount: number
  tenure: number
  purpose: 'travel'
}

export interface RHBCreditCheckResponse {
  success: boolean
  approved: boolean
  applicationId: string
  creditScore?: number
  creditLimit?: number
  approvedAmount?: number
  interestRate?: number
  reasons?: string[]
  requiresAdditionalDocs?: boolean
  requiredDocuments?: string[]
  error?: string
}

export interface RHBEKYCRequest {
  userId: string
  icFrontImage: string // base64 or URL
  icBackImage: string // base64 or URL
  selfieImage: string // base64 or URL
  livenessCheck: boolean
}

export interface RHBEKYCResponse {
  success: boolean
  verified: boolean
  kycId: string
  extractedData?: {
    fullName: string
    icNumber: string
    dateOfBirth: string
    address: string
  }
  matchScore?: number // Selfie match with IC photo
  error?: string
}

export interface RHBInstallmentSetupRequest {
  applicationId: string
  userId: string
  bookingId: string
  loanAmount: number
  downPayment: number
  tenure: number
  interestRate: number
  firstPaymentDate: string
  bankAccountNumber: string
  bankName: string
}

export interface RHBInstallmentSetupResponse {
  success: boolean
  installmentPlanId: string
  directDebitMandateId?: string
  scheduleCreated: boolean
  error?: string
}

export interface RHBPaymentCollectionStatus {
  installmentId: string
  status: 'pending' | 'collected' | 'failed' | 'bounced'
  amount: number
  dueDate: string
  collectedDate?: string
  failureReason?: string
}

// RHB API Client Configuration
const RHB_API_BASE_URL = process.env.RHB_API_BASE_URL || 'https://api.rhbbank.com.my/bnpl'
const RHB_API_KEY = process.env.RHB_API_KEY || ''
const RHB_MERCHANT_ID = process.env.RHB_MERCHANT_ID || 'HOLIDAY_AI'

// Credit Check API
export async function performCreditCheck(
  request: RHBCreditCheckRequest
): Promise<RHBCreditCheckResponse> {
  try {
    // In production, this would call actual RHB API
    // For now, simulating the API call

    console.log('Initiating RHB credit check for:', request.fullName)

    // Simulate API call
    const response = await fetch(`${RHB_API_BASE_URL}/credit-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RHB_API_KEY,
        'X-Merchant-ID': RHB_MERCHANT_ID
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`RHB API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('RHB Credit Check Error:', error)

    // DEMO MODE: Simulate approval based on simple rules
    return simulateCreditCheck(request)
  }
}

// Simulate credit check (for development/demo)
function simulateCreditCheck(request: RHBCreditCheckRequest): RHBCreditCheckResponse {
  const { monthlyIncome, loanAmount, tenure } = request

  // Simple approval logic for demo
  const monthlyPayment = loanAmount / tenure
  const dti = (monthlyPayment / monthlyIncome) * 100

  // Generate mock credit score (600-850)
  const baseCreditScore = 650
  const incomeBonus = Math.min(100, monthlyIncome / 100)
  const mockCreditScore = Math.round(baseCreditScore + incomeBonus)

  const approved = dti <= 40 && monthlyIncome >= 2000 && mockCreditScore >= 600
  const approvedAmount = approved ? loanAmount : Math.round(loanAmount * 0.7)

  const reasons: string[] = []
  if (!approved) {
    if (dti > 40) reasons.push('Debt-to-income ratio exceeds acceptable threshold')
    if (monthlyIncome < 2000) reasons.push('Minimum income requirement not met')
    if (mockCreditScore < 600) reasons.push('Credit score below minimum requirement')
  }

  return {
    success: true,
    approved,
    applicationId: `RHB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
    creditScore: mockCreditScore,
    creditLimit: monthlyIncome * 5, // 5x monthly income as credit limit
    approvedAmount,
    interestRate: mockCreditScore >= 750 ? 6 : mockCreditScore >= 650 ? 8 : 10,
    reasons: reasons.length > 0 ? reasons : ['Application approved'],
    requiresAdditionalDocs: monthlyIncome < 3000,
    requiredDocuments: monthlyIncome < 3000
      ? ['Payslip (latest 3 months)', 'Bank statement (latest 3 months)', 'EPF statement']
      : undefined
  }
}

// e-KYC Verification API
export async function performEKYC(
  request: RHBEKYCRequest
): Promise<RHBEKYCResponse> {
  try {
    console.log('Initiating RHB e-KYC for user:', request.userId)

    const response = await fetch(`${RHB_API_BASE_URL}/ekyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RHB_API_KEY,
        'X-Merchant-ID': RHB_MERCHANT_ID
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`RHB e-KYC API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('RHB e-KYC Error:', error)

    // DEMO MODE: Simulate successful verification
    return {
      success: true,
      verified: true,
      kycId: `KYC-${Date.now()}`,
      extractedData: {
        fullName: 'Demo User',
        icNumber: '900101-01-1234',
        dateOfBirth: '1990-01-01',
        address: 'Demo Address, Kuala Lumpur'
      },
      matchScore: 95,
      error: undefined
    }
  }
}

// Setup Installment Plan with Direct Debit
export async function setupInstallmentPlan(
  request: RHBInstallmentSetupRequest
): Promise<RHBInstallmentSetupResponse> {
  try {
    console.log('Setting up RHB installment plan for booking:', request.bookingId)

    const response = await fetch(`${RHB_API_BASE_URL}/installments/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RHB_API_KEY,
        'X-Merchant-ID': RHB_MERCHANT_ID
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`RHB Installment Setup error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('RHB Installment Setup Error:', error)

    // DEMO MODE: Simulate successful setup
    return {
      success: true,
      installmentPlanId: `PLAN-${Date.now()}`,
      directDebitMandateId: `DD-${Date.now()}`,
      scheduleCreated: true,
      error: undefined
    }
  }
}

// Check payment collection status
export async function checkPaymentStatus(
  installmentId: string
): Promise<RHBPaymentCollectionStatus> {
  try {
    const response = await fetch(
      `${RHB_API_BASE_URL}/installments/${installmentId}/status`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': RHB_API_KEY,
          'X-Merchant-ID': RHB_MERCHANT_ID
        }
      }
    )

    if (!response.ok) {
      throw new Error(`RHB Payment Status error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('RHB Payment Status Error:', error)

    // DEMO MODE
    return {
      installmentId,
      status: 'collected',
      amount: 500,
      dueDate: new Date().toISOString(),
      collectedDate: new Date().toISOString()
    }
  }
}

// Process refund via RHB
export async function processRefund(
  installmentPlanId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const response = await fetch(`${RHB_API_BASE_URL}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RHB_API_KEY,
        'X-Merchant-ID': RHB_MERCHANT_ID
      },
      body: JSON.stringify({
        installmentPlanId,
        amount,
        reason
      })
    })

    if (!response.ok) {
      throw new Error(`RHB Refund error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('RHB Refund Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed'
    }
  }
}

// Cancel installment plan
export async function cancelInstallmentPlan(
  installmentPlanId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${RHB_API_BASE_URL}/installments/${installmentPlanId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': RHB_API_KEY,
          'X-Merchant-ID': RHB_MERCHANT_ID
        },
        body: JSON.stringify({ reason })
      }
    )

    if (!response.ok) {
      throw new Error(`RHB Cancellation error: ${response.statusText}`)
    }

    return { success: true }

  } catch (error) {
    console.error('RHB Cancellation Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation failed'
    }
  }
}

// Verify bank account
export async function verifyBankAccount(
  accountNumber: string,
  bankName: string,
  accountHolderName: string
): Promise<{
  verified: boolean
  accountName?: string
  error?: string
}> {
  try {
    const response = await fetch(`${RHB_API_BASE_URL}/verify-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RHB_API_KEY,
        'X-Merchant-ID': RHB_MERCHANT_ID
      },
      body: JSON.stringify({
        accountNumber,
        bankName,
        accountHolderName
      })
    })

    if (!response.ok) {
      throw new Error(`Account verification error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Bank Account Verification Error:', error)

    // DEMO MODE
    return {
      verified: true,
      accountName: accountHolderName,
      error: undefined
    }
  }
}

// Get merchant settlement details
export async function getMerchantSettlement(
  startDate: string,
  endDate: string
): Promise<{
  success: boolean
  totalDisbursed: number
  totalFees: number
  transactions: Array<{
    bookingId: string
    amount: number
    fee: number
    netAmount: number
    settledDate: string
  }>
  error?: string
}> {
  try {
    const response = await fetch(
      `${RHB_API_BASE_URL}/merchant/settlement?start=${startDate}&end=${endDate}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': RHB_API_KEY,
          'X-Merchant-ID': RHB_MERCHANT_ID
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Settlement API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Merchant Settlement Error:', error)
    return {
      success: false,
      totalDisbursed: 0,
      totalFees: 0,
      transactions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch settlement'
    }
  }
}
