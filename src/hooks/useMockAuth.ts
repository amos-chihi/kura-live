'use client'

import { useState, useEffect } from 'react'
import { MockSessionUser, parseSession, SESSION_COOKIE_NAME } from '@/lib/session'

export function useMockAuth() {
  const [user, setUser] = useState<MockSessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
    setIsLoading(false)
  }, [])

  const logout = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    setUser(null)
    window.location.href = '/'
  }

  return { user, isLoading, logout }
}
