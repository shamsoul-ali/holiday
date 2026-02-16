'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Download, Mail, Printer, Plane, Hotel, QrCode, Calendar, Clock, MapPin, User, Luggage } from 'lucide-react'

export default function TravelDocumentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingRef = searchParams.get('ref') || 'HA7F3G2K1'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Documents</h1>
              <p className="text-sm text-gray-600 mt-1">
                Booking Ref: {bookingRef}
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
        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download All (PDF)
          </button>
          <button className="bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 border-2 border-gray-300">
            <Mail className="w-5 h-5" />
            Email Documents
          </button>
          <button className="bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 border-2 border-gray-300">
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>

        <div className="space-y-8">
          {/* Outbound Boarding Pass */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plane className="w-6 h-6" />
                Outbound Flight - Boarding Pass
              </h2>
            </div>

            <div className="p-0">
              {/* Boarding Pass Design */}
              <div className="relative">
                {/* Main Boarding Pass */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">AIRLINE</p>
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.kiwi.com/airlines/64/MH.png"
                          alt="Malaysia Airlines"
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">Malaysia Airlines</p>
                          <p className="text-gray-600">Flight MH 070</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">CLASS</p>
                      <p className="text-3xl font-bold text-blue-600">Y</p>
                      <p className="text-sm text-gray-600">Economy</p>
                    </div>
                  </div>

                  {/* Passenger Info & Flight Details */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    {/* Left Side */}
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">PASSENGER NAME</p>
                        <p className="text-xl font-bold text-gray-900">JOHN DOE</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">FROM</p>
                          <p className="text-4xl font-bold text-gray-900">KUL</p>
                          <p className="text-sm text-gray-600">Kuala Lumpur</p>
                          <p className="text-sm text-gray-500 mt-2">Terminal KLIA</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">TO</p>
                          <p className="text-4xl font-bold text-gray-900">NRT</p>
                          <p className="text-sm text-gray-600">Tokyo Narita</p>
                          <p className="text-sm text-gray-500 mt-2">Terminal 1</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">DATE</p>
                          <p className="text-lg font-bold text-gray-900">15 MAR</p>
                          <p className="text-xs text-gray-600">2026</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">BOARDING TIME</p>
                          <p className="text-lg font-bold text-gray-900">08:30</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">DEPARTURE</p>
                          <p className="text-lg font-bold text-gray-900">09:00</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-6">
                      <div className="bg-gray-100 rounded-2xl p-6 text-center">
                        <div className="bg-white rounded-xl p-4 mb-3">
                          <QrCode className="w-32 h-32 mx-auto text-gray-800" />
                        </div>
                        <p className="text-xs text-gray-600 mb-1">BOOKING REFERENCE</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-wider">{bookingRef}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-blue-600 mb-1">SEAT</p>
                          <p className="text-3xl font-bold text-blue-600">24A</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-purple-600 mb-1">GATE</p>
                          <p className="text-3xl font-bold text-purple-600">C8</p>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <Luggage className="w-5 h-5" />
                          <div>
                            <p className="text-xs">BAGGAGE ALLOWANCE</p>
                            <p className="font-bold">30kg Checked + 7kg Cabin</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-4 text-xs text-gray-500 space-y-1">
                    <p>• Please arrive at the gate 30 minutes before departure</p>
                    <p>• Valid photo ID required for boarding</p>
                    <p>• Seat assignment is subject to change</p>
                  </div>
                </div>

                {/* Decorative Perforations */}
                <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-around">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Return Boarding Pass */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plane className="w-6 h-6 transform rotate-180" />
                Return Flight - Boarding Pass
              </h2>
            </div>

            <div className="p-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-dashed border-gray-300">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">AIRLINE</p>
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.kiwi.com/airlines/64/MH.png"
                          alt="Malaysia Airlines"
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">Malaysia Airlines</p>
                          <p className="text-gray-600">Flight MH 071</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">CLASS</p>
                      <p className="text-3xl font-bold text-purple-600">Y</p>
                      <p className="text-sm text-gray-600">Economy</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">PASSENGER NAME</p>
                        <p className="text-xl font-bold text-gray-900">JOHN DOE</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">FROM</p>
                          <p className="text-4xl font-bold text-gray-900">NRT</p>
                          <p className="text-sm text-gray-600">Tokyo Narita</p>
                          <p className="text-sm text-gray-500 mt-2">Terminal 1</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">TO</p>
                          <p className="text-4xl font-bold text-gray-900">KUL</p>
                          <p className="text-sm text-gray-600">Kuala Lumpur</p>
                          <p className="text-sm text-gray-500 mt-2">Terminal KLIA</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">DATE</p>
                          <p className="text-lg font-bold text-gray-900">20 MAR</p>
                          <p className="text-xs text-gray-600">2026</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">BOARDING TIME</p>
                          <p className="text-lg font-bold text-gray-900">18:30</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">DEPARTURE</p>
                          <p className="text-lg font-bold text-gray-900">19:00</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-100 rounded-2xl p-6 text-center">
                        <div className="bg-white rounded-xl p-4 mb-3">
                          <QrCode className="w-32 h-32 mx-auto text-gray-800" />
                        </div>
                        <p className="text-xs text-gray-600 mb-1">BOOKING REFERENCE</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-wider">{bookingRef}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-purple-600 mb-1">SEAT</p>
                          <p className="text-3xl font-bold text-purple-600">18F</p>
                        </div>

                        <div className="bg-pink-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-pink-600 mb-1">GATE</p>
                          <p className="text-3xl font-bold text-pink-600">A12</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-around">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Voucher */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Hotel className="w-6 h-6" />
                Hotel Confirmation
              </h2>
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Hotel Gracery Shinjuku</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    1-19-1 Kabukicho, Shinjuku-ku, Tokyo 160-0021
                  </p>
                </div>
                <div className="bg-green-100 rounded-xl p-4">
                  <QrCode className="w-24 h-24 text-green-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
                  <p className="font-bold text-gray-900">15 Mar 2026</p>
                  <p className="text-sm text-gray-600">After 3:00 PM</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
                  <p className="font-bold text-gray-900">20 Mar 2026</p>
                  <p className="text-sm text-gray-600">Before 11:00 AM</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">ROOM TYPE</p>
                  <p className="font-bold text-gray-900">Superior Double</p>
                  <p className="text-sm text-gray-600">Non-smoking</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">GUESTS</p>
                  <p className="font-bold text-gray-900">2 Adults</p>
                  <p className="text-sm text-gray-600">1 Room</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-green-900">✓ Breakfast included (2 persons)</p>
                <p className="font-semibold text-green-900">✓ Free WiFi</p>
                <p className="font-semibold text-green-900">✓ Free cancellation until 3 days before</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Confirmation Number: <span className="font-bold text-gray-900">{bookingRef}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
