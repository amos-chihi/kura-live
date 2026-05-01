import { create } from 'zustand'
import { generateKenyanName, KENYAN_COUNTIES, KENYAN_POLITICAL_PARTIES } from '@/lib/kenyanData'

// Mock real-time data interfaces
export interface StationData {
  id: string
  station_code: string
  station_name: string
  constituency: string
  county: string
  status: 'online' | 'offline' | 'reporting'
  votes_reported: number
  turnout: number
  has_stream: boolean
  coordinates: { lat: number; lng: number }
  last_update: string
}

export interface StreamData {
  id: string
  station_code: string
  platform: 'youtube' | 'tiktok' | 'custom'
  url: string
  status: 'live' | 'offline' | 'scheduled'
  viewers: number
  signal_quality: number
  latency: number
  agent_name: string
}

export interface TallyData {
  id: string
  candidate_name: string
  party: string
  votes: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  stations_reporting: number
}

export interface IncidentData {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'security' | 'logistics' | 'technical' | 'irregularity'
  location: string
  description: string
  status: 'open' | 'investigating' | 'resolved'
  assigned_agent: string
  timestamp: string
}

export interface AgentData {
  id: string
  name: string
  station_code: string
  status: 'active' | 'offline' | 'responding'
  location: string
  last_checkin: string
  battery_level: number
  signal_strength: number
}

export interface PredictiveData {
  turnout_projection: number
  winner_confidence: number
  swing_counties: string[]
  risk_areas: string[]
  anomaly_count: number
  timestamp: string
}

export interface WebSocketStore {
  // Connection state
  connected: boolean
  last_update: string
  
  // Real-time data
  stations: StationData[]
  streams: StreamData[]
  tallies: TallyData[]
  incidents: IncidentData[]
  agents: AgentData[]
  predictive: PredictiveData
  
  // Metrics
  total_stations: number
  stations_reporting: number
  active_streams: number
  total_votes: number
  turnout_rate: number
  critical_incidents: number
  
  // Actions
  connect: () => void
  disconnect: () => void
  updateData: () => void
  addIncident: (incident: Omit<IncidentData, 'id' | 'timestamp'>) => void
  resolveIncident: (id: string) => void
}

// Helper functions to generate mock data
const generateMockStations = (): StationData[] => {
  return Array.from({ length: 150 }, (_, i) => {
    const county = KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)]
    return {
      id: `station-${i}`,
      station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
      station_name: `${county} Station ${i + 1}`,
      constituency: `${county} Constituency ${Math.floor(i / 5) + 1}`,
      county: county,
      status: Math.random() > 0.8 ? 'offline' : Math.random() > 0.3 ? 'reporting' : 'online',
      votes_reported: Math.floor(Math.random() * 1000),
      turnout: Math.floor(Math.random() * 80) + 20,
      has_stream: Math.random() > 0.7,
      coordinates: {
        lat: -1.2921 + (Math.random() - 0.5) * 4,
        lng: 36.8219 + (Math.random() - 0.5) * 4
      },
      last_update: new Date().toISOString()
    }
  })
}

const generateMockStreams = (stations: StationData[]): StreamData[] => {
  return stations
    .filter(station => station.has_stream)
    .slice(0, 50)
    .map(station => ({
      id: `stream-${station.id}`,
      station_code: station.station_code,
      platform: ['youtube', 'tiktok', 'custom'][Math.floor(Math.random() * 3)] as 'youtube' | 'tiktok' | 'custom',
      url: `https://platform.example.com/stream/${station.id}`,
      status: Math.random() > 0.2 ? 'live' : 'offline' as 'live' | 'offline',
      viewers: Math.floor(Math.random() * 5000),
      signal_quality: Math.floor(Math.random() * 100),
      latency: Math.floor(Math.random() * 2000),
      agent_name: generateKenyanName()
    }))
}

const generateMockTallies = (): TallyData[] => {
  const candidates = Array.from({ length: 8 }, (_, i) => ({
    name: generateKenyanName(),
    party: KENYAN_POLITICAL_PARTIES[Math.floor(Math.random() * KENYAN_POLITICAL_PARTIES.length)]
  }))
  
  return candidates.map((candidate, i) => ({
    id: `candidate-${i}`,
    candidate_name: candidate.name,
    party: candidate.party,
    votes: Math.floor(Math.random() * 1000000) + 100000,
    percentage: 0,
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    stations_reporting: Math.floor(Math.random() * 100) + 20
  }))
}

const generateMockIncidents = (): IncidentData[] => {
  const incidentTypes = [
    { type: 'security', description: 'Security breach reported at polling station' },
    { type: 'logistics', description: 'Ballot box delivery delayed' },
    { type: 'technical', description: 'Electronic voting system malfunction' },
    { type: 'irregularity', description: 'Voting irregularity detected' }
  ]
  
  return Array.from({ length: 15 }, (_, i) => {
    const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)]
    return {
      id: `incident-${i}`,
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as IncidentData['severity'],
      type: incident.type as IncidentData['type'],
      location: KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)],
      description: incident.description,
      status: Math.random() > 0.7 ? 'resolved' : Math.random() > 0.4 ? 'investigating' : 'open' as IncidentData['status'],
      assigned_agent: generateKenyanName(),
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }
  })
}

