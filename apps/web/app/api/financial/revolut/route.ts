import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'

// Revolut Integration for Travel Financial Services
// Multi-currency accounts, travel cards, real-time exchange rates
// No FX fees, instant notifications, spending analytics

interface RevolutAccountRequest {
  user_id: string
  account_type: 'personal' | 'business'
  base_currency: string
  travel_destinations: string[]
}

interface RevolutExchangeRateRequest {
  from_currency: string
  to_currency: string
  amount?: number
}

interface RevolutTravelCardRequest {
  user_id: string
  card_type: 'virtual' | 'physical'
  currencies: string[]
  spending_limit?: number
  notification_preferences?: {
    transactions: boolean
    balance_alerts: boolean
    rate_alerts: boolean
  }
}

interface RevolutAccount {
  account_id: string
  user_id: string
  account_type: 'personal' | 'business'
  status: 'active' | 'pending' | 'suspended'
  base_currency: string
  balances: {
    currency: string
    amount: number
    available: number
    pending: number
  }[]
  cards: RevolutTravelCard[]
  features: {
    fx_rates: boolean
    travel_insurance: boolean
    airport_lounge_access: boolean
    concierge_service: boolean
    cashback: boolean
  }
  limits: {
    daily_spending: number
    monthly_spending: number
    atm_withdrawal: number
    currency: string
  }
  created_at: string
}

interface RevolutTravelCard {
  card_id: string
  card_number: string // masked
  card_type: 'virtual' | 'physical'
  status: 'active' | 'blocked' | 'expired'
  currencies: string[]
  spending_controls: {
    categories: string[]
    countries: string[]
    merchant_types: string[]
  }
  security_features: {
    location_based: boolean
    contactless_limit: number
    online_purchases: boolean
    atm_withdrawals: boolean
  }
  travel_benefits: {
    no_fx_fees: boolean
    interbank_rates: boolean
    travel_insurance: boolean
    purchase_protection: boolean
  }
}

interface RevolutExchangeRate {
  from_currency: string
  to_currency: string
  rate: number
  buy_rate: number
  sell_rate: number
  margin: number
  timestamp: string
  trend: 'up' | 'down' | 'stable'
  historical_data?: {
    period: string
    rates: { date: string; rate: number }[]
  }
}

interface RevolutTransaction {
  transaction_id: string
  type: 'payment' | 'exchange' | 'transfer' | 'atm_withdrawal'
  amount: number
  currency: string
  converted_amount?: number
  converted_currency?: string
  exchange_rate?: number
  merchant: {
    name: string
    category: string
    location: {
      country: string
      city: string
    }
  }
  status: 'completed' | 'pending' | 'declined'
  timestamp: string
  fees: {
    fx_fee: number
    atm_fee: number
    other_fees: number
  }
}

interface RevolutTravelAnalytics {
  user_id: string
  period: string
  spending_by_currency: {
    currency: string
    amount: number
    percentage: number
  }[]
  spending_by_category: {
    category: string
    amount: number
    transactions: number
  }[]
  spending_by_country: {
    country: string
    amount: number
    days: number
  }[]
  fx_savings: {
    total_saved: number
    currency: string
    vs_traditional_banks: number
  }
  recommendations: {
    type: string
    message: string
    potential_savings: number
  }[]
}

