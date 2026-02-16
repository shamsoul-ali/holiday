'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Smartphone, Building2, Wallet, Lock, CheckCircle, AlertCircle } from 'lucide-react'

type PaymentMethod = 'fpx' | 'card' | 'ewallet' | 'bnpl'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const travelers = searchParams.get('travelers') || '2'
  const totalCost = parseInt(searchParams.get('totalCost') || '0')

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fpx')
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedEWallet, setSelectedEWallet] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const banks = [
    { name: 'Maybank', logo: '🏦' },
    { name: 'CIMB Bank', logo: '🏦' },
    { name: 'Public Bank', logo: '🏦' },
    { name: 'RHB Bank', logo: '🏦' },
    { name: 'Hong Leong Bank', logo: '🏦' },
    { name: 'AmBank', logo: '🏦' },
    { name: 'Bank Islam', logo: '🏦' },
    { name: 'HSBC Bank', logo: '🏦' }
  ]

  const ewallets = [
    { name: 'Touch \'n Go', logo: '📱' },
    { name: 'Boost', logo: '📱' },
    { name: 'GrabPay', logo: '📱' },
    { name: 'ShopeePay', logo: '📱' }
  ]

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handlePayment = () => {
    setIsProcessing(true)

    // Generate booking reference
    const bookingRef = 'HA' + Math.random().toString(36).substring(2, 10).toUpperCase()

    setTimeout(() => {
      const params = new URLSearchParams({
        destination,
        travelers,
        totalCost: totalCost.toString(),
        bookingRef,
        paymentMethod
      })
      router.push(`/payment-success?${params.toString()}`)
    }, 2000)
  }

  const isFormValid = () => {
    if (paymentMethod === 'fpx') return selectedBank !== ''
    if (paymentMethod === 'ewallet') return selectedEWallet !== ''
    if (paymentMethod === 'card') {
      return cardNumber.length >= 19 && cardName.length > 0 && expiryDate.length === 5 && cvv.length === 3
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
              <p className="text-sm text-gray-600 mt-1">
                {destination} • {travelers} travelers
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Badge */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Secure Payment</p>
                <p className="text-sm text-green-700">Your information is encrypted and secure</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('fpx')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'fpx'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'fpx' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-900">FPX</p>
                  <p className="text-xs text-gray-500">Online Banking</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-900">Card</p>
                  <p className="text-xs text-gray-500">Credit/Debit</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'ewallet'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'ewallet' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-900">E-Wallet</p>
                  <p className="text-xs text-gray-500">Digital Wallet</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('bnpl')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'bnpl'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'bnpl' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-900">BNPL</p>
                  <p className="text-xs text-gray-500">Pay Later</p>
                </button>
              </div>

              {/* FPX Form */}
              {paymentMethod === 'fpx' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Your Bank</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {banks.map((bank) => (
                      <button
                        key={bank.name}
                        onClick={() => setSelectedBank(bank.name)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          selectedBank === bank.name
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{bank.logo}</div>
                        <p className="text-xs font-medium text-gray-900">{bank.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
                  </div>
                </div>
              )}

              {/* E-Wallet Form */}
              {paymentMethod === 'ewallet' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Select E-Wallet</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ewallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => setSelectedEWallet(wallet.name)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          selectedEWallet === wallet.name
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{wallet.logo}</div>
                        <p className="text-xs font-medium text-gray-900">{wallet.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BNPL Info */}
              {paymentMethod === 'bnpl' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Pay in 3 Interest-Free Installments</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Split your payment into 3 equal monthly installments with zero interest.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-800">Today</span>
                        <span className="font-semibold text-blue-900">RM {(totalCost / 3).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">After 30 days</span>
                        <span className="font-semibold text-blue-900">RM {(totalCost / 3).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">After 60 days</span>
                        <span className="font-semibold text-blue-900">RM {(totalCost / 3).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Trip to {destination}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Travelers</span>
                  <span>{travelers} adults</span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-2xl text-blue-600">RM {totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!isFormValid() || isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay RM {totalCost.toLocaleString()}
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>SSL encrypted payment</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
