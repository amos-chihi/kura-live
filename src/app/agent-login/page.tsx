'use client'

import { useState } from 'react'
import { Shield, User, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createMockSession, getRoleTokenCookie, serializeSession } from '@/lib/session'

export default function AgentLoginPage() {
  const [formData, setFormData] = useState({
    agentId: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (formData.agentId === 'AG-0001' && formData.password === 'password123') {
        const session = createMockSession({
          id: 'agent-001',
          email: 'agent@kuralive.ke',
          role: 'agent'
        })
        const tokenCookie = getRoleTokenCookie('agent')

        document.cookie = `kuraLiveSession=${serializeSession(session)}; path=/; max-age=3600; SameSite=Lax`
        document.cookie = `${tokenCookie}=mock-agent-token; path=/; max-age=3600; SameSite=Lax`
        window.location.assign('/agent')
      } else {
        setError('Invalid Agent ID or password')
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-kura-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-kura-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Agent Login</h1>
            <p className="text-gray-400">Kura Live Election Monitoring System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agent ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.agentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
                  placeholder="e.g., AG-0001"
                  className="w-full pl-10 pr-4 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-kura-navy/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-white">Agent ID: AG-0001</p>
              <p className="text-xs text-white">Password: password123</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Secure Login
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              This is a secure system. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