interface RevolutResponse {
  success: boolean
  data?: any
  accounts?: RevolutAccount[]
  cards?: RevolutTravelCard[]
  exchange_rates?: RevolutExchangeRate[]
  transactions?: RevolutTransaction[]
  analytics?: RevolutTravelAnalytics
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('user_id')
    const fromCurrency = searchParams.get('from_currency')
    const toCurrency = searchParams.get('to_currency')
    const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : undefined

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required'
      }, { status: 400 })
    }

    // Real Revolut API integration would go here
    if (API_CONFIG.REVOLUT.API_KEY) {
      try {
        const baseUrl = API_CONFIG.REVOLUT.BASE_URL
        let endpoint = ''
        let queryParams = new URLSearchParams()

        switch (action) {
          case 'accounts':
            endpoint = 'accounts'
            if (userId) queryParams.set('user_id', userId)
            break
          case 'exchange_rates':
            endpoint = 'rates'
            if (fromCurrency) queryParams.set('from', fromCurrency)
            if (toCurrency) queryParams.set('to', toCurrency)
            break
          case 'transactions':
            endpoint = 'transactions'
            if (userId) queryParams.set('user_id', userId)
            break
          case 'analytics':
            endpoint = 'analytics'
            if (userId) queryParams.set('user_id', userId)
            break
        }

        const response = await fetch(`${baseUrl}/${endpoint}?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.REVOLUT.API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(processRevolutResponse(action, data))
        }
      } catch (apiError) {
        console.error('Revolut API error:', apiError)
        // Fall back to mock data
      }
    }

    // Mock data based on action
    switch (action) {
      case 'accounts':
        return handleAccountsRequest(userId)
      case 'exchange_rates':
        return handleExchangeRatesRequest(fromCurrency, toCurrency, amount)
      case 'transactions':
        return handleTransactionsRequest(userId)
      case 'analytics':
        return handleAnalyticsRequest(userId)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Revolut integration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process Revolut request'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action is required'
      }, { status: 400 })
    }

    // Real Revolut API integration would go here
    if (API_CONFIG.REVOLUT.API_KEY) {
      try {
        let endpoint = ''
        let requestBody = {}

        switch (action) {
          case 'create_account':
            endpoint = 'accounts'
            requestBody = {
              user_id: body.user_id,
              account_type: body.account_type,
              base_currency: body.base_currency
            }
            break
          case 'create_card':
            endpoint = 'cards'
            requestBody = {
              account_id: body.account_id,
              card_type: body.card_type,
              currencies: body.currencies
            }
            break
          case 'exchange_currency':
            endpoint = 'exchanges'
            requestBody = {
              from_currency: body.from_currency,
              to_currency: body.to_currency,
              amount: body.amount
            }
            break
        }

        const response = await fetch(`${API_CONFIG.REVOLUT.BASE_URL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_CONFIG.REVOLUT.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ success: true, data })
        }
      } catch (apiError) {
        console.error('Revolut API error:', apiError)
      }
    }

    // Mock responses for different actions
    switch (action) {
      case 'create_account':
        return handleCreateAccount(body)
      case 'create_card':
        return handleCreateCard(body)
      case 'exchange_currency':
        return handleExchangeCurrency(body)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Revolut POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process Revolut request'
    }, { status: 500 })
  }
}

// Mock handlers
async function handleAccountsRequest(userId?: string | null): Promise<Response> {
  const mockAccounts: RevolutAccount[] = [
    {
      account_id: 'rev_acc_123456',
      user_id: userId || 'user_123',
      account_type: 'personal',
      status: 'active',
      base_currency: 'MYR',
      balances: [
        { currency: 'MYR', amount: 5000.00, available: 4950.00, pending: 50.00 },
        { currency: 'USD', amount: 500.00, available: 500.00, pending: 0.00 },
        { currency: 'EUR', amount: 300.00, available: 300.00, pending: 0.00 },
        { currency: 'GBP', amount: 200.00, available: 200.00, pending: 0.00 },
        { currency: 'SGD', amount: 400.00, available: 400.00, pending: 0.00 },
        { currency: 'THB', amount: 2000.00, available: 2000.00, pending: 0.00 }
      ],
      cards: [
        {
          card_id: 'rev_card_789',
          card_number: '**** **** **** 1234',
          card_type: 'physical',
          status: 'active',
          currencies: ['MYR', 'USD', 'EUR', 'GBP', 'SGD', 'THB'],
          spending_controls: {
            categories: ['travel', 'restaurants', 'transportation'],
            countries: ['MY', 'US', 'GB', 'SG', 'TH', 'ID'],
            merchant_types: ['airlines', 'hotels', 'car_rental']
          },
          security_features: {
            location_based: true,
            contactless_limit: 250,
            online_purchases: true,
            atm_withdrawals: true
          },
          travel_benefits: {
            no_fx_fees: true,
            interbank_rates: true,
            travel_insurance: true,
            purchase_protection: true
          }
        }
      ],
      features: {
        fx_rates: true,
        travel_insurance: true,
        airport_lounge_access: false,
        concierge_service: false,
        cashback: true
      },
      limits: {
        daily_spending: 10000,
        monthly_spending: 50000,
        atm_withdrawal: 2000,
        currency: 'MYR'
      },
      created_at: '2023-06-15T10:00:00Z'
    }
  ]

  return NextResponse.json({
    success: true,
    accounts: mockAccounts
  })
}

