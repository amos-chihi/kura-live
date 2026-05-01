'use client'

import { useState } from 'react'
import { Shield, User, Lock, Eye, EyeOff, AlertTriangle, Settings } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { createMockSession, getRoleTokenCookie, serializeSession } from '@/lib/session'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
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

      if (formData.username === 'admin' && formData.password === 'admin123') {
        const session = createMockSession({
          id: 'admin-001',
          email: 'admin@kuralive.ke',
          role: 'admin'
        })
        const tokenCookie = getRoleTokenCookie('admin')

        document.cookie = `kuraLiveSession=${serializeSession(session)}; path=/; max-age=3600; SameSite=Lax`
        document.cookie = `${tokenCookie}=mock-admin-token; path=/; max-age=3600; SameSite=Lax`
        window.location.assign('/admin')
      } else {
        setError('Invalid username or password')
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
              <Settings className="w-12 h-12 text-kura-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Kura Live Administration System</p>
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
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter admin username"
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
                  placeholder="Enter admin password"
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
              <p className="text-xs text-white">Username: admin</p>
              <p className="text-xs text-white">Password: admin123</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <Badge variant="default" className="bg-red-500/10 text-red-400 border-red-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              Restricted access. Authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
