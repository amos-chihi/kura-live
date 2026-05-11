'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Radio, 
  Link, 
  Brain, 
  TrendingUp, 
  FileText, 
  Map, 
  Users, 
  UserPlus, 
  AlertTriangle, 
  Shield, 
  MessageSquare,
  Activity,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  badge?: number
}

interface ElectionSidebarProps {
  activeSection: string
  onSelectSection: (sectionId: string) => void
  liveStreamCount: number
  incidentCount: number
}

export default function ElectionSidebar({
  activeSection,
  onSelectSection,
  liveStreamCount,
  incidentCount,
}: ElectionSidebarProps) {
  const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'streams', label: 'Live Streams', icon: Radio, badge: liveStreamCount },
  { id: 'urls', label: 'Stream URLs', icon: Link },
  { id: 'ai', label: 'AI Processing', icon: Brain },
  { id: 'analytics', label: 'Predictive Analytics', icon: TrendingUp },
  { id: 'tally', label: 'Results Tally', icon: FileText },
  { id: 'forms', label: 'Result Forms', icon: FileText },
  { id: 'map', label: 'Map View', icon: Map, href: '/map-view' },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'registration', label: 'Agent Registration', icon: UserPlus, href: '/agent-registration' },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: incidentCount },
  { id: 'security', label: 'Security Monitor', icon: Shield },
  { id: 'communications', label: 'Communications', icon: MessageSquare }
]
  const router = useRouter()

  const handleNavigation = (item: NavItem) => {
    if (item.href) {
      router.push(item.href)
      return
    }

    onSelectSection(item.id)
  }

  return (
    <div className="fixed left-0 top-0 h-full w-[300px] bg-kura-panel border-r border-kura-border z-30 flex flex-col">
      {/* K27 Badge */}
      <div className="p-6 border-b border-kura-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-kura-green rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">K27</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-kura-text">Kura27</h1>
            <p className="text-xs text-kura-muted">Kenya 2027</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-kura-green/10 text-kura-green border-l-2 border-kura-green shadow-glow-green'
                  : 'text-kura-muted hover:text-kura-text hover:bg-kura-panel2'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-kura-green/20 text-kura-green' 
                      : 'bg-kura-red/20 text-kura-red'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  isActive ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom User Panel */}
      <div className="p-4 border-t border-kura-border">
        <div className="space-y-3">
          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-kura-green rounded-full animate-pulse"></div>
            <span className="text-xs text-kura-green">System Online</span>
          </div>
          
          {/* User Info */}
          <div className="bg-kura-panel2 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-kura-blue/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-kura-blue" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-kura-text">Ugaibu Limited</p>
                <p className="text-xs text-kura-muted">admin</p>
              </div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-muted">Connection</span>
            <span className="text-kura-green flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Secure</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
