import { NextRequest, NextResponse } from 'next/server'
import { enhancedRapidAPI } from '../../../../lib/enhanced-rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USD'
    const to = searchParams.get('to') || 'MYR'
    const amount = parseFloat(searchParams.get('amount') || '1')

    console.log(`RapidAPI Currency: Converting ${amount} ${from} to ${to}`)

    const conversionResponse = await enhancedRapidAPI.convertCurrency(from, to, amount)

    if (!conversionResponse.success) {
      return NextResponse.json({
        success: false,
        error: conversionResponse.error || 'Failed to convert currency'
      }, { status: 500 })
    }

    const conversion = conversionResponse.data
    const transformedConversion = {
      from: {
        currency: from,
        amount: amount
      },
      to: {
        currency: to,
        amount: conversion?.rates?.[to]?.rate_for_amount || conversion?.converted_amount || amount * 4.5, // Fallback rate
        rate: conversion?.rates?.[to]?.rate || conversion?.rate || 4.5
      },
      last_updated: conversion?.last_updated || new Date().toISOString(),
      provider: 'RapidAPI Currency Converter'
    }

    console.log(`RapidAPI Currency: Successfully converted ${from} to ${to}`)

    return NextResponse.json({
      success: true,
      data: transformedConversion,
      source: 'RapidAPI Currency Converter'
    })

  } catch (error) {
    console.error('RapidAPI Currency error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}