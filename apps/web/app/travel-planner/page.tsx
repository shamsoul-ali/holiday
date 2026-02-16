'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, Calendar, Plane, Shield, Wallet, Shirt, Camera, FileText, AlertCircle, Plus } from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  category: string
  completed: boolean
  daysBeforeDeparture: number
}

export default function TravelPlannerPage() {
  const router = useRouter()

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // 3+ months before
    { id: '1', title: 'Check passport validity (6+ months)', category: 'Documents', completed: false, daysBeforeDeparture: 90 },
    { id: '2', title: 'Apply for visa (if required)', category: 'Documents', completed: false, daysBeforeDeparture: 90 },
    { id: '3', title: 'Book flights and accommodation', category: 'Booking', completed: true, daysBeforeDeparture: 90 },

    // 1-2 months before
    { id: '4', title: 'Purchase travel insurance', category: 'Insurance', completed: false, daysBeforeDeparture: 60 },
    { id: '5', title: 'Check vaccination requirements', category: 'Health', completed: false, daysBeforeDeparture: 60 },
    { id: '6', title: 'Notify bank of travel plans', category: 'Finance', completed: false, daysBeforeDeparture: 60 },
    { id: '7', title: 'Apply for international driver\'s license', category: 'Documents', completed: false, daysBeforeDeparture: 60 },

    // 2-4 weeks before
    { id: '8', title: 'Make photocopies of important documents', category: 'Documents', completed: false, daysBeforeDeparture: 21 },
    { id: '9', title: 'Check-in online for flights', category: 'Travel', completed: false, daysBeforeDeparture: 14 },
    { id: '10', title: 'Exchange currency', category: 'Finance', completed: false, daysBeforeDeparture: 14 },
    { id: '11', title: 'Purchase SIM card or activate roaming', category: 'Connectivity', completed: false, daysBeforeDeparture: 14 },

    // 1 week before
    { id: '12', title: 'Pack luggage', category: 'Packing', completed: false, daysBeforeDeparture: 7 },
    { id: '13', title: 'Confirm hotel reservations', category: 'Accommodation', completed: false, daysBeforeDeparture: 7 },
    { id: '14', title: 'Download offline maps', category: 'Apps', completed: false, daysBeforeDeparture: 7 },
    { id: '15', title: 'Save emergency contacts', category: 'Safety', completed: false, daysBeforeDeparture: 7 },

    // 24 hours before
    { id: '16', title: 'Check weather forecast', category: 'Preparation', completed: false, daysBeforeDeparture: 1 },
    { id: '17', title: 'Charge all devices', category: 'Electronics', completed: false, daysBeforeDeparture: 1 },
    { id: '18', title: 'Print boarding passes', category: 'Travel', completed: false, daysBeforeDeparture: 1 },
    { id: '19', title: 'Check flight status', category: 'Travel', completed: false, daysBeforeDeparture: 1 },
    { id: '20', title: 'Empty perishables from fridge', category: 'Home', completed: false, daysBeforeDeparture: 1 }
  ])

  const [packingList, setPackingList] = useState([
    { id: 'p1', item: 'Passport', packed: true },
    { id: 'p2', item: 'Flight tickets', packed: true },
    { id: 'p3', item: 'Hotel vouchers', packed: true },
    { id: 'p4', item: 'Travel insurance documents', packed: false },
    { id: 'p5', item: 'Credit/Debit cards', packed: false },
    { id: 'p6', item: 'Cash (local currency)', packed: false },
    { id: 'p7', item: 'Phone charger', packed: false },
    { id: 'p8', item: 'Power adapter', packed: false },
    { id: 'p9', item: 'Medications', packed: false },
    { id: 'p10', item: 'Toiletries', packed: false },
    { id: 'p11', item: 'Clothing (5 days)', packed: false },
    { id: 'p12', item: 'Comfortable shoes', packed: false },
    { id: 'p13', item: 'Sunglasses', packed: false },
    { id: 'p14', item: 'Camera', packed: false },
    { id: 'p15', item: 'Portable battery', packed: false }
  ])

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const togglePackingItem = (id: string) => {
    setPackingList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      Documents: FileText,
      Travel: Plane,
      Insurance: Shield,
      Finance: Wallet,
      Packing: Shirt,
      Safety: AlertCircle
    }
    return icons[category] || Calendar
  }

  const groupedChecklist = checklist.reduce((acc, item) => {
    const timeframe =
      item.daysBeforeDeparture >= 90 ? '3+ Months Before' :
      item.daysBeforeDeparture >= 60 ? '1-2 Months Before' :
      item.daysBeforeDeparture >= 14 ? '2-4 Weeks Before' :
      item.daysBeforeDeparture >= 7 ? '1 Week Before' :
      '24 Hours Before'

    if (!acc[timeframe]) acc[timeframe] = []
    acc[timeframe].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  const completionPercentage = Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100)
  const packingPercentage = Math.round((packingList.filter(i => i.packed).length / packingList.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Planner</h1>
              <p className="text-sm text-gray-600 mt-1">
                Your complete pre-travel checklist
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
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pre-Travel Checklist</h3>
              <span className="text-3xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {checklist.filter(i => i.completed).length} of {checklist.length} tasks completed
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Packing List</h3>
              <span className="text-3xl font-bold text-green-600">{packingPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-green-600 to-emerald-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${packingPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {packingList.filter(i => i.packed).length} of {packingList.length} items packed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pre-Travel Tasks</h2>

              {Object.entries(groupedChecklist).map(([timeframe, items]) => (
                <div key={timeframe} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {timeframe}
                  </h3>

                  <div className="space-y-3">
                    {items.map(item => {
                      const Icon = getCategoryIcon(item.category)
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                            item.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}

                          <div className="flex-1 text-left">
                            <p className={`font-semibold ${item.completed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{item.category}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packing List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-purple-600" />
                Packing List
              </h3>

              <div className="space-y-2 mb-4 max-h-[600px] overflow-y-auto">
                {packingList.map(item => (
                  <button
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      item.packed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {item.packed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.packed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                      {item.item}
                    </span>
                  </button>
                ))}
              </div>

              <button className="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-lg font-semibold hover:bg-purple-200 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Travel Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-blue-900 mb-1">Documents</p>
              <p className="text-gray-700">Keep digital copies in cloud storage</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-purple-900 mb-1">Packing</p>
              <p className="text-gray-700">Roll clothes to save space</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-pink-900 mb-1">Money</p>
              <p className="text-gray-700">Notify bank to avoid card blocks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
