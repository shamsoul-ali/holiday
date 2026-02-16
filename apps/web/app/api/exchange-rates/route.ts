import { NextRequest, NextResponse } from 'next/server'

interface ExchangeRateResponse {
  success: boolean
  data?: {
    base_currency: string
    timestamp: string
    rates: { [key: string]: number }
    meta: {
      data_source: 'fixer' | 'exchangerate' | 'mock'
      last_updated: string
      cache_used: boolean
    }
  }
  error?: string
}

// Cache for exchange rates (15-minute cache)
const exchangeRateCache = new Map<string, { data: any; timestamp: number }>()
const EXCHANGE_CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// GET /api/exchange-rates - Get current exchange rates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const baseCurrency = searchParams.get('base') || 'USD'
    const targetCurrencies = searchParams.get('currencies')?.split(',') || ['MYR', 'USD', 'EUR', 'GBP', 'SGD', 'THB', 'JPY']

    console.log(`Fetching exchange rates for ${baseCurrency} to ${targetCurrencies.join(', ')}`)

    // Check cache first
    const cacheKey = `${baseCurrency}-${targetCurrencies.sort().join(',')}`
    const cached = exchangeRateCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < EXCHANGE_CACHE_DURATION) {
      console.log('Using cached exchange rates')
      return NextResponse.json({
        ...cached.data,
        meta: { ...cached.data.meta, cache_used: true }
      })
    }

    let rates: { [key: string]: number } = {}
    let dataSource: 'fixer' | 'exchangerate' | 'mock' = 'mock'

    try {
      // Try Fixer API first (if you have API key)
      // rates = await fetchFixerRates(baseCurrency, targetCurrencies)
      // dataSource = 'fixer'
      
      // Fallback to ExchangeRate-API (free tier)
      // if (Object.keys(rates).length === 0) {
      //   rates = await fetchExchangeRateAPI(baseCurrency, targetCurrencies)
      //   dataSource = 'exchangerate'
      // }
      
      // For now, use enhanced mock rates with realistic fluctuations
      rates = getEnhancedMockRates(baseCurrency, targetCurrencies)
      dataSource = 'mock'

    } catch (apiError) {
      console.log('Exchange rate API error:', apiError)
      rates = getEnhancedMockRates(baseCurrency, targetCurrencies)
      dataSource = 'mock'
    }

    const response = {
      success: true,
      data: {
        base_currency: baseCurrency,
        timestamp: new Date().toISOString(),
        rates: rates,
        meta: {
          data_source: dataSource,
          last_updated: new Date().toISOString(),
          cache_used: false
        }
      }
    }

    // Cache the results
    exchangeRateCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Exchange rates API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch exchange rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/exchange-rates/convert - Convert amount between currencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, from, to } = body

    if (!amount || !from || !to) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, from, to'
      }, { status: 400 })
    }

    // Get exchange rates
    const ratesResponse = await fetch(`${request.nextUrl.origin}/api/exchange-rates?base=${from}&currencies=${to}`)
    const ratesData = await ratesResponse.json()

    if (!ratesData.success) {
      throw new Error('Failed to get exchange rates')
    }

    const rate = ratesData.data.rates[to]
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`)
    }

    const convertedAmount = amount * rate

    return NextResponse.json({
      success: true,
      data: {
        original: {
          amount: amount,
          currency: from
        },
        converted: {
          amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
          currency: to
        },
        exchange_rate: rate,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Currency conversion error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to convert currency',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getEnhancedMockRates(baseCurrency: string, targetCurrencies: string[]): { [key: string]: number } {
  // Base rates as of 2024 (approximate)
  const baseRates: { [key: string]: { [key: string]: number } } = {
    'USD': {
      'MYR': 4.65, 'EUR': 0.92, 'GBP': 0.79, 'SGD': 1.34, 'THB': 35.5, 'JPY': 149.8,
      'AUD': 1.52, 'CAD': 1.36, 'CHF': 0.88, 'CNY': 7.24, 'HKD': 7.83, 'INR': 83.2,
      'KRW': 1337, 'TWD': 31.8, 'VND': 24450, 'PHP': 56.2, 'IDR': 15650
    },
    'MYR': {
      'USD': 0.215, 'EUR': 0.198, 'GBP': 0.170, 'SGD': 0.288, 'THB': 7.63, 'JPY': 32.2,
      'AUD': 0.327, 'CAD': 0.292, 'CHF': 0.189, 'CNY': 1.56, 'HKD': 1.68, 'INR': 17.9
    },
    'EUR': {
      'USD': 1.09, 'MYR': 5.05, 'GBP': 0.86, 'SGD': 1.46, 'THB': 38.6, 'JPY': 163.2
    },
    'GBP': {
      'USD': 1.27, 'MYR': 5.89, 'EUR': 1.16, 'SGD': 1.70, 'THB': 44.9, 'JPY': 190.1
    }
  }

  const rates: { [key: string]: number } = {}

  // Add small random fluctuation to simulate real-time changes
  const fluctuation = () => 0.98 + Math.random() * 0.04 // ±2% variation

  for (const target of targetCurrencies) {
    if (target === baseCurrency) {
      rates[target] = 1.0
      continue
    }

    let rate = 1.0

    if (baseRates[baseCurrency] && baseRates[baseCurrency][target]) {
      rate = baseRates[baseCurrency][target] * fluctuation()
    } else if (baseRates[target] && baseRates[target][baseCurrency]) {
      rate = (1 / baseRates[target][baseCurrency]) * fluctuation()
    } else {
      // Cross-rate calculation through USD
      const baseToUsd = baseRates[baseCurrency]?.['USD'] || (1 / (baseRates['USD']?.[baseCurrency] || 1))
      const usdToTarget = baseRates['USD']?.[target] || (1 / (baseRates[target]?.['USD'] || 1))
      rate = baseToUsd * usdToTarget * fluctuation()
    }

    rates[target] = Math.round(rate * 10000) / 10000 // Round to 4 decimal places
  }

  return rates
}

// Placeholder for real API integrations
async function fetchFixerRates(base: string, currencies: string[]): Promise<{ [key: string]: number }> {
  // Would integrate with Fixer.io API
  // const response = await fetch(`https://api.fixer.io/latest?access_key=${FIXER_API_KEY}&base=${base}&symbols=${currencies.join(',')}`)
  // return response.json()
  return {}
}

async function fetchExchangeRateAPI(base: string, currencies: string[]): Promise<{ [key: string]: number }> {
  // Would integrate with ExchangeRate-API
  // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`)
  // return response.json()
  return {}
}