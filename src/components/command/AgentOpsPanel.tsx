'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  User, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Battery, 
  Signal, 
  Clock,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function AgentOpsPanel() {
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'offline' | 'responding'>('all')
  const { agents, stations } = useWebSocketStore()

  const filteredAgents = agents.filter(agent => {
    return statusFilter === 'all' || agent.status === statusFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-kura-green bg-kura-green/20 border-kura-green/30'
      case 'responding': return 'text-kura-amber bg-kura-amber/20 border-kura-amber/30'
      case 'offline': return 'text-kura-red bg-kura-red/20 border-kura-red/30'
      default: return 'text-kura-muted bg-kura-panel2 border-kura-border'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level >= 60) return 'text-kura-green'
    if (level >= 30) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const getSignalColor = (strength: number) => {
    if (strength >= 4) return 'text-kura-green'
    if (strength >= 2) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Wifi className="w-4 h-4 text-kura-green" />
      case 'responding': return <Activity className="w-4 h-4 text-kura-amber animate-pulse" />
      case 'offline': return <WifiOff className="w-4 h-4 text-kura-red" />
      default: return <WifiOff className="w-4 h-4 text-kura-muted" />
    }
  }

  const AgentCard = ({ agent, index }: { agent: any; index: number }) => {
    const station = stations.find(s => s.station_code === agent.station_code)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="command-panel"
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-kura-blue/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-kura-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-kura-text">{agent.name}</p>
                <p className="text-xs text-kura-muted">{agent.station_code}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(agent.status)}
              <span className={`status-badge ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-3 h-3 text-kura-muted" />
            <span className="text-xs text-kura-text">{agent.location}</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className={`flex items-center justify-center space-x-1 ${getBatteryColor(agent.battery_level)}`}>
                <Battery className="w-3 h-3" />
                <span className="text-xs font-medium">{agent.battery_level}%</span>
              </div>
              <p className="text-[9px] text-kura-muted">Battery</p>
            </div>
            
            <div className="text-center">
              <div className={`flex items-center justify-center space-x-1 ${getSignalColor(agent.signal_strength)}`}>
                <Signal className="w-3 h-3" />
                <span className="text-xs font-medium">{agent.signal_strength}/5</span>
              </div>
              <p className="text-[9px] text-kura-muted">Signal</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-3 h-3 text-kura-muted" />
                <span className="text-xs font-medium text-kura-text">
                  {Math.floor((Date.now() - new Date(agent.last_checkin).getTime()) / 60000)}m
                </span>
              </div>
              <p className="text-[9px] text-kura-muted">Last Check-in</p>
            </div>
          </div>

          {/* Station Info */}
          {station && (
            <div className="bg-kura-panel2 rounded-lg p-2">
              <p className="text-xs text-kura-text">{station.station_name}</p>
              <p className="text-[9px] text-kura-muted">{station.constituency}</p>
            </div>
          )}

          {/* Alert for low battery */}
          {agent.battery_level < 20 && (
            <div className="flex items-center space-x-2 mt-2 p-2 bg-kura-red/10 rounded-lg">
              <AlertTriangle className="w-3 h-3 text-kura-red" />
              <span className="text-xs text-kura-red">Low battery warning</span>
            </div>
          )}

          {/* Alert for offline */}
          {agent.status === 'offline' && (
            <div className="flex items-center space-x-2 mt-2 p-2 bg-kura-red/10 rounded-lg">
              <WifiOff className="w-3 h-3 text-kura-red" />
              <span className="text-xs text-kura-red">Agent offline</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const MapView = () => (
    <div className="command-panel h-full flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-kura-muted mx-auto mb-4" />
        <p className="text-sm text-kura-text">Agent Coverage Map</p>
        <p className="text-xs text-kura-muted mt-2">
          {filteredAgents.length} agents on map
        </p>
      </div>
    </div>
  )

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <Users className="w-5 h-5 text-kura-blue" />
            <span>Field Agents</span>
          </h2>
          <p className="text-xs text-kura-muted">
            {agents.filter(a => a.status === 'active').length} of {agents.length} active
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`ops-button text-xs ${
              viewMode === 'cards' ? 'ops-button-primary' : 'ops-button-secondary'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`ops-button text-xs ${
              viewMode === 'map' ? 'ops-button-primary' : 'ops-button-secondary'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-2 p-4 border-b border-kura-border">
        {[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'responding', label: 'Responding' },
          { value: 'offline', label: 'Offline' }
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value as any)}
            className={`ops-button text-xs ${
              statusFilter === filter.value ? 'ops-button-primary' : 'ops-button-secondary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        ) : (
          <MapView />
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-t border-kura-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-kura-green">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-kura-muted">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-amber">
              {agents.filter(a => a.status === 'responding').length}
            </div>
            <div className="text-xs text-kura-muted">Responding</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-red">
              {agents.filter(a => a.status === 'offline').length}
            </div>
            <div className="text-xs text-kura-muted">Offline</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-purple">
              {agents.filter(a => a.battery_level < 30).length}
            </div>
            <div className="text-xs text-kura-muted">Low Battery</div>
          </div>
        </div>
      </div>
    </div>
  )
}
