'use client'

import { useState } from 'react'
import { User, LogOut, Settings, User as UserIcon, Bell } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import PriceAlertManager from '../PriceAlertManager'

interface UserMenuProps {
  user: any
  onAuthClick: () => void
}

export default function UserMenu({ user, onAuthClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPriceAlerts, setShowPriceAlerts] = useState(false)
  const { signOut } = useAuth()

  if (!user) {
    return (
      <button
        onClick={onAuthClick}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.firstName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-white font-medium">
          {user.firstName || user.email?.split('@')[0] || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false)
              // Add navigation logic here
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false)
              setShowPriceAlerts(true)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
          >
            <Bell className="w-4 h-4" />
            <span>Price Alerts</span>
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false)
              // Add settings logic here
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
      
      {/* Price Alert Manager */}
      <PriceAlertManager 
        isOpen={showPriceAlerts}
        onClose={() => setShowPriceAlerts(false)}
      />
    </div>
  )
}