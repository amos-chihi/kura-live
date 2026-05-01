'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Video, Radio, AlertTriangle, Award, Clock, MapPin, Filter, Download } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface PerformanceMetrics {
  agentId: string
  agentName: string
  stationCode: string
  streamDuration: number // minutes
  totalViewers: number
  avgViewers: number
  talliesSubmitted: number
  alertsTriggered: number
  accuracy: number // percentage
  reliability: number // percentage
  lastActive: string
  performanceScore: number // 0-100
}

interface PerformanceAnalyticsProps {
  timeRange?: '24h' | '7d' | '30d' | '90d'
}

export default function AgentPerformance({ timeRange = '7d' }: PerformanceAnalyticsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<PerformanceMetrics | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'viewers' | 'tallies' | 'accuracy'>('score')
  const [filterBy, setFilterBy] = useState<'all' | 'top' | 'bottom'>('all')

  useEffect(() => {
    // Generate mock performance data
    const mockMetrics: PerformanceMetrics[] = Array.from({ length: 50 }, (_, i) => {
      const streamDuration = Math.floor(Math.random() * 480) + 30 // 30-510 minutes
      const totalViewers = Math.floor(Math.random() * 10000) + 100
      const talliesSubmitted = Math.floor(Math.random() * 20) + 1
      const alertsTriggered = Math.floor(Math.random() * 5)
      const accuracy = Math.random() * 30 + 70 // 70-100%
      const reliability = Math.random() * 20 + 80 // 80-100%
      
      // Calculate performance score
      const performanceScore = Math.round(
        (accuracy * 0.3) + 
        (reliability * 0.3) + 
        (Math.min(totalViewers / 100, 100) * 0.2) + 
        (Math.min(talliesSubmitted * 5, 100) * 0.2)
      )

      return {
        agentId: `AG-${String(i + 1).padStart(4, '0')}`,
        agentName: `Agent ${i + 1}`,
        stationCode: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        streamDuration,
        totalViewers,
        avgViewers: Math.floor(totalViewers / Math.max(streamDuration / 60, 1)),
        talliesSubmitted,
        alertsTriggered,
        accuracy: Math.round(accuracy),
        reliability: Math.round(reliability),
        lastActive: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        performanceScore
      }
    })

    setMetrics(mockMetrics)
    setLoading(false)
  }, [timeRange])

  const getFilteredAndSortedMetrics = () => {
    let filtered = [...metrics]

    // Apply filter
    if (filterBy === 'top') {
      filtered = filtered.filter(m => m.performanceScore >= 80)
    } else if (filterBy === 'bottom') {
      filtered = filtered.filter(m => m.performanceScore < 60)
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.performanceScore - a.performanceScore
        case 'viewers':
          return b.totalViewers - a.totalViewers
        case 'tallies':
          return b.talliesSubmitted - a.talliesSubmitted
        case 'accuracy':
          return b.accuracy - a.accuracy
        default:
          return b.performanceScore - a.performanceScore
      }
    })

    return filtered
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-500/10 text-green-400 border-green-500/30' }
    if (score >= 75) return { text: 'Good', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
    if (score >= 60) return { text: 'Average', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' }
    return { text: 'Poor', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const filteredMetrics = getFilteredAndSortedMetrics()
  const topPerformers = filteredMetrics.slice(0, 10)
  const bottomPerformers = filteredMetrics.slice(-5).reverse()

  const overallStats = {
    totalAgents: metrics.length,
    avgScore: Math.round(metrics.reduce((sum, m) => sum + m.performanceScore, 0) / metrics.length),
    totalStreamTime: metrics.reduce((sum, m) => sum + m.streamDuration, 0),
    totalViewers: metrics.reduce((sum, m) => sum + m.totalViewers, 0),
    totalTallies: metrics.reduce((sum, m) => sum + m.talliesSubmitted, 0),
    totalAlerts: metrics.reduce((sum, m) => sum + m.alertsTriggered, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-kura-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{overallStats.totalAgents}</span>
          </div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{overallStats.avgScore}</span>
          </div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{formatDuration(overallStats.totalStreamTime)}</span>
          </div>
          <div className="text-sm text-gray-400">Total Stream Time</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{overallStats.totalViewers.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-400">Total Viewers</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Radio className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{overallStats.totalTallies}</span>
          </div>
          <div className="text-sm text-gray-400">Total Tallies</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{overallStats.totalAlerts}</span>
          </div>
          <div className="text-sm text-gray-400">Total Alerts</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'top' | 'bottom')}
              className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">All Agents</option>
              <option value="top">Top Performers (80+)</option>
              <option value="bottom">Needs Improvement (&lt;60)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'viewers' | 'tallies' | 'accuracy')}
              className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
            >
              <option value="score">Performance Score</option>
              <option value="viewers">Total Viewers</option>
              <option value="tallies">Tallies Submitted</option>
              <option value="accuracy">Accuracy</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Time Range:</span>
            <select
              value={timeRange}
              className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button className="flex items-center px-3 py-1 bg-kura-accent hover:bg-kura-accent/80 text-white rounded text-sm">
            <Download className="w-3 h-3 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
        <div className="space-y-3">
          {topPerformers.map((agent, index) => {
            const badge = getPerformanceBadge(agent.performanceScore)
            return (
              <motion.div
                key={agent.agentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-kura-navy rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-kura-accent rounded-full">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{agent.agentName}</div>
                    <div className="text-sm text-gray-400">{agent.agentId} • {agent.stationCode}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{agent.performanceScore}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{agent.totalViewers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Viewers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{agent.talliesSubmitted}</div>
                    <div className="text-xs text-gray-400">Tallies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{agent.accuracy}%</div>
                    <div className="text-xs text-gray-400">Accuracy</div>
                  </div>
                  <Badge variant="default" size="sm" className={badge.color}>
                    {badge.text}
                  </Badge>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Performance Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Distribution</h3>
          <div className="space-y-4">
            {[
              { range: '90-100', count: metrics.filter(m => m.performanceScore >= 90).length, color: 'bg-green-500' },
              { range: '75-89', count: metrics.filter(m => m.performanceScore >= 75 && m.performanceScore < 90).length, color: 'bg-blue-500' },
              { range: '60-74', count: metrics.filter(m => m.performanceScore >= 60 && m.performanceScore < 75).length, color: 'bg-yellow-500' },
              { range: '0-59', count: metrics.filter(m => m.performanceScore < 60).length, color: 'bg-red-500' }
            ].map((segment) => (
              <div key={segment.range}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{segment.range}</span>
                  <span className="text-white">{segment.count} agents</span>
                </div>
                <div className="w-full bg-kura-navy rounded-full h-2">
                  <div 
                    className={`${segment.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${(segment.count / metrics.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Needs Attention</h3>
          <div className="space-y-3">
            {bottomPerformers.map((agent) => {
              const badge = getPerformanceBadge(agent.performanceScore)
              return (
                <div key={agent.agentId} className="flex items-center justify-between p-3 bg-kura-navy rounded-lg">
                  <div>
                    <div className="text-white font-medium">{agent.agentName}</div>
                    <div className="text-sm text-gray-400">{agent.agentId}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${getPerformanceColor(agent.performanceScore)}`}>
                      {agent.performanceScore}
                    </span>
                    <Badge variant="default" size="sm" className={badge.color}>
                      {badge.text}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-kura-navy">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Agent</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Score</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Stream Time</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Viewers</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Tallies</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Accuracy</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Reliability</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Alerts</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.slice(0, 20).map((agent) => {
                const badge = getPerformanceBadge(agent.performanceScore)
                return (
                  <tr key={agent.agentId} className="border-b border-kura-border hover:bg-kura-navy/30">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-white font-medium">{agent.agentName}</div>
                        <div className="text-sm text-gray-400">{agent.agentId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`font-bold ${getPerformanceColor(agent.performanceScore)}`}>
                          {agent.performanceScore}
                        </span>
                        <Badge variant="default" size="sm" className={badge.color}>
                          {badge.text}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-white">
                      {formatDuration(agent.streamDuration)}
                    </td>
                    <td className="px-4 py-3 text-center text-white">
                      {agent.totalViewers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-white">
                      {agent.talliesSubmitted}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={agent.accuracy >= 90 ? 'text-green-400' : agent.accuracy >= 75 ? 'text-yellow-400' : 'text-red-400'}>
                        {agent.accuracy}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={agent.reliability >= 90 ? 'text-green-400' : agent.reliability >= 75 ? 'text-yellow-400' : 'text-red-400'}>
                        {agent.reliability}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={agent.alertsTriggered === 0 ? 'text-green-400' : agent.alertsTriggered <= 2 ? 'text-yellow-400' : 'text-red-400'}>
                        {agent.alertsTriggered}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">
                      {new Date(agent.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
