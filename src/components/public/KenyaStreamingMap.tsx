'use client'

import { useState, useEffect, useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import StreamStatusDot from '@/components/ui/StreamStatusDot'
import { Eye } from 'lucide-react'

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
  }>
}

export function KenyaStreamingMap() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [countyStreams, setCountyStreams] = useState<CountyStream[]>([])

  // Mock county streaming data
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
        { agent: 'James Mwangi', station: 'Westlands Primary', platform: 'TikTok', viewers: 1234, status: 'live' },
        { agent: 'Sarah Njoroge', station: 'Kibera Primary', platform: 'YouTube', viewers: 892, status: 'live' },
        { agent: 'David Ochieng', station: 'Kasarani Secondary', platform: 'Platform', viewers: 567, status: 'live' }
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
        { agent: 'Fatuma Hassan', station: 'Mombasa Town Primary', platform: 'TikTok', viewers: 987, status: 'live' },
        { agent: 'Ali Mohamed', station: 'Likoni Secondary', platform: 'YouTube', viewers: 654, status: 'live' }
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
        { agent: 'Grace Akinyi', station: 'Kisumu Boys High', platform: 'TikTok', viewers: 1456, status: 'live' },
        { agent: 'John Ochieng', station: 'Nyalenda Primary', platform: 'YouTube', viewers: 890, status: 'live' }
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
        { agent: 'Peter Kariuki', station: 'Nakuru Town Primary', platform: 'TikTok', viewers: 1123, status: 'live' },
        { agent: 'Mary Wanjiru', station: 'Bahati Secondary', platform: 'YouTube', viewers: 789, status: 'live' }
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
        { agent: 'Samuel Kamau', station: 'Kiambu Town Primary', platform: 'TikTok', viewers: 1567, status: 'live' },
        { agent: 'Lucy Wangui', station: 'Thika Secondary', platform: 'YouTube', viewers: 923, status: 'live' }
      ]
    },
    {
      county: 'Uasin Gishu',
      code: 'UGU',
      activeStreams: 68,
      totalAgents: 145,
      reporting: 85,
      leadingParty: 'UDA',
      viewers: 29834,
      streams: [
        { agent: 'William Ruto Jr', station: 'Eldoret Town Primary', platform: 'TikTok', viewers: 1345, status: 'live' },
        { agent: 'Cheptoo Janet', station: 'Moi Avenue Primary', platform: 'YouTube', viewers: 678, status: 'live' }
      ]
    },
    {
      county: 'Kakamega',
      code: 'KKG',
      activeStreams: 71,
      totalAgents: 142,
      reporting: 89,
      leadingParty: 'ODM',
      viewers: 31234,
      streams: [
        { agent: 'Michael Lusaka', station: 'Kakamega Town Primary', platform: 'TikTok', viewers: 1234, status: 'live' },
        { agent: 'Grace Nabwire', station: 'Shinyalu Secondary', platform: 'YouTube', viewers: 789, status: 'live' }
      ]
    },
    {
      county: 'Kilifi',
      code: 'KLF',
      activeStreams: 54,
      totalAgents: 123,
      reporting: 82,
      leadingParty: 'ODM',
      viewers: 23456,
      streams: [
        { agent: 'Hassan Baya', station: 'Kilifi Town Primary', platform: 'TikTok', viewers: 890, status: 'live' },
        { agent: 'Aisha Mwajuma', station: 'Malindi Secondary', platform: 'YouTube', viewers: 567, status: 'live' }
      ]
    },
    {
      county: 'Machakos',
      code: 'MKS',
      activeStreams: 63,
      totalAgents: 134,
      reporting: 86,
      leadingParty: 'WDM-K',
      viewers: 27890,
      streams: [
        { agent: 'Mutua Kalonzo', station: 'Machakos Town Primary', platform: 'TikTok', viewers: 987, status: 'live' },
        { agent: 'Joyce Mwende', station: 'Kathiani Secondary', platform: 'YouTube', viewers: 654, status: 'live' }
      ]
    },
    {
      county: 'Meru',
      code: 'MRU',
      activeStreams: 58,
      totalAgents: 128,
      reporting: 84,
      leadingParty: 'UDA',
      viewers: 25678,
      streams: [
        { agent: 'Kiraitu Murungi', station: 'Meru Town Primary', platform: 'TikTok', viewers: 876, status: 'live' },
        { agent: 'Miriam Kinya', station: 'Nkubu Secondary', platform: 'YouTube', viewers: 543, status: 'live' }
      ]
    }
  ], [])

  useEffect(() => {
    setCountyStreams(mockCountyData)
  }, [mockCountyData])

  const getCountyColor = (county: CountyStream) => {
    if (county.activeStreams === 0) return 'bg-kura-text-faint'
    if (county.activeStreams < 50) return 'bg-kura-amber'
    if (county.activeStreams < 100) return 'bg-kura-blue'
    return 'bg-kura-green'
  }

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'UDA': return 'text-kura-green'
      case 'ODM': return 'text-kura-blue'
      case 'WDM-K': return 'text-kura-amber'
      default: return 'text-kura-muted'
    }
  }

  const totalStreams = countyStreams.reduce((sum, county) => sum + county.activeStreams, 0)
  const totalViewers = countyStreams.reduce((sum, county) => sum + county.viewers, 0)

  return (
    <div className="space-y-4">
      {/* Interactive Kenya Map */}
      <div className="data-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading">Live Streaming Map</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-kura-green rounded-full"></div>
              <span className="faint-text">Results Declared</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-kura-red rounded-full"></div>
              <span className="faint-text">Currently Live</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-kura-blue rounded-full"></div>
              <span className="faint-text">Has Stream</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-kura-text-faint rounded-full"></div>
              <span className="faint-text">Dark Station</span>
            </div>
          </div>
        </div>

        {/* SVG Kenya Map with Interactive Counties */}
        <div className="relative bg-kura-bg rounded-lg p-4 h-96 overflow-hidden border border-kura-border">
          <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
            {countyStreams.map((county) => (
              <button
                key={county.code}
                onClick={() => setSelectedCounty(county.county === selectedCounty ? null : county.county)}
                onMouseEnter={() => setHoveredCounty(county.county)}
                onMouseLeave={() => setHoveredCounty(null)}
                className={`
                  relative p-3 rounded text-xs font-medium transition-all transform hover:scale-105
                  ${getCountyColor(county)} hover:opacity-90
                  ${selectedCounty === county.county ? 'ring-2 ring-kura-green' : ''}
                `}
              >
                <div className="text-kura-text font-bold">{county.code}</div>
                {county.activeStreams > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-kura-red rounded-full live-pulse"></div>
                )}
                
                {/* Hover tooltip */}
                {hoveredCounty === county.county && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 data-card z-10 whitespace-nowrap">
                    <div className="item-title">{county.county}</div>
                    <div className="faint-text">{county.activeStreams} streams</div>
                    <div className="faint-text">{county.viewers.toLocaleString()} viewers</div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 faint-text">
            Interactive Kenya County Map
          </div>
        </div>
      </div>

      {/* County Details */}
      {selectedCounty && (() => {
        const county = countyStreams.find(c => c.county === selectedCounty)
        if (!county) return null
        
        return (
          <div className="data-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-heading">{county.county}</h3>
              <button
                onClick={() => setSelectedCounty(null)}
                className="text-kura-muted hover:text-kura-text text-sm"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="stat-value text-kura-red">{county.activeStreams}</div>
                <div className="stat-label">Active Streams</div>
              </div>
              <div className="text-center">
                <div className="stat-value">{county.reporting}%</div>
                <div className="stat-label">Reporting</div>
              </div>
              <div className="text-center">
                <div className="stat-value text-kura-green">{county.viewers.toLocaleString()}</div>
                <div className="stat-label">Total Viewers</div>
              </div>
              <div className="text-center">
                <div className={`item-title ${getPartyColor(county.leadingParty)}`}>
                  {county.leadingParty}
                </div>
                <div className="stat-label">Leading Party</div>
              </div>
            </div>

            {/* Active Streams */}
            <div className="space-y-2">
              <h4 className="section-heading mb-2">Active Streams</h4>
              {county.streams.map((stream, index) => (
                <div key={index} className="data-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StreamStatusDot status="live" />
                      <div>
                        <div className="item-title">{stream.agent}</div>
                        <div className="faint-text">{stream.station} • {stream.platform}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-kura-muted" />
                      <span className="body-text">{stream.viewers.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* National Summary */}
      <div className="data-card">
        <h3 className="section-heading mb-4">National Streaming Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="stat-value text-kura-red">{totalStreams}</div>
            <div className="stat-label">Total Streams</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-kura-green">{totalViewers.toLocaleString()}</div>
            <div className="stat-label">Total Viewers</div>
          </div>
          <div className="text-center">
            <div className="stat-value">{countyStreams.length}</div>
            <div className="stat-label">Active Counties</div>
          </div>
        </div>
      </div>
    </div>
  )
}
