'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MapIcon, Filter } from 'lucide-react'
import { PollingStation, LiveStream } from '@/lib/types'
import { KENYAN_COUNTIES } from '@/lib/kenyanData'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayerComponent = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarkerComponent = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const PopupComponent = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface StationWithStreams extends PollingStation {
  streams: LiveStream[]
  isLive: boolean
  stream_count: number
  results_declared: boolean
}

type FilterType = 'all' | 'live' | 'declared' | 'dark'

export default function MapViewPage() {
  const [stations, setStations] = useState<StationWithStreams[]>([])
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockStations: PollingStation[] = Array.from({ length: 100 }, (_, i) => {
      const county = KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)]
      return {
        station_code: `KE-${String(i + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        station_name: `${county} Station ${i + 1}`,
        constituency: `${county} Constituency ${Math.floor(i / 10) + 1}`,
        county: county,
        ward: `${county} Ward ${Math.floor(i / 5) + 1}`,
        gps_lat: -1.2921 + (Math.random() - 0.5) * 4, // Kenya coordinates
        gps_lng: 36.8219 + (Math.random() - 0.5) * 4,
        registered_voters: Math.floor(Math.random() * 1000) + 200
      }
    })

    const mockStreams: LiveStream[] = Array.from({ length: 50 }, (_, i) => ({
      id: `stream-${i}`,
      agent_id: `agent-${Math.floor(Math.random() * 50)}`,
      station_code: mockStations[Math.floor(Math.random() * mockStations.length)]?.station_code || null,
      tiktok_url: Math.random() > 0.5 ? `https://www.tiktok.com/@user${i}/live` : null,
      youtube_url: Math.random() > 0.5 ? `https://www.youtube.com/watch?v=abc${i}` : null,
      platform_url: Math.random() > 0.7 ? `https://platform.example.com/stream/${i}` : null,
      status: Math.random() > 0.7 ? 'live' : Math.random() > 0.5 ? 'scheduled' : 'ended',
      start_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      end_time: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : null,
      viewer_count: Math.floor(Math.random() * 5000),
      created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }))

    // Build stream map and process stations
    const streamMap = mockStreams.reduce((acc, stream) => {
      if (stream.station_code) {
        if (!acc[stream.station_code]) acc[stream.station_code] = []
        acc[stream.station_code].push(stream)
      }
      return acc
    }, {} as Record<string, LiveStream[]>)

    const processedStations = mockStations
      .filter(station => station.gps_lat && station.gps_lng) // Only stations with GPS
      .map(station => {
        const stationStreams = streamMap[station.station_code] || []
        const isLive = stationStreams.some(s => s.status === 'live')
        const results_declared = Math.random() > 0.6 // Mock results status
        
        return {
          ...station,
          streams: stationStreams,
          isLive,
          stream_count: stationStreams.length,
          results_declared
        }
      })

    setStations(processedStations)
    setStreams(mockStreams)
    setLoading(false)
  }, [])

  const filteredStations = useMemo(() => {
    switch (filter) {
      case 'live':
        return stations.filter(s => s.isLive)
      case 'declared':
        return stations.filter(s => s.results_declared)
      case 'dark':
        return stations.filter(s => !s.isLive && !s.results_declared)
      default:
        return stations
    }
  }, [stations, filter])

  const getStationColor = (station: StationWithStreams) => {
    if (station.results_declared) return '#00D26A'
    if (station.isLive) return '#FF3B3B'
    if (station.stream_count > 0) return '#3B82F6'
    return '#52525B'
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-kura-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <MapIcon className="w-6 h-6 text-[#06B6D4]" />
            <h1 className="text-2xl font-bold text-white">Station Map</h1>
          </div>
          <p className="text-xs text-[#52525B]">
            {stations.length} stations with GPS data
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="w-40 bg-[#111114] border border-[#1E1E24] text-white text-xs h-9 rounded-lg pl-3 pr-8 appearance-none cursor-pointer"
            >
              <option value="all">All Stations</option>
              <option value="live">Live Streaming</option>
              <option value="declared">Results Declared</option>
              <option value="dark">Dark Stations</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#52525B] pointer-events-none" />
          </div>
        </div>

        {/* Legend Strip */}
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B]"></div>
            <span className="text-[10px] text-[#71717A]">Live</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A]"></div>
            <span className="text-[10px] text-[#71717A]">Declared</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
            <span className="text-[10px] text-[#71717A]">Has Stream</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#52525B]"></div>
            <span className="text-[10px] text-[#71717A]">Pending</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="rounded-xl border border-[#1E1E24] overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-kura-card">
              <div className="text-kura-text">Loading stations...</div>
            </div>
          ) : (
            <MapContainer
              center={[0.0236, 37.9062]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayerComponent
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {filteredStations.map((station) => (
                <CircleMarkerComponent
                  key={station.station_code}
                  center={[station.gps_lat!, station.gps_lng!]}
                  radius={5}
                  fillColor={getStationColor(station)}
                  fillOpacity={0.8}
                  stroke={false}
                >
                  <PopupComponent>
                    <div className="text-xs space-y-1 min-w-[180px]">
                      <div className="font-bold text-sm">{station.station_name}</div>
                      <div className="text-gray-500">{station.station_code}</div>
                      <div>{station.ward}, {station.constituency}</div>
                      <div>{station.county}</div>
                      <div>Registered Voters: {formatNumber(station.registered_voters)}</div>
                      <div className="font-medium">
                        {station.isLive && <span className="text-red-500">🔴 LIVE NOW</span>}
                        {station.results_declared && <span className="text-green-500">✅ Results Declared</span>}
                        {!station.isLive && !station.results_declared && <span>Pending</span>}
                      </div>
                      {station.stream_count > 0 && (
                        <div className="text-[10px] text-[#71717A]">
                          {station.stream_count} stream(s) available
                        </div>
                      )}
                    </div>
                  </PopupComponent>
                </CircleMarkerComponent>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  )
}
