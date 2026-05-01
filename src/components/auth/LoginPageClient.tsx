'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { createMockSession, getRoleTokenCookie, serializeSession } from '@/lib/session'
import { resolveAuthorizedRoute } from '@/lib/access'

export default function LoginPageClient() {
  const searchParams = useSearchParams()
  const requestedRedirect = searchParams.get('redirectTo')

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const mockUsers = {
        'agent@kuralive.ke': {
          password: 'KuraLive2027!',
          role: 'agent',
          redirectTo: '/dashboard'
        },
        'admin@kuralive.ke': {
          password: 'AdminKura2027!',
          role: 'admin',
          redirectTo: '/admin'
        }
      } as const

      const user = mockUsers[formData.email as keyof typeof mockUsers]

      if (!user || user.password !== formData.password) {
        setError('Invalid email or password')
        return
      }

      const mockSession = createMockSession({
        id: user.role === 'agent' ? 'agent-001' : 'admin-001',
        email: formData.email,
        role: user.role
      })
      const tokenCookie = getRoleTokenCookie(user.role)
      const safeRedirect = resolveAuthorizedRoute(user.role, requestedRedirect ?? user.redirectTo)

      document.cookie = `kuraLiveSession=${serializeSession(mockSession)}; path=/; max-age=3600; SameSite=Lax`
      document.cookie = `${tokenCookie}=mock-${user.role}-token; path=/; max-age=3600; SameSite=Lax`

      window.location.assign(safeRedirect)
    } catch {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-kura-navy flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-kura-accent" />
          </div>
          <h1 className="text-3xl font-bold text-kura-accent mb-2">KURA LIVE</h1>
          <p className="text-gray-400">Kenya Election 2027 Agent Portal</p>
          <Badge variant="info" className="mt-4">
            Secure Login Required
          </Badge>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-kura-border">
            <p className="text-sm text-gray-400 mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-kura-navy border border-kura-border rounded p-3">
                <p className="text-gray-300">Agent: agent@kuralive.ke</p>
                <p className="text-gray-400">Password: KuraLive2027!</p>
              </div>
              <div className="bg-kura-navy border border-kura-border rounded p-3">
                <p className="text-gray-300">Admin: admin@kuralive.ke</p>
                <p className="text-gray-400">Password: AdminKura2027!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Kenya Unified Results Architecture</p>
          <p>Election Monitoring System 2027</p>
        </div>
      </div>
    </div>
  )
}
