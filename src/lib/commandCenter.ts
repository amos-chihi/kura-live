import { DEMO_AGENTS, DEMO_CANDIDATES, DEMO_STATIONS } from '@/lib/demo-data'
import type { Alert } from '@/lib/types'
import { buildComparisonRows, getVerificationState } from '@/lib/verificationDemo'

export interface CommandCentreStation {
  id: string
  station_code: string
  station_name: string
  constituency: string
  county: string
  ward: string
  status: 'online' | 'offline' | 'reporting'
  votes_reported: number
  turnout: number
  has_stream: boolean
  has_results: boolean
  verification_status: 'verified' | 'discrepancy' | 'pending'
  coordinates: {
    lat: number
    lng: number
  }
  last_update: string
  open_alerts: number
}

export interface CommandCentreStream {
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

export interface CommandCentreTally {
  id: string
  candidate_name: string
  party: string
  votes: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  stations_reporting: number
}

export interface CommandCentreIncident {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'security' | 'logistics' | 'technical' | 'irregularity'
  location: string
  description: string
  status: 'open' | 'investigating' | 'resolved'
  assigned_agent: string
  timestamp: string
}

export interface CommandCentreAgent {
  id: string
  name: string
  station_code: string
  status: 'active' | 'offline' | 'responding'
  location: string
  last_checkin: string
  battery_level: number
  signal_strength: number
}

export interface CommandCentrePredictive {
  turnout_projection: number
  winner_confidence: number
  swing_counties: string[]
  risk_areas: string[]
  anomaly_count: number
  timestamp: string
}

export interface CommandCentreMetrics {
  total_stations: number
  stations_reporting: number
  active_streams: number
  total_votes: number
  turnout_rate: number
  critical_incidents: number
}

export interface CommandCentreSnapshot {
  stations: CommandCentreStation[]
  streams: CommandCentreStream[]
  tallies: CommandCentreTally[]
  incidents: CommandCentreIncident[]
  agents: CommandCentreAgent[]
  predictive: CommandCentrePredictive
  metrics: CommandCentreMetrics
  updated_at: string
}

function getCandidateParty(candidateName: string) {
  return DEMO_CANDIDATES.find((candidate) => candidate.candidate_name === candidateName)?.party ?? 'Independent'
}

function buildStreams(state: Awaited<ReturnType<typeof getVerificationState>>) {
  if (state.live_sessions.length > 0) {
    return state.live_sessions.map<CommandCentreStream>((session, index) => {
      const agent = DEMO_AGENTS.find((entry) => entry.id === session.agent_id)
      return {
        id: session.id,
        station_code: session.station_code,
        platform:
          session.platform === 'rtmp' || session.platform === 'browser' || session.platform === 'microphone'
            ? 'custom'
            : session.platform,
        url: session.source_url,
        status:
          session.status === 'monitoring'
            ? 'live'
            : session.status === 'reconnecting'
              ? 'scheduled'
              : session.status === 'ended'
                ? 'offline'
                : 'scheduled',
        viewers: session.viewer_count || 160 + index * 35,
        signal_quality: session.health === 'offline' ? 0 : session.health === 'degraded' ? 58 : 88,
        latency: session.latency_ms || 700 + index * 80,
        agent_name: agent?.full_name ?? `Agent ${index + 1}`,
      }
    })
  }

  return DEMO_AGENTS.map<CommandCentreStream>((agent, index) => {
    const platform = index % 3 === 0 ? 'tiktok' : index % 3 === 1 ? 'youtube' : 'custom'
    const url =
      platform === 'tiktok'
        ? agent.tiktok_url ?? agent.platform_url ?? ''
        : platform === 'youtube'
          ? agent.youtube_url ?? agent.platform_url ?? ''
          : agent.platform_url ?? agent.youtube_url ?? ''

    const status: CommandCentreStream['status'] = index < 3 ? 'live' : index < 7 ? 'scheduled' : 'offline'

    return {
      id: `command-stream-${agent.id}`,
      station_code: agent.station_code ?? `UNASSIGNED-${index + 1}`,
      platform,
      url,
      status,
      viewers: status === 'live' ? 180 + index * 47 : status === 'scheduled' ? 24 + index * 7 : 0,
      signal_quality: status === 'offline' ? 0 : 74 + (index % 5) * 5,
      latency: status === 'live' ? 640 + index * 90 : 0,
      agent_name: agent.full_name,
    }
  })
}

function buildStationAlerts(alerts: Alert[]) {
  return alerts.reduce<Record<string, Alert[]>>((accumulator, alert) => {
    if (!alert.station_code) {
      return accumulator
    }

    const current = accumulator[alert.station_code] ?? []
    current.push(alert)
    accumulator[alert.station_code] = current
    return accumulator
  }, {})
}

function buildTallies(reportingStations: CommandCentreStation[]) {
  const reportingCount = Math.max(reportingStations.length, 1)

  const tallies = DEMO_CANDIDATES.map<CommandCentreTally>((candidate, index) => {
    const votes = reportingStations.reduce((sum, station, stationIndex) => {
      const multiplier = 1 + stationIndex * 0.035
      return sum + Math.round(candidate.iebc_votes * multiplier)
    }, 0)

    return {
      id: `national-${candidate.candidate_name.toLowerCase().replace(/\s+/g, '-')}`,
      candidate_name: candidate.candidate_name,
      party: candidate.party,
      votes,
      percentage: 0,
      trend: index === 0 ? 'up' : index === 1 ? 'stable' : index === 2 ? 'up' : 'down',
      stations_reporting: reportingCount,
    }
  }).sort((left, right) => right.votes - left.votes)

  const totalVotes = tallies.reduce((sum, tally) => sum + tally.votes, 0)
  return tallies.map((tally) => ({
    ...tally,
    percentage: totalVotes > 0 ? (tally.votes / totalVotes) * 100 : 0,
  }))
}

function buildIncidents(alerts: Alert[], stations: CommandCentreStation[]) {
  const fromAlerts = alerts.map<CommandCentreIncident>((alert, index) => ({
    id: `incident-alert-${alert.id}`,
    severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'low',
    type: 'irregularity',
    location: alert.station_code ?? 'Unknown station',
    description: `${alert.candidate_name} has a ${alert.delta}-vote discrepancy across verification sources.`,
    status: alert.alert_status === 'dismissed' ? 'resolved' : alert.alert_status === 'escalated' ? 'investigating' : 'open',
    assigned_agent: DEMO_AGENTS[index % DEMO_AGENTS.length]?.full_name ?? 'Ops Desk',
    timestamp: alert.created_at,
  }))

  const offlineStations = stations.filter((station) => station.status === 'offline').slice(0, 2)
  const technicalIncidents = offlineStations.map<CommandCentreIncident>((station, index) => ({
    id: `incident-offline-${station.station_code}`,
    severity: 'medium',
    type: 'technical',
    location: station.station_name,
    description: `Field signal dropped at ${station.station_name}; stream health degraded and awaiting agent check-in.`,
    status: 'investigating',
    assigned_agent: DEMO_AGENTS[(index + 2) % DEMO_AGENTS.length]?.full_name ?? 'Field Ops',
    timestamp: station.last_update,
  }))

  return [...fromAlerts, ...technicalIncidents].sort((left, right) => right.timestamp.localeCompare(left.timestamp))
}

function buildAgents(stations: CommandCentreStation[]) {
  const stationLookup = new Map(stations.map((station) => [station.station_code, station]))

  return DEMO_AGENTS.map<CommandCentreAgent>((agent, index) => {
    const station = agent.station_code ? stationLookup.get(agent.station_code) : null

    return {
      id: agent.id,
      name: agent.full_name,
      station_code: agent.station_code ?? 'UNASSIGNED',
      status: station?.status === 'offline' ? 'offline' : station?.verification_status === 'discrepancy' ? 'responding' : 'active',
      location: station?.county ?? 'Nairobi',
      last_checkin: new Date(Date.now() - index * 11 * 60 * 1000).toISOString(),
      battery_level: Math.max(42, 96 - index * 7),
      signal_strength: Math.max(2, 5 - (index % 3)),
    }
  })
}

export async function buildCommandCentreSnapshot(): Promise<CommandCentreSnapshot> {
  const state = await getVerificationState()
  const updatedAt = new Date().toISOString()
  const streams = buildStreams(state)
  const streamLookup = new Map(streams.map((stream) => [stream.station_code, stream]))
  const alertLookup = buildStationAlerts(state.alerts)

  const sampleStationRows = buildComparisonRows(state.tally_entries)
  const sampleStationVotes = sampleStationRows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.station_code] = Math.max(accumulator[row.station_code] ?? 0, row.audio_votes ?? row.form34a_votes ?? row.iebc_votes ?? 0)
    return accumulator
  }, {})

  const stations = DEMO_STATIONS.map<CommandCentreStation>((station, index) => {
    const stationAlerts = alertLookup[station.station_code] ?? []
    const hasResults = station.station_code in sampleStationVotes || index < 6
    const hasStream = streamLookup.has(station.station_code)
    const status: CommandCentreStation['status'] =
      index === 0 || index === 1 || index === 4 || index === 5 ? 'reporting' : index === 8 ? 'offline' : 'online'

    return {
      id: `command-station-${station.station_code}`,
      station_code: station.station_code,
      station_name: station.station_name,
      constituency: station.constituency,
      county: station.county,
      ward: station.ward,
      status,
      votes_reported:
        sampleStationVotes[station.station_code] ??
        (hasResults ? 240 + index * 18 : 0),
      turnout: hasResults ? Math.min(94, 58 + index * 3.4) : 0,
      has_stream: hasStream,
      has_results: hasResults,
      verification_status: stationAlerts.length > 0 ? 'discrepancy' : hasResults ? 'verified' : 'pending',
      coordinates: {
        lat: station.gps_lat ?? -1.2921,
        lng: station.gps_lng ?? 36.8219,
      },
      last_update: new Date(Date.now() - index * 7 * 60 * 1000).toISOString(),
      open_alerts: stationAlerts.filter((alert) => alert.alert_status === 'open').length,
    }
  })

  const reportingStations = stations.filter((station) => station.status === 'reporting' || station.has_results)
  const tallies = buildTallies(reportingStations)
  const incidents = buildIncidents(state.alerts, stations)
  const agents = buildAgents(stations)
  const totalVotes = tallies.reduce((sum, tally) => sum + tally.votes, 0)
  const turnoutRate =
    reportingStations.length > 0
      ? reportingStations.reduce((sum, station) => sum + station.turnout, 0) / reportingStations.length
      : 0

  return {
    stations,
    streams,
    tallies,
    incidents,
    agents,
    predictive: {
      turnout_projection: Number((turnoutRate + 2.8).toFixed(1)),
      winner_confidence: 82.4,
      swing_counties: ['Nairobi', 'Kiambu', 'Kisumu'],
      risk_areas: ['Westlands', 'Kangemi', 'Kileleshwa'],
      anomaly_count: state.alerts.filter((alert) => alert.alert_status !== 'dismissed').length,
      timestamp: updatedAt,
    },
    metrics: {
      total_stations: stations.length,
      stations_reporting: reportingStations.length,
      active_streams: streams.filter((stream) => stream.status === 'live').length,
      total_votes: totalVotes,
      turnout_rate: turnoutRate,
      critical_incidents: incidents.filter((incident) => incident.severity === 'critical' && incident.status !== 'resolved').length,
    },
    updated_at: updatedAt,
  }
}
