'use client'

import { useState, useEffect } from 'react'
import { DigitalReceipt, ReceiptComponent } from '@/lib/services/digital-receipt'

interface DigitalReceiptViewerProps {
  bookingId: string
  bookingReference?: string
  showDownloadOptions?: boolean
  compact?: boolean
}

export default function DigitalReceiptViewer({ 
  bookingId, 
  bookingReference,
  showDownloadOptions = true,
  compact = false
}: DigitalReceiptViewerProps) {
  const [receipt, setReceipt] = useState<DigitalReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<string | null>(null)

  useEffect(() => {
    fetchReceipt()
  }, [bookingId])

  const fetchReceipt = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/receipts/${bookingId}?format=json`)
      const data = await response.json()

      if (data.success) {
        setReceipt(data.receipt)
      } else {
        setError(data.error || 'Failed to load receipt')
      }
    } catch (err) {
      setError('Network error while loading receipt')
      console.error('Receipt fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'html' | 'pdf') => {
    try {
      const response = await fetch(`/api/receipts/${bookingId}?format=${format}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receipt?.bookingReference || bookingId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(`Download ${format} error:`, err)
      alert(`Failed to download ${format.toUpperCase()} receipt`)
    }
  }

  const handleVerifyQR = async () => {
    if (!receipt) return

    setVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch(`/api/receipts/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_qr',
          qrCodeData: receipt.qrCode
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setVerificationResult(
          data.verification.valid 
            ? 'QR code is valid and active ✅'
            : `QR code verification failed: ${data.verification.error} ❌`
        )
      } else {
        setVerificationResult('Verification failed ❌')
      }
    } catch (err) {
      setVerificationResult('Network error during verification ❌')
      console.error('QR verification error:', err)
    } finally {
      setVerifying(false)
    }
  }

  const getComponentIcon = (type: string): string => {
    const icons = {
      flight: '✈️',
      hotel: '🏨',
      activity: '🎯',
      transport: '🚗'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">Failed to Load Receipt</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchReceipt}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return null
  }

  const { receiptData, qrCode, bookingReference: refNumber } = receipt

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">🧾 Digital Receipt</h1>
        <div className="text-4xl font-bold tracking-wider mb-2">{refNumber}</div>
        <p className="text-blue-100">Holiday AI - Your AI-Powered Travel Companion</p>
        {receipt.verificationStatus === 'active' && (
          <div className="mt-3 inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            ✅ VERIFIED
          </div>
        )}
      </div>

      {/* Download Options */}
      {showDownloadOptions && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleDownload('html')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download HTML
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Receipt Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              👤 Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{receiptData.customerInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{receiptData.customerInfo.email}</p>
              </div>
              {receiptData.customerInfo.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{receiptData.customerInfo.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Travel Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ✈️ Travel Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Travel Dates</label>
                <p className="text-gray-900">
                  {receiptData.travelDetails.dates.start.toLocaleDateString()} - {receiptData.travelDetails.dates.end.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Travelers</label>
                <p className="text-gray-900">{receiptData.travelDetails.travelers} {receiptData.travelDetails.travelers === 1 ? 'person' : 'people'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Destinations</label>
                <p className="text-gray-900">{receiptData.travelDetails.destinations.join(', ') || 'Multiple destinations'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Type</label>
                <p className="text-gray-900">{receiptData.booking.bookingType.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Booking Components */}
          {receiptData.components.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📋 Booking Components
              </h2>
              <div className="space-y-4">
                {receiptData.components.map((component: ReceiptComponent, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {getComponentIcon(component.type)} {component.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                        {component.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(component.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-gray-900 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {component.currency} {component.amount.toLocaleString()}
                      </span>
                      {component.confirmationCode && (
                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                          {component.confirmationCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💳 Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="text-gray-900">{receiptData.paymentInfo.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                <p className="text-gray-900 font-mono text-sm">{receiptData.paymentInfo.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <p className="text-green-600 font-medium">✅ Completed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Receipt Date</label>
                <p className="text-gray-900">{receipt.issuedAt.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                💰 Total Paid: {receiptData.paymentInfo.currency} {receiptData.paymentInfo.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📱 Digital Verification</h3>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-4">
              <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <div className="text-xs text-gray-600 font-mono break-all p-2">
                    QR CODE DATA:
                    <br />
                    {qrCode.substring(0, 50)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="text-2xl font-bold font-mono tracking-wider bg-gray-100 p-3 rounded-lg mb-4">
              {refNumber}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Show this code for check-in, verification, and support purposes
            </p>

            <button
              onClick={handleVerifyQR}
              disabled={verifying}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mb-3"
            >
              {verifying ? 'Verifying...' : 'Verify QR Code'}
            </button>

            {verificationResult && (
              <div className={`p-3 rounded-lg text-sm ${
                verificationResult.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {verificationResult}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Receipt Status: <span className="font-medium">{receipt.verificationStatus.toUpperCase()}</span></p>
              <p>Issued: {receipt.issuedAt.toLocaleDateString()}</p>
              {receipt.expiresAt && (
                <p>Expires: {receipt.expiresAt.toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}