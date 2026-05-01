'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, Shield } from 'lucide-react'

interface LogoutButtonProps {
  userType: 'agent' | 'admin'
  userName?: string
}

export default function LogoutButton({ userType, userName }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies server-side
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType })
      })
      
      // Redirect to appropriate login page
      if (userType === 'agent') {
        router.push('/agent-login')
      } else {
        router.push('/admin-login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Fallback: redirect anyway
      if (userType === 'agent') {
        router.push('/agent-login')
      } else {
        router.push('/admin-login')
      }
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {userType === 'agent' ? (
          <User className="w-4 h-4 text-gray-400" />
        ) : (
          <Shield className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-300">{userName || `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`}</span>
      </div>
      
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-kura-navy-mid rounded transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  )
}
