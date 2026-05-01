'use client'

import { useState, useEffect, useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import StreamStatusDot from '@/components/ui/StreamStatusDot'
import StatCard from '@/components/ui/StatCard'
import { Eye, Users, TrendingUp, MapPin, Play, Square } from 'lucide-react'

interface CountyStream {
  county: string
  code: string
  activeStreams: number
  totalAgents: number
  reporting: number
  leadingParty: string
  viewers: number
  streams: Array<{
    agent: string
    station: string
    platform: string
    viewers: number
    status: string
    duration: string
  }>
}

export function StreamingDashboard() {
  const [countyStreams, setCountyStreams] = useState<CountyStream[]>([])
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)

  // Enhanced mock data with more streaming details
  const mockCountyData = useMemo<CountyStream[]>(() => [
    {
      county: 'Nairobi',
      code: 'NBR',
      activeStreams: 127,
      totalAgents: 324,
      reporting: 92,
      leadingParty: 'UDA',
      viewers: 45234,
      streams: [
        { agent: 'James Mwangi', station: 'Westlands Primary', platform: 'TikTok', viewers: 1234, status: 'live', duration: '01:23:45' },
        { agent: 'Sarah Njoroge', station: 'Kibera Primary', platform: 'YouTube', viewers: 892, status: 'live', duration: '00:45:12' },
        { agent: 'David Ochieng', station: 'Kasarani Secondary', platform: 'Platform', viewers: 567, status: 'live', duration: '02:15:30' }
      ]
    },
    {
      county: 'Mombasa',
      code: 'MSA',
      activeStreams: 89,
      totalAgents: 156,
      reporting: 87,
      leadingParty: 'ODM',
      viewers: 28901,
      streams: [
        { agent: 'Fatuma Hassan', station: 'Mombasa Town Primary', platform: 'TikTok', viewers: 987, status: 'live', duration: '01:12:20' },
        { agent: 'Ali Mohamed', station: 'Likoni Secondary', platform: 'YouTube', viewers: 654, status: 'live', duration: '00:58:45' }
      ]
    },
    {
      county: 'Kisumu',
      code: 'KSM',
      activeStreams: 76,
      totalAgents: 134,
      reporting: 95,
      leadingParty: 'ODM',
      viewers: 31245,
      streams: [
        { agent: 'Grace Akinyi', station: 'Kisumu Boys High', platform: 'TikTok', viewers: 1456, status: 'live', duration: '01:45:30' },
        { agent: 'John Ochieng', station: 'Nyalenda Primary', platform: 'YouTube', viewers: 890, status: 'live', duration: '00:32:15' }
      ]
    },
    {
      county: 'Nakuru',
      code: 'NRK',
      activeStreams: 94,
      totalAgents: 189,
      reporting: 88,
      leadingParty: 'UDA',
      viewers: 38767,
      streams: [
        { agent: 'Peter Kariuki', station: 'Nakuru Town Primary', platform: 'TikTok', viewers: 1123, status: 'live', duration: '01:08:45' },
        { agent: 'Mary Wanjiru', station: 'Bahati Secondary', platform: 'YouTube', viewers: 789, status: 'live', duration: '00:41:20' }
      ]
    },
    {
      county: 'Kiambu',
      code: 'KBU',
      activeStreams: 82,
      totalAgents: 167,
      reporting: 91,
      leadingParty: 'UDA',
      viewers: 35421,
      streams: [
        { agent: 'Samuel Kamau', station: 'Kiambu Town Primary', platform: 'TikTok', viewers: 1567, status: 'live', duration: '02:05:15' },
        { agent: 'Lucy Wangui', station: 'Thika Secondary', platform: 'YouTube', viewers: 923, status: 'live', duration: '01:23:40' }
      ]
    }
  ], [])

  useEffect(() => {
    setCountyStreams(mockCountyData)
    
    // Simulate real-time updates
    if (isMonitoring) {
      const interval = setInterval(() => {
        setCountyStreams(prev => prev.map(county => ({
          ...county,
          viewers: county.viewers + Math.floor(Math.random() * 100),
          streams: county.streams.map(stream => ({
            ...stream,
            viewers: stream.viewers + Math.floor(Math.random() * 10)
          }))
        })))
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [isMonitoring, mockCountyData])

  const totalStreams = countyStreams.reduce((sum, county) => sum + county.activeStreams, 0)
  const totalViewers = countyStreams.reduce((sum, county) => sum + county.viewers, 0)
  const avgReporting = countyStreams.length > 0 
    ? (countyStreams.reduce((sum, county) => sum + county.reporting, 0) / countyStreams.length).toFixed(1)
    : '0'

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'UDA': return 'text-kura-green'
      case 'ODM': return 'text-kura-accent'
      case 'WDM-K': return 'text-kura-amber'
      default: return 'text-gray-400'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TikTok': return '🎵'
      case 'YouTube': return '📺'
      case 'Platform': return '🌐'
      default: return '📹'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Live Streaming Monitor</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-kura-green hover:bg-kura-green/80 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isMonitoring ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Monitoring
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                Paused
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Streams"
          value={totalStreams.toLocaleString()}
          change={{ value: 12.5, type: 'increase' }}
          icon={<Play className="w-6 h-6" />}
        />
        <StatCard
          title="Total Viewers"
          value={totalViewers.toLocaleString()}
          change={{ value: 8.2, type: 'increase' }}
          icon={<Eye className="w-6 h-6" />}
        />
        <StatCard
          title="Avg Reporting"
          value={`${avgReporting}%`}
          change={{ value: 2.3, type: 'increase' }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Active Counties"
          value={countyStreams.length}
          change={{ value: 1, type: 'increase' }}
          icon={<MapPin className="w-6 h-6" />}
        />
      </div>

      {/* County Streaming Overview */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">County Streaming Overview</h3>
        <div className="space-y-4">
          {countyStreams.map((county) => (
            <div 
              key={county.code}
              className="bg-kura-navy border border-kura-border rounded-lg p-4 cursor-pointer hover:bg-kura-navy-mid transition-colors"
              onClick={() => setSelectedCounty(county.county === selectedCounty ? null : county.county)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="text-white font-medium">{county.county}</h4>
                    <p className="text-sm text-gray-400">Code: {county.code}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success" className="animate-pulse">
                      {county.activeStreams} Live
                    </Badge>
                    <Badge variant="default">
                      {county.reporting}% Reporting
                    </Badge>
                    <span className={`text-sm font-medium ${getPartyColor(county.leadingParty)}`}>
                      {county.leadingParty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{county.viewers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">viewers</div>
                </div>
              </div>

              {/* Expanded County Details */}
              {selectedCounty === county.county && (
                <div className="mt-4 pt-4 border-t border-kura-border">
                  <div className="space-y-3">
                    {county.streams.map((stream, index) => (
                      <div key={index} className="flex items-center justify-between bg-kura-surface rounded p-3">
                        <div className="flex items-center space-x-3">
                          <StreamStatusDot status="live" />
                          <span className="text-lg">{getPlatformIcon(stream.platform)}</span>
                          <div>
                            <div className="text-white text-sm font-medium">{stream.agent}</div>
                            <div className="text-xs text-gray-400">{stream.station}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-white text-sm">{stream.viewers.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">viewers</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm">{stream.duration}</div>
                            <div className="text-xs text-gray-400">duration</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Streams */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Top Performing Streams</h3>
        <div className="space-y-3">
          {countyStreams
            .flatMap(county => county.streams.map(stream => ({ ...stream, county: county.county })))
            .sort((a, b) => b.viewers - a.viewers)
            .slice(0, 5)
            .map((stream, index) => (
              <div key={index} className="flex items-center justify-between bg-kura-navy rounded p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold text-kura-accent">#{index + 1}</div>
                  <span className="text-lg">{getPlatformIcon(stream.platform)}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{stream.agent}</div>
                    <div className="text-xs text-gray-400">{stream.county} • {stream.station}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-white font-medium">{stream.viewers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">viewers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{stream.duration}</div>
                    <div className="text-xs text-gray-400">live</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
