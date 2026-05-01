import { createClient } from '@supabase/supabase-js'

function getRequiredEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const supabase = createClient(
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

export type Database = {
  public: {
    Tables: {
      polling_stations: {
        Row: {
          station_code: string
          station_name: string
          constituency: string
          county: string
          ward: string
          gps_lat: number | null
          gps_lng: number | null
          registered_voters: number
        }
        Insert: {
          station_code: string
          station_name: string
          constituency: string
          county: string
          ward: string
          gps_lat?: number | null
          gps_lng?: number | null
          registered_voters?: number
        }
        Update: {
          station_code?: string
          station_name?: string
          constituency?: string
          county?: string
          ward?: string
          gps_lat?: number | null
          gps_lng?: number | null
          registered_voters?: number
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          full_name: string
          station_code: string | null
          tiktok_url: string | null
          youtube_url: string | null
          platform_url: string | null
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          full_name: string
          station_code?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          platform_url?: string | null
          status?: 'active' | 'inactive' | 'suspended'
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          full_name?: string
          station_code?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          platform_url?: string | null
          status?: 'active' | 'inactive' | 'suspended'
        }
      }
      live_streams: {
        Row: {
          id: string
          agent_id: string
          station_code: string | null
          tiktok_url: string | null
          youtube_url: string | null
          platform_url: string | null
          status: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
          start_time: string | null
          end_time: string | null
          viewer_count: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          station_code?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          platform_url?: string | null
          status?: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
          start_time?: string | null
          end_time?: string | null
          viewer_count?: number
        }
        Update: {
          id?: string
          agent_id?: string
          station_code?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          platform_url?: string | null
          status?: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
          start_time?: string | null
          end_time?: string | null
          viewer_count?: number
        }
      }
      tally_entries: {
        Row: {
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
        Insert: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          candidate_name: string
          party?: string | null
          audio_votes?: number | null
          form34a_votes?: number | null
          iebc_votes?: number | null
          confidence?: number
          source?: string
        }
        Update: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          candidate_name?: string
          party?: string | null
          audio_votes?: number | null
          form34a_votes?: number | null
          iebc_votes?: number | null
          confidence?: number
          source?: string
        }
      }
      form_uploads: {
        Row: {
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
        Insert: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          form_type?: string
          file_path?: string | null
          sha256_hash?: string | null
          scan_status?: 'pending' | 'processing' | 'complete' | 'failed'
          extracted_data?: any | null
        }
        Update: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          form_type?: string
          file_path?: string | null
          sha256_hash?: string | null
          scan_status?: 'pending' | 'processing' | 'complete' | 'failed'
          extracted_data?: any | null
        }
      }
      alerts: {
        Row: {
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
        Insert: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          candidate_name: string
          delta: number
          audio_votes?: number | null
          form34a_votes?: number | null
          iebc_votes?: number | null
          severity?: 'critical' | 'warning' | 'info'
          alert_status?: 'open' | 'escalated' | 'dismissed'
        }
        Update: {
          id?: string
          station_code?: string | null
          agent_id?: string | null
          candidate_name?: string
          delta?: number
          audio_votes?: number | null
          form34a_votes?: number | null
          iebc_votes?: number | null
          severity?: 'critical' | 'warning' | 'info'
          alert_status?: 'open' | 'escalated' | 'dismissed'
        }
      }
    }
  }
}