async function handleExchangeRatesRequest(
  fromCurrency?: string | null, 
  toCurrency?: string | null, 
  amount?: number
): Promise<Response> {
  const mockRates: RevolutExchangeRate[] = [
    {
      from_currency: fromCurrency || 'MYR',
      to_currency: toCurrency || 'USD',
      rate: 0.2143,
      buy_rate: 0.2141,
      sell_rate: 0.2145,
      margin: 0.5, // 0.5% margin
      timestamp: new Date().toISOString(),
      trend: 'stable',
      historical_data: {
        period: '30d',
        rates: [
          { date: '2024-02-15', rate: 0.2140 },
          { date: '2024-02-20', rate: 0.2142 },
          { date: '2024-02-25', rate: 0.2143 },
          { date: '2024-03-01', rate: 0.2144 },
          { date: '2024-03-05', rate: 0.2143 }
        ]
      }
    },
    {
      from_currency: 'MYR',
      to_currency: 'EUR',
      rate: 0.1972,
      buy_rate: 0.1970,
      sell_rate: 0.1974,
      margin: 0.5,
      timestamp: new Date().toISOString(),
      trend: 'down'
    },
    {
      from_currency: 'MYR',
      to_currency: 'GBP',
      rate: 0.1698,
      buy_rate: 0.1696,
      sell_rate: 0.1700,
      margin: 0.5,
      timestamp: new Date().toISOString(),
      trend: 'up'
    },
    {
      from_currency: 'MYR',
      to_currency: 'SGD',
      rate: 0.2887,
      buy_rate: 0.2885,
      sell_rate: 0.2889,
      margin: 0.5,
      timestamp: new Date().toISOString(),
      trend: 'stable'
    }
  ]

  const filteredRates = fromCurrency && toCurrency 
    ? mockRates.filter(rate => 
        rate.from_currency === fromCurrency && rate.to_currency === toCurrency
      )
    : mockRates

  return NextResponse.json({
    success: true,
    exchange_rates: filteredRates
  })
}

async function handleTransactionsRequest(userId?: string | null): Promise<Response> {
  const mockTransactions: RevolutTransaction[] = [
    {
      transaction_id: 'rev_txn_001',
      type: 'payment',
      amount: -150.00,
      currency: 'USD',
      converted_amount: -700.00,
      converted_currency: 'MYR',
      exchange_rate: 0.2143,
      merchant: {
        name: 'Singapore Airlines',
        category: 'Airlines',
        location: {
          country: 'Singapore',
          city: 'Singapore'
        }
      },
      status: 'completed',
      timestamp: '2024-03-10T14:30:00Z',
      fees: {
        fx_fee: 0.00, // No FX fees with Revolut
        atm_fee: 0.00,
        other_fees: 0.00
      }
    },
    {
      transaction_id: 'rev_txn_002',
      type: 'exchange',
      amount: -1000.00,
      currency: 'MYR',
      converted_amount: 214.30,
      converted_currency: 'USD',
      exchange_rate: 0.2143,
      merchant: {
        name: 'Currency Exchange',
        category: 'Financial',
        location: {
          country: 'Malaysia',
          city: 'Kuala Lumpur'
        }
      },
      status: 'completed',
      timestamp: '2024-03-09T10:15:00Z',
      fees: {
        fx_fee: 0.00,
        atm_fee: 0.00,
        other_fees: 0.00
      }
    },
    {
      transaction_id: 'rev_txn_003',
      type: 'atm_withdrawal',
      amount: -100.00,
      currency: 'EUR',
      converted_amount: -507.00,
      converted_currency: 'MYR',
      exchange_rate: 0.1972,
      merchant: {
        name: 'Deutsche Bank ATM',
        category: 'ATM',
        location: {
          country: 'Germany',
          city: 'Berlin'
        }
      },
      status: 'completed',
      timestamp: '2024-03-08T16:45:00Z',
      fees: {
        fx_fee: 0.00,
        atm_fee: 0.00, // Free up to monthly limit
        other_fees: 0.00
      }
    }
  ]

  return NextResponse.json({
    success: true,
    transactions: mockTransactions
  })
}

