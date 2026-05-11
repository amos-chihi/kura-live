import { create } from 'zustand'

import type {
  CommandCentreAgent as AgentData,
  CommandCentreIncident as IncidentData,
  CommandCentrePredictive as PredictiveData,
  CommandCentreSnapshot,
  CommandCentreStation as StationData,
  CommandCentreStream as StreamData,
  CommandCentreTally as TallyData,
} from '@/lib/commandCenter'
import type { ApiResponse } from '@/lib/types'

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
  hydrate: (snapshot: CommandCentreSnapshot) => void
  addIncident: (incident: Omit<IncidentData, 'id' | 'timestamp'>) => void
  resolveIncident: (id: string) => void
}

const EMPTY_PREDICTIVE: PredictiveData = {
  turnout_projection: 0,
  winner_confidence: 0,
  swing_counties: [],
  risk_areas: [],
  anomaly_count: 0,
  timestamp: new Date().toISOString(),
}

async function fetchCommandCentreSnapshot() {
  const response = await fetch('/api/command-centre', { cache: 'no-store' })
  const payload = (await response.json()) as ApiResponse<CommandCentreSnapshot>

  if (!response.ok || payload.error || !payload.data) {
    throw new Error(payload.error ?? 'Failed to fetch command centre snapshot')
  }

  return payload.data
}

// Create the Zustand store
export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
    // Connection state
    connected: false,
    last_update: new Date().toISOString(),
    
    // Initial data
    stations: [],
    streams: [],
    tallies: [],
    incidents: [],
    agents: [],
    predictive: EMPTY_PREDICTIVE,
    
    // Initial metrics
    total_stations: 0,
    stations_reporting: 0,
    active_streams: 0,
    total_votes: 0,
    turnout_rate: 0,
    critical_incidents: 0,
    
    // Actions
    connect: () => {
      void get().updateData()
    },
    disconnect: () => set({ connected: false }),
    hydrate: (snapshot) =>
      set({
        connected: true,
        last_update: snapshot.updated_at,
        stations: snapshot.stations,
        streams: snapshot.streams,
        tallies: snapshot.tallies,
        incidents: snapshot.incidents,
        agents: snapshot.agents,
        predictive: snapshot.predictive,
        total_stations: snapshot.metrics.total_stations,
        stations_reporting: snapshot.metrics.stations_reporting,
        active_streams: snapshot.metrics.active_streams,
        total_votes: snapshot.metrics.total_votes,
        turnout_rate: snapshot.metrics.turnout_rate,
        critical_incidents: snapshot.metrics.critical_incidents,
      }),
    
    updateData: () => {
      void fetchCommandCentreSnapshot()
        .then((snapshot) => {
          get().hydrate(snapshot)
        })
        .catch(() => {
          set({ connected: false })
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
  }))
