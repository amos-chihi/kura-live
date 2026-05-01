export interface PollingStation {
  station_code: string
  station_name: string
  constituency: string
  county: string
  ward: string
  gps_lat: number | null
  gps_lng: number | null
  registered_voters: number
}

export interface Agent {
  id: string
  user_id: string
  agent_id: string
  full_name: string
  station_code: string | null
  tiktok_url: string | null
  youtube_url: string | null
  platform_url: string | null
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended'
  phone?: string
  email?: string
  verification_status?: 'unverified' | 'id_verified' | 'fully_verified'
  created_at: string
}

export interface LiveStream {
  id: string
  agent_id: string
  station_code: string | null
  tiktok_url: string | null
  youtube_url: string | null
  platform_url: string | null
  platform?: 'youtube' | 'tiktok' | 'platform'
  status: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
  start_time: string | null
  end_time: string | null
  viewer_count: number
  created_at: string
}

export interface TallyEntry {
  id: string
  station_code: string | null
  agent_id: string | null
  candidate_name: string
  party: string | null
  audio_votes: number | null
  form34a_votes: number | null
  iebc_votes: number | null
  max_delta: number
  status: 'pending' | 'discrepancy' | 'match'
  confidence: number
  source: string
  created_at: string
  updated_at: string
}

export interface FormUpload {
  id: string
  station_code: string | null
  agent_id: string | null
  form_type: string
  file_path: string | null
  sha256_hash: string | null
  scan_status: 'pending' | 'processing' | 'complete' | 'failed'
  extracted_data: any | null
  created_at: string
}

export interface Alert {
  id: string
  station_code: string | null
  agent_id: string | null
  candidate_name: string
  delta: number
  audio_votes: number | null
  form34a_votes: number | null
  iebc_votes: number | null
  severity: 'critical' | 'warning' | 'info'
  alert_status: 'open' | 'escalated' | 'dismissed'
  created_at: string
}

export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
}

export interface StreamFormData {
  tiktok_url?: string
  youtube_url?: string
  platform_url?: string
}

export interface TallyFormData {
  candidate_name: string
  party?: string
  audio_votes?: number
  form34a_votes?: number
  iebc_votes?: number
}

export interface AlertFormData {
  candidate_name: string
  delta: number
  audio_votes?: number
  form34a_votes?: number
  iebc_votes?: number
  severity?: 'critical' | 'warning' | 'info'
}

export interface TranscriptLine {
  text: string
  timestamp: string
  extracted_votes?: {
    candidate_name: string
    votes: number
  }[]
}

export interface ComparisonStats {
  total_candidates: number
  matching: number
  pending: number
  discrepancies: number
}

export interface DashboardStats {
  total_stations: number
  active_streams: number
  total_tallies: number
  open_alerts: number
}