async function handleAnalyticsRequest(userId?: string | null): Promise<Response> {
  const mockAnalytics: RevolutTravelAnalytics = {
    user_id: userId || 'user_123',
    period: 'last_30_days',
    spending_by_currency: [
      { currency: 'MYR', amount: 2500.00, percentage: 45.5 },
      { currency: 'USD', amount: 1500.00, percentage: 27.3 },
      { currency: 'EUR', amount: 800.00, percentage: 14.5 },
      { currency: 'GBP', amount: 450.00, percentage: 8.2 },
      { currency: 'SGD', amount: 250.00, percentage: 4.5 }
    ],
    spending_by_category: [
      { category: 'Travel & Transport', amount: 2200.00, transactions: 8 },
      { category: 'Restaurants & Dining', amount: 1800.00, transactions: 15 },
      { category: 'Hotels & Accommodation', amount: 1200.00, transactions: 4 },
      { category: 'Shopping', amount: 300.00, transactions: 6 }
    ],
    spending_by_country: [
      { country: 'Malaysia', amount: 2500.00, days: 20 },
      { country: 'Singapore', amount: 1200.00, days: 3 },
      { country: 'Thailand', amount: 800.00, days: 5 },
      { country: 'Germany', amount: 500.00, days: 2 }
    ],
    fx_savings: {
      total_saved: 125.50,
      currency: 'MYR',
      vs_traditional_banks: 2.8 // percentage
    },
    recommendations: [
      {
        type: 'currency_optimization',
        message: 'Hold more EUR for your upcoming European trip to avoid conversion fees',
        potential_savings: 45.00
      },
      {
        type: 'spending_alert',
        message: 'You\'re spending 25% more on dining while traveling. Consider budget tracking.',
        potential_savings: 0.00
      },
      {
        type: 'rate_alert',
        message: 'USD is at a 3-month low. Good time to exchange MYR to USD.',
        potential_savings: 25.00
      }
    ]
  }

  return NextResponse.json({
    success: true,
    analytics: mockAnalytics
  })
}

async function handleCreateAccount(body: any): Promise<Response> {
  const mockAccount: RevolutAccount = {
    account_id: `rev_acc_${Date.now()}`,
    user_id: body.user_id,
    account_type: body.account_type || 'personal',
    status: 'pending',
    base_currency: body.base_currency || 'MYR',
    balances: [
      { currency: body.base_currency || 'MYR', amount: 0.00, available: 0.00, pending: 0.00 }
    ],
    cards: [],
    features: {
      fx_rates: true,
      travel_insurance: body.account_type === 'personal',
      airport_lounge_access: false,
      concierge_service: false,
      cashback: true
    },
    limits: {
      daily_spending: body.account_type === 'business' ? 50000 : 10000,
      monthly_spending: body.account_type === 'business' ? 200000 : 50000,
      atm_withdrawal: 2000,
      currency: body.base_currency || 'MYR'
    },
    created_at: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    data: mockAccount
  })
}

async function handleCreateCard(body: any): Promise<Response> {
  const mockCard: RevolutTravelCard = {
    card_id: `rev_card_${Date.now()}`,
    card_number: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
    card_type: body.card_type || 'virtual',
    status: 'active',
    currencies: body.currencies || ['MYR', 'USD'],
    spending_controls: {
      categories: ['all'],
      countries: ['all'],
      merchant_types: ['all']
    },
    security_features: {
      location_based: true,
      contactless_limit: 250,
      online_purchases: true,
      atm_withdrawals: true
    },
    travel_benefits: {
      no_fx_fees: true,
      interbank_rates: true,
      travel_insurance: body.card_type === 'physical',
      purchase_protection: true
    }
  }

  return NextResponse.json({
    success: true,
    data: mockCard
  })
}

async function handleExchangeCurrency(body: any): Promise<Response> {
  const exchangeRate = 0.2143 // Mock rate
  const exchangedAmount = body.amount * exchangeRate

  return NextResponse.json({
    success: true,
    data: {
      transaction_id: `rev_exchange_${Date.now()}`,
      from_amount: body.amount,
      from_currency: body.from_currency,
      to_amount: exchangedAmount,
      to_currency: body.to_currency,
      exchange_rate: exchangeRate,
      fees: 0.00,
      status: 'completed',
      timestamp: new Date().toISOString()
    }
  })
}

function processRevolutResponse(action: string, data: any): RevolutResponse {
  // Process real Revolut API response based on action
  switch (action) {
    case 'accounts':
      return {
        success: true,
        accounts: data.accounts || []
      }
    case 'exchange_rates':
      return {
        success: true,
        exchange_rates: data.rates || []
      }
    case 'transactions':
      return {
        success: true,
        transactions: data.transactions || []
      }
    default:
      return {
        success: true,
        data
      }
  }
}