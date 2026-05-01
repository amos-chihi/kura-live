'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { StreamingDashboard } from '@/components/admin/StreamingDashboard'
import RealTimeMonitor from '@/components/admin/RealTimeMonitor'
import AgentManagement from '@/components/admin/AgentManagement'
import StationAssignment from '@/components/admin/StationAssignment'
import AgentPerformance from '@/components/admin/AgentPerformance'
import CommunicationHub from '@/components/admin/CommunicationHub'
import IncidentReporting from '@/components/admin/IncidentReporting'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import {
  Users,
  BarChart3,
  AlertTriangle,
  Shield,
  TrendingUp,
  MapPin,
  Eye,
  Play,
  MessageSquare
} from 'lucide-react'

export default function AdminPageClient() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats] = useState({
    totalAgents: 46229,
    activeAgents: 41234,
    totalStreams: 1247,
    criticalAlerts: 8,
    totalTallies: 8934,
    reportingStations: 41234,
    totalStations: 46229
  })

  const [alerts] = useState([
    {
      id: 'alert-001',
      station: 'KE-047-290-0001',
      agent: 'James Mwangi',
      candidate: 'Mary Wambui',
      delta: 5,
      severity: 'critical',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'alert-002',
      station: 'KE-047-290-0002',
      agent: 'Sarah Njoroge',
      candidate: 'John Kariuki',
      delta: 2,
      severity: 'warning',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'realtime', name: 'Real-time', icon: TrendingUp },
    { id: 'streaming', name: 'Streaming', icon: Play },
    { id: 'agents', name: 'Agents', icon: Users },
    { id: 'stations', name: 'Stations', icon: MapPin },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'incidents', name: 'Incidents', icon: AlertTriangle },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
    { id: 'settings', name: 'Settings', icon: Shield },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'realtime':
        return <RealTimeMonitor />
      case 'streaming':
        return <StreamingDashboard />
      case 'agents':
        return <AgentManagement />
      case 'stations':
        return <StationAssignment />
      case 'performance':
        return <AgentPerformance />
      case 'communication':
        return <CommunicationHub />
      case 'incidents':
        return <IncidentReporting />
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Agents"
                value={stats.totalAgents.toLocaleString()}
                change={{ value: 89.2, type: 'increase' }}
                icon={<Users className="w-6 h-6" />}
              />
              <StatCard
                title="Active Streams"
                value={stats.totalStreams.toLocaleString()}
                change={{ value: 12.5, type: 'increase' }}
                icon={<Eye className="w-6 h-6" />}
              />
              <StatCard
                title="Critical Alerts"
                value={stats.criticalAlerts.toLocaleString()}
                change={{ value: -5.2, type: 'decrease' }}
                icon={<AlertTriangle className="w-6 h-6" />}
              />
            </div>

            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Critical Alerts</h2>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="bg-kura-navy border border-kura-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="text-white font-medium mb-1">{alert.candidate}</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Station: {alert.station} • Agent: {alert.agent}
                    </p>
                    <p className="text-sm text-kura-accent2">
                      Delta: +{alert.delta} votes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Reporting Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">National Progress</span>
                      <span className="text-white">89.2%</span>
                    </div>
                    <div className="w-full bg-kura-navy rounded-full h-4">
                      <div className="bg-kura-accent h-full rounded-full" style={{ width: '89.2%' }} />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {stats.reportingStations.toLocaleString()} of {stats.totalStations.toLocaleString()} stations reporting
                  </div>
                </div>
              </div>

              <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-gray-400">Nairobi</span><span className="text-white">92%</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Mombasa</span><span className="text-white">87%</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Kisumu</span><span className="text-white">91%</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Nakuru</span><span className="text-white">88%</span></div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Alert Management</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="error">{stats.criticalAlerts} Critical</Badge>
                <Badge variant="warning">12 Warning</Badge>
              </div>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-kura-surface border border-kura-border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">{alert.candidate}</h3>
                      <p className="text-gray-400 mb-3">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        {alert.station} • {alert.agent}
                      </p>
                      <p className="text-kura-accent2 font-medium">Vote discrepancy: +{alert.delta}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-kura-amber/20 text-kura-amber border border-kura-amber/50 rounded hover:bg-kura-amber/30 transition-colors">Investigate</button>
                      <button className="px-3 py-1 bg-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Admin Settings</h2>
            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">System Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Real-time Updates</p>
                    <p className="text-sm text-gray-400">Enable live data streaming</p>
                  </div>
                  <button className="w-12 h-6 bg-kura-accent rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Alert Threshold</p>
                    <p className="text-sm text-gray-400">Minimum votes for discrepancy alert</p>
                  </div>
                  <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
                    <option>1 vote</option>
                    <option>5 votes</option>
                    <option>10 votes</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto-refresh Rate</p>
                    <p className="text-sm text-gray-400">Dashboard update frequency</p>
                  </div>
                  <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-kura-surface border border-kura-border rounded-lg p-1">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${activeTab === tab.id
                  ? 'bg-kura-accent text-white'
                  : 'text-gray-300 hover:text-white hover:bg-kura-navy-mid'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
              {tab.id === 'alerts' && stats.criticalAlerts > 0 && (
                <Badge variant="error" size="sm" className="ml-2">
                  {stats.criticalAlerts}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
      {renderContent()}
    </div>
  )
}
