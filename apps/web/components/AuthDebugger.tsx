'use client'

import { useAuth } from './providers/AuthProvider'

export default function AuthDebugger() {
  const { user, loading, signIn, signOut } = useAuth()

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg border border-gray-700 max-w-sm">
      <h3 className="font-bold mb-2">🔧 Auth Debug</h3>
      <div className="text-sm space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? `${user.firstName} (${user.email})` : 'Not signed in'}</div>
        <div className="pt-2 space-x-2">
          {!user ? (
            <button
              onClick={signIn}
              className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={signOut}
              className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}