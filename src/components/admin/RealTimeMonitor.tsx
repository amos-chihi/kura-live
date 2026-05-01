'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Video, AlertTriangle, TrendingUp, MapPin, Clock, Radio } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface RealTimeStats {
  activeAgents: number
  liveStreams: number
  criticalAlerts: number
  totalTallies: number
  reportingProgress: number
  averageStreamViewers: number
}

interface LiveActivity {
  id: string
  type: 'stream_start' | 'stream_end' | 'alert_created' | 'tally_submitted' | 'agent_login'
  agentName: string
  stationCode: string
  timestamp: string
  details: string
}

export default function RealTimeMonitor() {
  const [stats, setStats] = useState<RealTimeStats>({
    activeAgents: 41234,
    liveStreams: 1247,
    criticalAlerts: 8,
    totalTallies: 8934,
    reportingProgress: 89.2,
    averageStreamViewers: 156
  })

  const [activities, setActivities] = useState<LiveActivity[]>([
    {
      id: '1',
      type: 'stream_start',
      agentName: 'James Mwangi',
      stationCode: 'KE-047-290-0001',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      details: 'Started YouTube stream'
    },
    {
      id: '2',
      type: 'alert_created',
      agentName: 'Sarah Njoroge',
      stationCode: 'KE-047-290-0002',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      details: 'Critical vote discrepancy detected'
    },
    {
      id: '3',
      type: 'tally_submitted',
      agentName: 'David Ochieng',
      stationCode: 'KE-047-290-0003',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      details: 'Form 34A uploaded and processed'
    },
    {
      id: '4',
      type: 'agent_login',
      agentName: 'Grace Kiplagat',
      stationCode: 'KE-047-290-0004',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      details: 'Agent logged in to dashboard'
    }
  ])

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update stats with small random changes
      setStats(prev => ({
        ...prev,
        activeAgents: prev.activeAgents + Math.floor(Math.random() * 10) - 5,
        liveStreams: prev.liveStreams + Math.floor(Math.random() * 3) - 1,
        averageStreamViewers: prev.averageStreamViewers + Math.floor(Math.random() * 20) - 10
      }))

      // Occasionally add new activity
      if (Math.random() > 0.7) {
        const activityTypes: LiveActivity['type'][] = ['stream_start', 'stream_end', 'alert_created', 'tally_submitted', 'agent_login']
        const agentNames = ['John Kamau', 'Mary Wanjiru', 'Peter Mutiso', 'Esther Akoth', 'Samuel Kiplagat']
        const stationCodes = ['KE-047-290-0005', 'KE-047-290-0006', 'KE-047-290-0007', 'KE-047-290-0008']
        
        const newActivity: LiveActivity = {
          id: Date.now().toString(),
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          agentName: agentNames[Math.floor(Math.random() * agentNames.length)],
          stationCode: stationCodes[Math.floor(Math.random() * stationCodes.length)],
          timestamp: new Date().toISOString(),
          details: 'New activity detected'
        }

        setActivities(prev => [newActivity, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'stream_start': return <Video className="w-4 h-4 text-green-400" />
      case 'stream_end': return <Video className="w-4 h-4 text-red-400" />
      case 'alert_created': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'tally_submitted': return <Radio className="w-4 h-4 text-blue-400" />
      case 'agent_login': return <Users className="w-4 h-4 text-purple-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: LiveActivity['type']) => {
    switch (type) {
      case 'stream_start': return 'border-green-500/30 bg-green-500/5'
      case 'stream_end': return 'border-red-500/30 bg-red-500/5'
      case 'alert_created': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'tally_submitted': return 'border-blue-500/30 bg-blue-500/5'
      case 'agent_login': return 'border-purple-500/30 bg-purple-500/5'
      default: return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.activeAgents.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400">Active Agents</div>
          <div className="mt-2 text-xs text-green-400">+2.3% from last hour</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.liveStreams.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400">Live Streams</div>
          <div className="mt-2 text-xs text-green-400">+5.1% from last hour</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.criticalAlerts}</span>
          </div>
          <div className="text-xs text-gray-400">Critical Alerts</div>
          <div className="mt-2 text-xs text-red-400">+1 new in last 15 min</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalTallies.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400">Total Tallies</div>
          <div className="mt-2 text-xs text-green-400">+127 in last hour</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.reportingProgress}%</span>
          </div>
          <div className="text-xs text-gray-400">Reporting Progress</div>
          <div className="mt-2 text-xs text-green-400">+0.8% from last hour</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.averageStreamViewers}</span>
          </div>
          <div className="text-xs text-gray-400">Avg Viewers</div>
          <div className="mt-2 text-xs text-green-400">+12 from last hour</div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Live Activity Feed</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Live updates</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${getActivityColor(activity.type)} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => setSelectedActivity(selectedActivity === activity.id ? null : activity.id)}
            >
              <div className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{activity.agentName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-1">{activity.details}</div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{activity.stationCode}</span>
                  </div>
                </div>
              </div>

              {selectedActivity === activity.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-700"
                >
                  <div className="text-sm text-gray-300">
                    <p>Activity ID: {activity.id}</p>
                    <p>Full timestamp: {new Date(activity.timestamp).toLocaleString()}</p>
                    <p>Station: {activity.stationCode}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Geographic Distribution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { county: 'Nairobi', progress: 92, agents: 8234, streams: 234 },
            { county: 'Mombasa', progress: 87, agents: 5621, streams: 189 },
            { county: 'Kisumu', progress: 91, agents: 4156, streams: 156 },
            { county: 'Nakuru', progress: 88, agents: 6789, streams: 201 }
          ].map((region) => (
            <div key={region.county} className="bg-kura-navy rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">{region.county}</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{region.progress}%</span>
                  </div>
                  <div className="w-full bg-kura-surface rounded-full h-2">
                    <div 
                      className="bg-kura-accent h-full rounded-full transition-all duration-500"
                      style={{ width: `${region.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Agents</span>
                  <span className="text-white">{region.agents.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Streams</span>
                  <span className="text-white">{region.streams}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">System Health</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-medium mb-3">Server Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">API Response Time</span>
                <span className="text-green-400">124ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Database Load</span>
                <span className="text-yellow-400">67%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">WebSocket Connections</span>
                <span className="text-green-400">1,247</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Stream Quality</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average Bitrate</span>
                <span className="text-green-400">2.4 Mbps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stream Uptime</span>
                <span className="text-green-400">99.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Failed Streams</span>
                <span className="text-red-400">3 (0.2%)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Data Integrity</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Data Sync Status</span>
                <span className="text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Backup Status</span>
                <span className="text-green-400">Current</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Validation Errors</span>
                <span className="text-yellow-400">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
