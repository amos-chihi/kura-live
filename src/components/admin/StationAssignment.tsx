'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Search, Filter, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent, PollingStation } from '@/lib/types'

interface StationAssignmentProps {
  onAssignmentChange?: (agentId: string, stationCode: string | null) => void
}

export default function StationAssignment({ onAssignmentChange }: StationAssignmentProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stations, setStations] = useState<PollingStation[]>([])
  const [unassignedAgents, setUnassignedAgents] = useState<Agent[]>([])
  const [assignedAgents, setAssignedAgents] = useState<Agent[]>([])
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    // Mock data
    const mockAgents: Agent[] = Array.from({ length: 50 }, (_, i) => ({
      id: `agent-${i}`,
      user_id: `user-${i}`,
      agent_id: `AG-${String(i + 1).padStart(4, '0')}`,
      full_name: `Agent ${i + 1}`,
      station_code: i < 30 ? `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}` : null,
      tiktok_url: Math.random() > 0.5 ? `https://www.tiktok.com/@agent${i}` : null,
      youtube_url: Math.random() > 0.5 ? `https://www.youtube.com/channel/abc${i}` : null,
      platform_url: Math.random() > 0.7 ? `https://platform.example.com/agent${i}` : null,
      status: 'active',
      phone: `+2547${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `agent${i + 1}@example.com`,
      verification_status: 'fully_verified',
      created_at: new Date().toISOString()
    }))

    const mockStations: PollingStation[] = Array.from({ length: 100 }, (_, i) => ({
      station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
      station_name: `Station ${i + 1}`,
      constituency: `Constituency ${Math.floor(i / 10) + 1}`,
      county: `County ${Math.floor(i / 20) + 1}`,
      ward: `Ward ${Math.floor(i / 5) + 1}`,
      gps_lat: -1.2921 + (Math.random() - 0.5) * 4,
      gps_lng: 36.8219 + (Math.random() - 0.5) * 4,
      registered_voters: Math.floor(Math.random() * 1000) + 200
    }))

    setAgents(mockAgents)
    setStations(mockStations)
    
    // Separate assigned and unassigned agents
    const unassigned = mockAgents.filter(agent => !agent.station_code)
    const assigned = mockAgents.filter(agent => agent.station_code)
    
    setUnassignedAgents(unassigned)
    setAssignedAgents(assigned)
    setLoading(false)
  }, [])

  const handleAssignAgent = async (agentId: string, stationCode: string) => {
    setAssigning(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update agent assignment
      setAgents(prev => prev.map(agent =>
        agent.id === agentId ? { ...agent, station_code: stationCode } : agent
      ))
      
      // Move agent from unassigned to assigned
      const agent = unassignedAgents.find(a => a.id === agentId)
      if (agent) {
        setUnassignedAgents(prev => prev.filter(a => a.id !== agentId))
        setAssignedAgents(prev => [...prev, { ...agent, station_code: stationCode }])
      }
      
      onAssignmentChange?.(agentId, stationCode)
    } catch (error) {
      console.error('Failed to assign agent:', error)
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassignAgent = async (agentId: string) => {
    setAssigning(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update agent assignment
      setAgents(prev => prev.map(agent =>
        agent.id === agentId ? { ...agent, station_code: null } : agent
      ))
      
      // Move agent from assigned to unassigned
      const agent = assignedAgents.find(a => a.id === agentId)
      if (agent) {
        setAssignedAgents(prev => prev.filter(a => a.id !== agentId))
        setUnassignedAgents(prev => [...prev, { ...agent, station_code: null }])
      }
      
      onAssignmentChange?.(agentId, null)
    } catch (error) {
      console.error('Failed to unassign agent:', error)
    } finally {
      setAssigning(false)
    }
  }

  const getStationAgents = (stationCode: string) => {
    return assignedAgents.filter(agent => agent.station_code === stationCode)
  }

  const getUnassignedAgentsFiltered = () => {
    return unassignedAgents.filter(agent =>
      agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agent_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const stats = {
    totalStations: stations.length,
    assignedStations: new Set(assignedAgents.map(a => a.station_code)).size,
    totalAgents: agents.length,
    assignedAgents: assignedAgents.length,
    unassignedAgents: unassignedAgents.length,
    coveragePercentage: Math.round((new Set(assignedAgents.map(a => a.station_code)).size / stations.length) * 100)
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
      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.totalStations}</span>
          </div>
          <div className="text-sm text-gray-400">Total Stations</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.assignedStations}</span>
          </div>
          <div className="text-sm text-gray-400">Assigned Stations</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalAgents}</span>
          </div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.assignedAgents}</span>
          </div>
          <div className="text-sm text-gray-400">Assigned Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.unassignedAgents}</span>
          </div>
          <div className="text-sm text-gray-400">Unassigned Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.coveragePercentage}%</span>
          </div>
          <div className="text-sm text-gray-400">Coverage</div>
        </div>
      </div>

      {/* Station Selection */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Station Assignment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station List */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Select Station</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stations.map((station) => {
                const stationAgents = getStationAgents(station.station_code)
                const isSelected = selectedStation?.station_code === station.station_code
                
                return (
                  <motion.div
                    key={station.station_code}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStation(station)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-kura-accent/20 border-kura-accent' 
                        : 'bg-kura-navy border-kura-border hover:bg-kura-navy/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{station.station_name}</div>
                        <div className="text-sm text-gray-400">{station.station_code}</div>
                        <div className="text-xs text-gray-500">
                          {station.constituency}, {station.county}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">{stationAgents.length}</div>
                        <div className="text-xs text-gray-400">agents</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Station Details and Agents */}
          <div>
            {selectedStation ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  {selectedStation.station_name}
                </h3>
                
                <div className="bg-kura-navy rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Station Code:</span>
                      <span className="text-white ml-2">{selectedStation.station_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Registered Voters:</span>
                      <span className="text-white ml-2">{selectedStation.registered_voters}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Constituency:</span>
                      <span className="text-white ml-2">{selectedStation.constituency}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">County:</span>
                      <span className="text-white ml-2">{selectedStation.county}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Assigned Agents ({getStationAgents(selectedStation.station_code).length})</h4>
                  {getStationAgents(selectedStation.station_code).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-kura-navy rounded-lg">
                      <div>
                        <div className="text-white">{agent.full_name}</div>
                        <div className="text-sm text-gray-400">{agent.agent_id}</div>
                      </div>
                      <button
                        onClick={() => handleUnassignAgent(agent.id)}
                        disabled={assigning}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded disabled:opacity-50"
                      >
                        Unassign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Select a station to view details and assign agents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unassigned Agents */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Unassigned Agents ({unassignedAgents.length})</h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-kura-accent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getUnassignedAgentsFiltered().map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-kura-navy rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{agent.full_name}</div>
                  <div className="text-sm text-gray-400">{agent.agent_id}</div>
                </div>
                <Badge variant="default" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  Unassigned
                </Badge>
              </div>
              
              <div className="text-sm text-gray-400 mb-3">
                {agent.phone} • {agent.email}
              </div>
              
              {selectedStation && (
                <button
                  onClick={() => handleAssignAgent(agent.id, selectedStation.station_code)}
                  disabled={assigning}
                  className="w-full px-3 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white text-sm rounded disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : `Assign to ${selectedStation.station_name}`}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bulk Assignment */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Bulk Assignment</h3>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Auto-assign Nearest Agents
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            Assign by County
          </button>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
            Random Assignment
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Clear All Assignments
          </button>
        </div>
      </div>
    </div>
  )
}
