'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import { 
  Shield, 
  Users,
  BarChart3,
  AlertTriangle, 
  Settings,
  LogOut,
  Menu,
  X,
  Radio,
  MapPin,
  MessageSquare,
  Activity
} from 'lucide-react'
import { MockSessionUser, parseSession, SESSION_COOKIE_NAME } from '@/lib/session'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<MockSessionUser | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
      body: JSON.stringify({ userType: user?.role ?? 'admin' }),
    }).catch(() => undefined)
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    window.location.href = '/'
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Command Centre', href: '/dashboard', icon: Activity },
    { name: 'Agents', href: '/admin?tab=agents', icon: Users },
    { name: 'Streaming', href: '/admin?tab=streaming', icon: Radio },
    { name: 'Stations', href: '/admin?tab=stations', icon: MapPin },
    { name: 'Communication', href: '/admin?tab=communication', icon: MessageSquare },
    { name: 'Analytics', href: '/admin?tab=analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/admin?tab=alerts', icon: AlertTriangle },
    { name: 'Settings', href: '/admin?tab=settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-kura-navy">
      {/* Header */}
      <header className="bg-kura-surface border-b border-kura-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-kura-navy-mid"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <h1 className="text-xl font-bold text-kura-accent">KURA LIVE</h1>
                <Badge variant="info" className="ml-3 hidden sm:inline-flex">
                  <Shield className="w-3 h-3 mr-1" />
                  ADMIN
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-400">Admin:</span>
                <span className="text-sm text-white font-medium">
                  {user?.email?.split('@')[0] || 'Admin User'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-kura-navy-mid rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-kura-surface border-r border-kura-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-kura-navy-mid transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-kura-accent" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t border-kura-border">
              <div className="text-xs text-gray-500">
                <p>Kenya Election 2027</p>
                <p>Campaign Admin Panel</p>
                <p className="mt-2 text-kura-accent">Elevated Access</p>
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
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