const generateMockAgents = (stations: StationData[]): AgentData[] => {
  return stations.slice(0, 80).map(station => ({
    id: `agent-${station.id}`,
    name: generateKenyanName(),
    station_code: station.station_code,
    status: Math.random() > 0.8 ? 'offline' : Math.random() > 0.3 ? 'responding' : 'active' as AgentData['status'],
    location: station.county,
    last_checkin: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    battery_level: Math.floor(Math.random() * 100),
    signal_strength: Math.floor(Math.random() * 5) + 1
  }))
}

// Create the Zustand store
export const useWebSocketStore = create<WebSocketStore>((set, get) => {
  // Initialize mock data
  const mockStations = generateMockStations()
  const mockStreams = generateMockStreams(mockStations)
  const mockTallies = generateMockTallies()
  const mockIncidents = generateMockIncidents()
  const mockAgents = generateMockAgents(mockStations)
  
  // Calculate percentages for tallies
  const totalVotes = mockTallies.reduce((sum, tally) => sum + tally.votes, 0)
  mockTallies.forEach(tally => {
    tally.percentage = (tally.votes / totalVotes) * 100
  })

  return {
    // Connection state
    connected: false,
    last_update: new Date().toISOString(),
    
    // Initial data
    stations: mockStations,
    streams: mockStreams,
    tallies: mockTallies,
    incidents: mockIncidents,
    agents: mockAgents,
    predictive: {
      turnout_projection: 67.5,
      winner_confidence: 78.2,
      swing_counties: ['Nairobi', 'Mombasa', 'Kisumu'],
      risk_areas: ['Garissa', 'Mandera', 'Wajir'],
      anomaly_count: 3,
      timestamp: new Date().toISOString()
    },
    
    // Initial metrics
    total_stations: mockStations.length,
    stations_reporting: mockStations.filter(s => s.status === 'reporting').length,
    active_streams: mockStreams.filter(s => s.status === 'live').length,
    total_votes: totalVotes,
    turnout_rate: mockStations.reduce((sum, s) => sum + s.turnout, 0) / mockStations.length,
    critical_incidents: mockIncidents.filter(i => i.severity === 'critical').length,
    
    // Actions
    connect: () => set({ connected: true }),
    disconnect: () => set({ connected: false }),
    
    updateData: () => {
      const state = get()
      
      // Update some random stations
      const updatedStations = state.stations.map(station => {
        if (Math.random() > 0.95) {
          return {
            ...station,
            status: ['online', 'offline', 'reporting'][Math.floor(Math.random() * 3)] as StationData['status'],
            votes_reported: station.votes_reported + Math.floor(Math.random() * 100),
            turnout: Math.min(100, station.turnout + Math.random() * 5),
            last_update: new Date().toISOString()
          }
        }
        return station
      })
      
      // Update stream viewers
      const updatedStreams = state.streams.map(stream => ({
        ...stream,
        viewers: Math.max(0, stream.viewers + Math.floor(Math.random() * 200) - 100),
        signal_quality: Math.max(0, Math.min(100, stream.signal_quality + Math.floor(Math.random() * 20) - 10)),
        latency: Math.max(0, stream.latency + Math.floor(Math.random() * 500) - 250)
      }))
      
      // Update tally votes
      const updatedTallies = state.tallies.map(tally => ({
        ...tally,
        votes: tally.votes + Math.floor(Math.random() * 1000),
        trend: Math.random() > 0.7 ? ['up', 'down'][Math.floor(Math.random() * 2)] as 'up' | 'down' : tally.trend
      }))
      
      // Recalculate percentages
      const newTotalVotes = updatedTallies.reduce((sum, tally) => sum + tally.votes, 0)
      updatedTallies.forEach(tally => {
        tally.percentage = (tally.votes / newTotalVotes) * 100
      })
      
      // Update agent statuses
      const updatedAgents = state.agents.map(agent => {
        if (Math.random() > 0.9) {
          return {
            ...agent,
            status: ['active', 'offline', 'responding'][Math.floor(Math.random() * 3)] as AgentData['status'],
            battery_level: Math.max(0, agent.battery_level - Math.floor(Math.random() * 5)),
            last_checkin: new Date().toISOString()
          }
        }
        return agent
      })
      
      // Update metrics
      const newMetrics = {
        stations_reporting: updatedStations.filter(s => s.status === 'reporting').length,
        active_streams: updatedStreams.filter(s => s.status === 'live').length,
        total_votes: newTotalVotes,
        turnout_rate: updatedStations.reduce((sum, s) => sum + s.turnout, 0) / updatedStations.length,
        critical_incidents: state.incidents.filter(i => i.severity === 'critical' && i.status === 'open').length
      }
      
      set({
        stations: updatedStations,
        streams: updatedStreams,
        tallies: updatedTallies,
        agents: updatedAgents,
        last_update: new Date().toISOString(),
        ...newMetrics
      })
    },
    
    addIncident: (incident) => {
      const newIncident: IncidentData = {
        ...incident,
        id: `incident-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
      
      set(state => ({
        incidents: [newIncident, ...state.incidents],
        critical_incidents: incident.severity === 'critical' ? state.critical_incidents + 1 : state.critical_incidents
      }))
    },
    
    resolveIncident: (id) => {
      set(state => ({
        incidents: state.incidents.map(incident =>
          incident.id === id ? { ...incident, status: 'resolved' as const } : incident
        ),
        critical_incidents: state.incidents.find(i => i.id === id)?.severity === 'critical' 
          ? state.critical_incidents - 1 
          : state.critical_incidents
      }))
    }
  }
})
