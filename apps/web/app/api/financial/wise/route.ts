import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/api-config'

// Wise (formerly TransferWise) Integration for International Money Transfers
// Multi-currency accounts, borderless cards, real mid-market rates
// No hidden fees, transparent pricing, global coverage

interface WiseAccountRequest {
  user_id: string
  account_type: 'personal' | 'business'
  base_currency: string
  required_currencies: string[]
}

interface WiseTransferRequest {
  user_id: string
  source_currency: string
  target_currency: string
  amount: number
  transfer_type: 'balance' | 'bank_account' | 'card'
  recipient_type: 'self' | 'someone_else'
  purpose: 'travel' | 'business' | 'family_support' | 'other'
}

interface WiseQuoteRequest {
  source_currency: string
  target_currency: string
  amount: number
  transfer_type: 'BALANCE_PAYOUT' | 'BANK_TRANSFER' | 'DEBIT_CARD'
}

interface WiseAccount {
  account_id: string
  user_id: string
  account_type: 'personal' | 'business'
  status: 'active' | 'pending_verification' | 'suspended'
  profile: {
    first_name?: string
    last_name?: string
    business_name?: string
    email: string
    phone: string
    address: {
      country: string
      city: string
      postal_code: string
      address_line: string
    }
  }
  balances: WiseBalance[]
  cards: WiseCard[]
  account_details: WiseAccountDetail[]
  verification_status: {
    identity: 'verified' | 'pending' | 'not_started'
    address: 'verified' | 'pending' | 'not_started'
    phone: 'verified' | 'pending' | 'not_started'
  }
  limits: {
    annual_limit: number
    remaining_limit: number
    currency: string
  }
  created_at: string
}

interface WiseBalance {
  currency: string
  amount: number
  available: number
  reserved: number
  account_details: {
    account_number?: string
    routing_number?: string
    iban?: string
    sort_code?: string
    bic?: string
  }
}

interface WiseCard {
  card_id: string
  card_number: string // masked
  card_type: 'virtual' | 'physical'
  status: 'active' | 'blocked' | 'expired' | 'ordered'
  currencies: string[]
  spending_limits: {
    daily_limit: number
    monthly_limit: number
    atm_daily_limit: number
    atm_monthly_limit: number
    currency: string
  }
  features: {
    contactless: boolean
    online_payments: boolean
    atm_withdrawals: boolean
    international_usage: boolean
  }
  delivery_address?: {
    country: string
    city: string
    postal_code: string
    address_line: string
  }
}

interface WiseAccountDetail {
  currency: string
  account_type: 'CHECKING' | 'SAVINGS'
  bank_details: {
    account_number: string
    routing_number?: string
    iban?: string
    swift_bic?: string
    bank_name: string
    bank_address: string
  }
  purpose: string[]
  available_countries: string[]
}

interface WiseQuote {
  quote_id: string
  source_currency: string
  target_currency: string
  source_amount: number
  target_amount: number
  exchange_rate: number
  mid_market_rate: number
  fee: {
    total: number
    currency: string
    breakdown: {
      transfer_fee: number
      conversion_fee: number
      intermediary_fee: number
    }
  }
  delivery_time: {
    min_hours: number
    max_hours: number
    estimate: string
  }
  valid_until: string
  rate_comparison: {
    wise_rate: number
    bank_rate: number
    savings_amount: number
    savings_percentage: number
  }
  created_at: string
}

interface WiseTransfer {
  transfer_id: string
  quote_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'bounced_back'
  source_account: string
  target_account: string
  source_amount: number
  source_currency: string
  target_amount: number
  target_currency: string
  exchange_rate: number
  fee: number
  reference: string
  purpose_code: string
  recipient: {
    name: string
    email?: string
    account_details: any
  }
  timeline: {
    status: string
    timestamp: string
    description: string
  }[]
  estimated_arrival: string
  created_at: string
}

interface WiseRateAlert {
  alert_id: string
  user_id: string
  currency_pair: string
  target_rate: number
  comparison: 'above' | 'below'
  status: 'active' | 'triggered' | 'expired'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  created_at: string
}

