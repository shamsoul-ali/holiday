'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '../../components/providers/AuthProvider'
import { User, Mail, Phone, Calendar, MapPin, DollarSign, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  date_of_birth: string | null
  nationality: string | null
  preferred_currency: string
  travel_preferences: any
}

export default function ProfilePage() {
  const { user, loading, refreshProfile } = useRequireAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          nationality: profile.nationality,
          preferred_currency: profile.preferred_currency,
          travel_preferences: profile.travel_preferences
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile updated successfully!')
        await refreshProfile()
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    if (!profile) return
    
    setProfile(prev => ({
      ...prev!,
      [field]: value
    }))
  }

  const handlePreferenceChange = (category: string, preference: string) => {
    if (!profile) return

    const currentPrefs = profile.travel_preferences || {}
    const categoryPrefs = currentPrefs[category] || []
    
    const updatedPrefs = {
      ...currentPrefs,
      [category]: categoryPrefs.includes(preference)
        ? categoryPrefs.filter((p: string) => p !== preference)
        : [...categoryPrefs, preference]
    }

    setProfile(prev => ({
      ...prev!,
      travel_preferences: updatedPrefs
    }))
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and travel preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={20} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+60123456789"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.nationality || ''}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="e.g. Malaysian"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={profile.preferred_currency}
                      onChange={(e) => handleInputChange('preferred_currency', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MYR">Malaysian Ringgit (MYR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="SGD">Singapore Dollar (SGD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Travel Preferences</h2>
              
              {/* Travel Style */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Travel Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['luxury', 'budget', 'backpacking', 'business'].map((style) => (
                    <button
                      key={style}
                      onClick={() => handlePreferenceChange('travel_style', style)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        profile.travel_preferences?.travel_style?.includes(style)
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Type */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['solo', 'couples', 'family', 'friends'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePreferenceChange('group_type', type)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        profile.travel_preferences?.group_type?.includes(type)
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Activities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['city', 'nature', 'culture', 'adventure', 'beaches', 'shopping', 'food', 'nightlife'].map((activity) => (
                    <button
                      key={activity}
                      onClick={() => handlePreferenceChange('activities', activity)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        profile.travel_preferences?.activities?.includes(activity)
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {activity.charAt(0).toUpperCase() + activity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary Requirements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['halal', 'vegetarian', 'vegan', 'kosher', 'gluten-free'].map((dietary) => (
                    <button
                      key={dietary}
                      onClick={() => handlePreferenceChange('dietary', dietary)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        profile.travel_preferences?.dietary?.includes(dietary)
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Summary</h3>
              <div className="text-center mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {(profile.full_name || profile.email)[0].toUpperCase()}
                  </div>
                )}
                <h4 className="font-semibold text-gray-900">{profile.full_name || 'Unnamed User'}</h4>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold">{profile.preferred_currency}</span>
                </div>
                {profile.nationality && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nationality:</span>
                    <span className="font-semibold">{profile.nationality}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}