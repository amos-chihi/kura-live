'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Map, MapPin, Filter, Layers, Activity, Wifi, WifiOff } from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

type MapMode = 'standard' | 'heat' | 'incidents' | 'security'
type StationFilter = 'all' | 'live' | 'reporting' | 'offline'

export default function LiveMapPanel() {
  const [mapMode, setMapMode] = useState<MapMode>('standard')
  const [stationFilter, setStationFilter] = useState<StationFilter>('all')
  const [selectedCounty, setSelectedCounty] = useState('all')
  const [overlayToggles, setOverlayToggles] = useState({
    turnout: true,
    incidents: true,
    streams: true,
    boundaries: true
  })
  
  const { stations, streams, incidents } = useWebSocketStore()

  // Filter stations based on selected filter
  const filteredStations = stations.filter(station => {
    switch (stationFilter) {
      case 'live':
        return station.has_stream
      case 'reporting':
        return station.status === 'reporting'
      case 'offline':
        return station.status === 'offline'
      default:
        return true
    }
  })

  // Get station color based on status and mode
  const getStationColor = (station: any) => {
    if (mapMode === 'incidents') {
      const hasIncident = incidents.some(inc => inc.location === station.county && inc.status === 'open')
      return hasIncident ? '#FF4D4F' : '#00D26A'
    }
    
    if (mapMode === 'security') {
      const criticalIncidents = incidents.filter(inc => inc.location === station.county && inc.severity === 'critical')
      if (criticalIncidents.length > 0) return '#FF4D4F'
      if (incidents.some(inc => inc.location === station.county)) return '#F5B942'
      return '#00D26A'
    }
    
    if (mapMode === 'heat') {
      // Color based on turnout intensity
      if (station.turnout > 70) return '#FF4D4F'
      if (station.turnout > 50) return '#F5B942'
      return '#00D26A'
    }
    
    // Standard mode
    if (station.status === 'reporting') return '#00D26A'
    if (station.has_stream) return '#3B82F6'
    if (station.status === 'offline') return '#52525B'
    return '#F5B942'
  }

  const counties = ['all', ...Array.from(new Set(stations.map(s => s.county)))]

  if (typeof window === 'undefined') {
    return (
      <div className="command-panel h-full flex items-center justify-center">
        <div className="text-kura-muted">Loading election map...</div>
      </div>
    )
  }

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <Map className="w-5 h-5 text-kura-green" />
            <span>Station Map</span>
          </h2>
          <p className="text-xs text-kura-muted">GPS monitored stations</p>
        </div>
        
        {/* Map Mode Selector */}
        <div className="flex space-x-2">
          {(['standard', 'heat', 'incidents', 'security'] as MapMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`ops-button text-xs capitalize ${
                mapMode === mode ? 'ops-button-primary' : 'ops-button-secondary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div className="flex items-center space-x-4">
          {/* County Filter */}
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="bg-kura-panel2 border border-kura-border text-kura-text text-xs px-3 py-2 rounded-lg"
          >
            <option value="all">All Counties</option>
            {counties.slice(1, 11).map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>

          {/* Station Status Filter */}
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value as StationFilter)}
            className="bg-kura-panel2 border border-kura-border text-kura-text text-xs px-3 py-2 rounded-lg"
          >
            <option value="all">All Stations</option>
            <option value="live">Live Streams</option>
            <option value="reporting">Reporting</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Overlay Toggles */}
        <div className="flex items-center space-x-3">
          <Layers className="w-4 h-4 text-kura-muted" />
          {Object.entries(overlayToggles).map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => setOverlayToggles(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                enabled 
                  ? 'bg-kura-green/20 text-kura-green border-kura-green/30' 
                  : 'bg-kura-panel2 text-kura-muted border-kura-border'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 px-4 py-2 border-b border-kura-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-kura-green rounded-full"></div>
          <span className="text-xs text-kura-muted">Declared</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-kura-blue rounded-full"></div>
          <span className="text-xs text-kura-muted">Has Stream</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-kura-amber rounded-full"></div>
          <span className="text-xs text-kura-muted">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-kura-red rounded-full animate-pulse"></div>
          <span className="text-xs text-kura-muted">Live</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[0.0236, 37.9062]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-2xl"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredStations
            .filter(station => selectedCounty === 'all' || station.county === selectedCounty)
            .map((station) => (
              <CircleMarker
                key={station.id}
                center={[station.coordinates.lat, station.coordinates.lng]}
                radius={6}
                fillColor={getStationColor(station)}
                fillOpacity={0.8}
                stroke={false}
                className={station.has_stream ? 'animate-pulse' : ''}
              >
                <Popup>
                  <div className="bg-kura-panel border border-kura-border rounded-lg p-3 min-w-[200px]">
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-semibold text-kura-text">{station.station_name}</h3>
                        <p className="text-xs text-kura-muted">{station.station_code}</p>
                      </div>
                      
                      <div className="text-xs text-kura-muted space-y-1">
                        <p>{station.constituency}</p>
                        <p>{station.county}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-kura-muted">Votes:</span>
                        <span className="text-sm font-medium text-kura-text">{station.votes_reported.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-kura-muted">Turnout:</span>
                        <span className="text-sm font-medium text-kura-green">{station.turnout}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-kura-muted">Status:</span>
                        <div className="flex items-center space-x-1">
                          {station.has_stream ? (
                            <>
                              <Wifi className="w-3 h-3 text-kura-green" />
                              <span className="text-xs text-kura-green">Live Stream</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3 h-3 text-kura-muted" />
                              <span className="text-xs text-kura-muted">No Stream</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {station.has_stream && (
                        <button className="w-full ops-button-primary text-xs mt-2">
                          Open Stream
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>

        {/* Map Statistics Overlay */}
        <div className="absolute top-4 right-4 bg-kura-panel/90 backdrop-blur-xs border border-kura-border rounded-lg p-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-kura-muted">Stations:</span>
              <span className="text-kura-text font-medium">{filteredStations.length}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-kura-muted">Live:</span>
              <span className="text-kura-green font-medium">
                {filteredStations.filter(s => s.has_stream).length}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-kura-muted">Reporting:</span>
              <span className="text-kura-text font-medium">
                {filteredStations.filter(s => s.status === 'reporting').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