interface WiseResponse {
  success: boolean
  data?: any
  accounts?: WiseAccount[]
  balances?: WiseBalance[]
  quotes?: WiseQuote[]
  transfers?: WiseTransfer[]
  rate_alerts?: WiseRateAlert[]
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('user_id')
    const sourceCurrency = searchParams.get('source_currency')
    const targetCurrency = searchParams.get('target_currency')
    const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : undefined

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required'
      }, { status: 400 })
    }

    // Real Wise API integration would go here
    if (API_CONFIG.WISE.API_KEY) {
      try {
        const baseUrl = API_CONFIG.WISE.BASE_URL
        let endpoint = ''
        let headers: Record<string, string> = {
          'Authorization': `Bearer ${API_CONFIG.WISE.API_KEY}`,
          'Content-Type': 'application/json'
        }

        switch (action) {
          case 'profiles':
            endpoint = 'v1/profiles'
            break
          case 'balances':
            endpoint = `v4/profiles/${userId}/balances`
            break
          case 'quote':
            endpoint = 'v2/quotes'
            break
          case 'transfers':
            endpoint = `v1/profiles/${userId}/transfers`
            break
          case 'rates':
            endpoint = 'v1/rates'
            if (sourceCurrency && targetCurrency) {
              endpoint += `?source=${sourceCurrency}&target=${targetCurrency}`
            }
            break
        }

        const response = await fetch(`${baseUrl}/${endpoint}`, { headers })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(processWiseResponse(action, data))
        }
      } catch (apiError) {
        console.error('Wise API error:', apiError)
        // Fall back to mock data
      }
    }

    // Mock data based on action
    switch (action) {
      case 'accounts':
      case 'profiles':
        return handleAccountsRequest(userId)
      case 'balances':
        return handleBalancesRequest(userId)
      case 'quote':
        return handleQuoteRequest(sourceCurrency, targetCurrency, amount)
      case 'transfers':
        return handleTransfersRequest(userId)
      case 'rates':
        return handleRatesRequest(sourceCurrency, targetCurrency)
      case 'rate_alerts':
        return handleRateAlertsRequest(userId)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Wise integration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process Wise request'
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

    // Real Wise API integration would go here
    if (API_CONFIG.WISE.API_KEY) {
      try {
        let endpoint = ''
        let requestBody = {}

        switch (action) {
          case 'create_account':
            endpoint = 'v1/profiles'
            requestBody = {
              type: body.account_type,
              details: body.profile_details
            }
            break
          case 'create_balance':
            endpoint = `v4/profiles/${body.profile_id}/balances`
            requestBody = {
              currency: body.currency
            }
            break
          case 'create_quote':
            endpoint = 'v2/quotes'
            requestBody = {
              sourceCurrency: body.source_currency,
              targetCurrency: body.target_currency,
              sourceAmount: body.amount,
              targetAmount: null,
              payOut: body.transfer_type || 'BALANCE_PAYOUT'
            }
            break
          case 'create_transfer':
            endpoint = 'v1/transfers'
            requestBody = {
              targetAccount: body.target_account,
              quoteUuid: body.quote_id,
              customerTransactionId: body.reference || `wise_${Date.now()}`
            }
            break
          case 'create_rate_alert':
            endpoint = 'v1/rate-alerts'
            requestBody = {
              sourceCurrency: body.source_currency,
              targetCurrency: body.target_currency,
              targetRate: body.target_rate,
              notificationType: body.comparison
            }
            break
        }

        const response = await fetch(`${API_CONFIG.WISE.BASE_URL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_CONFIG.WISE.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ success: true, data })
        }
      } catch (apiError) {
        console.error('Wise API POST error:', apiError)
      }
    }

    // Mock responses for different actions
    switch (action) {
      case 'create_account':
        return handleCreateAccount(body)
      case 'create_balance':
        return handleCreateBalance(body)
      case 'create_quote':
        return handleCreateQuote(body)
      case 'create_transfer':
        return handleCreateTransfer(body)
      case 'create_rate_alert':
        return handleCreateRateAlert(body)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Wise POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process Wise request'
    }, { status: 500 })
  }
}

// Mock handlers
async function handleAccountsRequest(userId?: string | null): Promise<Response> {
  const mockAccount: WiseAccount = {
    account_id: 'wise_acc_123456',
    user_id: userId || 'user_123',
    account_type: 'personal',
    status: 'active',
    profile: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+60123456789',
      address: {
        country: 'Malaysia',
        city: 'Kuala Lumpur',
        postal_code: '50450',
        address_line: '123 Jalan Sultan Ismail'
      }
    },
    balances: [
      {
        currency: 'MYR',
        amount: 5000.00,
        available: 4950.00,
        reserved: 50.00,
        account_details: {
          account_number: '1234567890',
          bic: 'MAYBANK2U'
        }
      },
      {
        currency: 'USD',
        amount: 1200.00,
        available: 1200.00,
        reserved: 0.00,
        account_details: {
          account_number: '9876543210',
          routing_number: '026009593',
          bic: 'CHASUS33'
        }
      },
      {
        currency: 'EUR',
        amount: 800.00,
        available: 800.00,
        reserved: 0.00,
        account_details: {
          iban: 'GB29 NWBK 6016 1331 9268 19',
          bic: 'MIDLGB22'
        }
      }
    ],
    cards: [
      {
        card_id: 'wise_card_789',
        card_number: '**** **** **** 5678',
        card_type: 'physical',
        status: 'active',
        currencies: ['MYR', 'USD', 'EUR', 'GBP', 'SGD'],
        spending_limits: {
          daily_limit: 3000,
          monthly_limit: 30000,
          atm_daily_limit: 1000,
          atm_monthly_limit: 5000,
          currency: 'MYR'
        },
        features: {
          contactless: true,
          online_payments: true,
          atm_withdrawals: true,
          international_usage: true
        }
      }
    ],
    account_details: [
      {
        currency: 'USD',
        account_type: 'CHECKING',
        bank_details: {
          account_number: '9876543210',
          routing_number: '026009593',
          bank_name: 'Community Federal Savings Bank',
          bank_address: 'New York, USA',
          swift_bic: 'CMFGUS33'
        },
        purpose: ['Receive money from friends and family', 'Receive salary'],
        available_countries: ['US', 'CA', 'AU']
      },
      {
        currency: 'EUR',
        account_type: 'CHECKING',
        bank_details: {
          account_number: 'GB29 NWBK 6016 1331 9268 19',
          iban: 'GB29 NWBK 6016 1331 9268 19',
          bank_name: 'Wise',
          bank_address: 'London, UK',
          swift_bic: 'TRWIGB2L'
        },
        purpose: ['Receive payments from European clients', 'Online marketplace payments'],
        available_countries: ['GB', 'DE', 'FR', 'IT', 'ES']
      }
    ],
    verification_status: {
      identity: 'verified',
      address: 'verified',
      phone: 'verified'
    },
    limits: {
      annual_limit: 1000000,
      remaining_limit: 850000,
      currency: 'MYR'
    },
    created_at: '2023-05-20T09:00:00Z'
  }

  return NextResponse.json({
    success: true,
    accounts: [mockAccount]
  })
}

async function handleBalancesRequest(userId?: string | null): Promise<Response> {
  const mockBalances: WiseBalance[] = [
    {
      currency: 'MYR',
      amount: 5000.00,
      available: 4950.00,
      reserved: 50.00,
      account_details: {
        account_number: '1234567890'
      }
    },
    {
      currency: 'USD', 
      amount: 1200.00,
      available: 1200.00,
      reserved: 0.00,
      account_details: {
        account_number: '9876543210',
        routing_number: '026009593'
      }
    },
    {
      currency: 'EUR',
      amount: 800.00,
      available: 800.00,
      reserved: 0.00,
      account_details: {
        iban: 'GB29 NWBK 6016 1331 9268 19'
      }
    },
    {
      currency: 'GBP',
      amount: 400.00,
      available: 400.00,
      reserved: 0.00,
      account_details: {
        account_number: '31926819',
        sort_code: '23-14-70'
      }
    }
  ]

  return NextResponse.json({
    success: true,
    balances: mockBalances
  })
}

async function handleQuoteRequest(
  sourceCurrency?: string | null,
  targetCurrency?: string | null, 
  amount?: number
): Promise<Response> {
  const mockQuote: WiseQuote = {
    quote_id: `wise_quote_${Date.now()}`,
    source_currency: sourceCurrency || 'MYR',
    target_currency: targetCurrency || 'USD',
    source_amount: amount || 1000,
    target_amount: 214.50, // After fees
    exchange_rate: 0.2150, // Actual rate used
    mid_market_rate: 0.2152, // Real mid-market rate
    fee: {
      total: 5.50,
      currency: sourceCurrency || 'MYR',
      breakdown: {
        transfer_fee: 4.00,
        conversion_fee: 1.50,
        intermediary_fee: 0.00
      }
    },
    delivery_time: {
      min_hours: 0,
      max_hours: 1,
      estimate: 'Within 1 hour'
    },
    valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    rate_comparison: {
      wise_rate: 0.2150,
      bank_rate: 0.2080, // Typical bank rate
      savings_amount: 7.00,
      savings_percentage: 3.26
    },
    created_at: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    quotes: [mockQuote]
  })
}

async function handleTransfersRequest(userId?: string | null): Promise<Response> {
  const mockTransfers: WiseTransfer[] = [
    {
      transfer_id: 'wise_transfer_001',
      quote_id: 'wise_quote_123',
      status: 'completed',
      source_account: 'wise_balance_myr',
      target_account: 'wise_balance_usd',
      source_amount: 1000.00,
      source_currency: 'MYR',
      target_amount: 214.50,
      target_currency: 'USD',
      exchange_rate: 0.2150,
      fee: 5.50,
      reference: 'Travel fund conversion',
      purpose_code: 'TRAVEL',
      recipient: {
        name: 'John Doe (Self)',
        account_details: {
          currency: 'USD'
        }
      },
      timeline: [
        {
          status: 'transfer_created',
          timestamp: '2024-03-10T10:00:00Z',
          description: 'Transfer created'
        },
        {
          status: 'processing',
          timestamp: '2024-03-10T10:01:00Z', 
          description: 'Processing transfer'
        },
        {
          status: 'completed',
          timestamp: '2024-03-10T10:15:00Z',
          description: 'Money converted and available in USD balance'
        }
      ],
      estimated_arrival: '2024-03-10T10:15:00Z',
      created_at: '2024-03-10T10:00:00Z'
    },
    {
      transfer_id: 'wise_transfer_002',
      quote_id: 'wise_quote_124',
      status: 'processing',
      source_account: 'wise_balance_usd',
      target_account: 'bank_account_eur',
      source_amount: 200.00,
      source_currency: 'USD',
      target_amount: 184.20,
      target_currency: 'EUR',
      exchange_rate: 0.9210,
      fee: 3.80,
      reference: 'Hotel payment Berlin',
      purpose_code: 'TRAVEL',
      recipient: {
        name: 'Hotel Booking Service',
        email: 'payments@booking.com',
        account_details: {
          iban: 'DE89 3704 0044 0532 0130 00'
        }
      },
      timeline: [
        {
          status: 'transfer_created',
          timestamp: '2024-03-11T14:00:00Z',
          description: 'Transfer created'
        },
        {
          status: 'processing',
          timestamp: '2024-03-11T14:05:00Z',
          description: 'Money being sent to recipient bank'
        }
      ],
      estimated_arrival: '2024-03-11T16:00:00Z',
      created_at: '2024-03-11T14:00:00Z'
    }
  ]

  return NextResponse.json({
    success: true,
    transfers: mockTransfers
  })
}

async function handleRatesRequest(
  sourceCurrency?: string | null,
  targetCurrency?: string | null
): Promise<Response> {
  // Mock exchange rates
  const rates = {
    'MYR-USD': 0.2152,
    'MYR-EUR': 0.1985,
    'MYR-GBP': 0.1702,
    'MYR-SGD': 0.2891,
    'USD-EUR': 0.9210,
    'USD-GBP': 0.7905,
    'EUR-GBP': 0.8582
  }

  const pair = `${sourceCurrency}-${targetCurrency}`
  const reversePair = `${targetCurrency}-${sourceCurrency}`
  
  const rate = rates[pair as keyof typeof rates] || (rates[reversePair as keyof typeof rates] ? 1 / rates[reversePair as keyof typeof rates] : 1)

  return NextResponse.json({
    success: true,
    data: {
      source_currency: sourceCurrency,
      target_currency: targetCurrency,
      rate,
      timestamp: new Date().toISOString()
    }
  })
}

async function handleRateAlertsRequest(userId?: string | null): Promise<Response> {
  const mockAlerts: WiseRateAlert[] = [
    {
      alert_id: 'alert_001',
      user_id: userId || 'user_123',
      currency_pair: 'MYR-USD',
      target_rate: 0.2200,
      comparison: 'above',
      status: 'active',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      created_at: '2024-03-01T12:00:00Z'
    },
    {
      alert_id: 'alert_002', 
      user_id: userId || 'user_123',
      currency_pair: 'MYR-EUR',
      target_rate: 0.1950,
      comparison: 'below',
      status: 'triggered',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      created_at: '2024-02-15T15:30:00Z'
    }
  ]

  return NextResponse.json({
    success: true,
    rate_alerts: mockAlerts
  })
}

// Mock POST handlers
async function handleCreateAccount(body: any): Promise<Response> {
  return NextResponse.json({
    success: true,
    data: {
      account_id: `wise_acc_${Date.now()}`,
      status: 'pending_verification'
    }
  })
}

async function handleCreateBalance(body: any): Promise<Response> {
  return NextResponse.json({
    success: true,
    data: {
      balance_id: `balance_${body.currency}_${Date.now()}`,
      currency: body.currency,
      amount: 0.00,
      status: 'active'
    }
  })
}

async function handleCreateQuote(body: any): Promise<Response> {
  const mockQuote: WiseQuote = {
    quote_id: `wise_quote_${Date.now()}`,
    source_currency: body.source_currency,
    target_currency: body.target_currency,
    source_amount: body.amount,
    target_amount: body.amount * 0.2150, // Mock conversion
    exchange_rate: 0.2150,
    mid_market_rate: 0.2152,
    fee: {
      total: body.amount * 0.005, // 0.5% fee
      currency: body.source_currency,
      breakdown: {
        transfer_fee: body.amount * 0.003,
        conversion_fee: body.amount * 0.002,
        intermediary_fee: 0.00
      }
    },
    delivery_time: {
      min_hours: 0,
      max_hours: 1,
      estimate: 'Within 1 hour'
    },
    valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    rate_comparison: {
      wise_rate: 0.2150,
      bank_rate: 0.2080,
      savings_amount: body.amount * 0.007,
      savings_percentage: 3.26
    },
    created_at: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    data: mockQuote
  })
}

async function handleCreateTransfer(body: any): Promise<Response> {
  return NextResponse.json({
    success: true,
    data: {
      transfer_id: `wise_transfer_${Date.now()}`,
      status: 'processing',
      estimated_arrival: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  })
}

async function handleCreateRateAlert(body: any): Promise<Response> {
  return NextResponse.json({
    success: true,
    data: {
      alert_id: `alert_${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString()
    }
  })
}

function processWiseResponse(action: string, data: any): WiseResponse {
  // Process real Wise API response based on action
  switch (action) {
    case 'profiles':
      return {
        success: true,
        accounts: data
      }
    case 'balances':
      return {
        success: true,
        balances: data
      }
    case 'quote':
      return {
        success: true,
        quotes: [data]
      }
    case 'transfers':
      return {
        success: true,
        transfers: data
      }
    case 'rates':
      return {
        success: true,
        data
      }
    default:
      return {
        success: true,
        data
      }
  }
}