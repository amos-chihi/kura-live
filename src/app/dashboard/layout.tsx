'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAlertStore } from '@/store/alertStore'
import StreamStatusDot from '@/components/ui/StreamStatusDot'
import { 
  BarChart3, 
  Radio,
  Brain,
  FileText,
  AlertTriangle, 
  LogOut,
  Menu,
  X,
  Map,
  Shield,
  Users,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { MockSessionUser, parseSession, SESSION_COOKIE_NAME } from '@/lib/session'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<MockSessionUser | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { unreadCount } = useAlertStore()
  const pathname = usePathname()

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

  const navigation = [
    { name: 'Command Centre', href: '/dashboard', icon: BarChart3 },
    { name: 'Live Streams', href: '/admin?tab=streaming', icon: Radio },
    { name: 'AI Oversight', href: '/admin?tab=realtime', icon: Brain },
    { name: 'Results Tally', href: '/results-tally', icon: FileText },
    { name: 'Geo Monitor', href: '/map-view', icon: Map },
    { name: 'Agent Operations', href: '/admin?tab=agents', icon: Users },
    { name: 'Station Assignment', href: '/admin?tab=stations', icon: Shield },
    { name: 'Communications', href: '/admin?tab=communication', icon: MessageSquare },
    { name: 'Incidents', href: '/admin?tab=incidents', icon: AlertTriangle },
    { name: 'Analytics', href: '/admin?tab=analytics', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-kura-bg">
      {/* Topbar */}
      <header className="h-14 sticky top-0 bg-kura-bg/80 backdrop-blur border-b border-kura-border">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Hamburger + LIVE indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md text-kura-text-muted hover:text-kura-text hover:bg-kura-elevated transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-kura-red rounded-full live-pulse"></div>
              <span className="text-xs font-medium text-kura-red">LIVE</span>
              <span className="text-xs text-kura-text-faint">|</span>
              <span className="text-xs text-kura-text-muted">Kura27 · Kenya General Election 2027</span>
            </div>
          </div>
          
          {/* Right: Clock */}
          <div className="text-xs text-kura-text font-mono">
            {new Date().toLocaleTimeString('en-KE', { hour12: false })}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-[260px] bg-kura-panel border-r border-kura-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 mt-14 lg:mt-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-kura-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-kura-green to-kura-green-dim rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">K27</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-kura-text">Kura27</div>
                  <div className="text-[9px] text-kura-text-faint">KENYA 2027</div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-kura-text-muted hover:text-kura-text hover:bg-kura-elevated transition-colors"
                >
                  <item.icon className="mr-3 h-4 w-4 text-kura-muted group-hover:text-kura-green" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-kura-border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-kura-text-muted">
                  <div className="font-medium">{user?.email?.split('@')[0] || 'Command User'}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-kura-green rounded-full live-pulse"></div>
                    <span className="text-[9px]">Admin Control Plane</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-kura-text-muted hover:text-kura-text hover:bg-kura-elevated rounded transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 mt-14 lg:mt-0">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
