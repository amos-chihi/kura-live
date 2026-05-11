'use client'

import { useState, useEffect } from 'react'
import { MockSessionUser, parseSession, SESSION_COOKIE_NAME } from '@/lib/session'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<MockSessionUser | null>(null)

  useEffect(() => {
    // Get mock user from cookie
    const getMockUser = () => {
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
      )
      
      if (sessionCookie) {
        return parseSession(sessionCookie.split('=')[1])?.user ?? null
      }
      return null
    }
    
    setUser(getMockUser())
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: user?.role ?? 'agent' }),
    }).catch(() => undefined)
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-kura-bg">
      {children}
    </div>
  )
}
