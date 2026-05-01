import { DEMO_TRANSCRIPT_LINES } from './demo-data'

export { DEMO_TRANSCRIPT_LINES }

export const APP_CONFIG = {
  name: 'KURA LIVE',
  tagline: 'Kenya Unified Results Architecture - Live Intelligence Platform',
  version: '1.0.0',
  description: 'Election agent portal for real-time vote tally capture, stream management, form scanning, cross-source comparison, and discrepancy alerting'
}

export const STREAM_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  ENDED: 'ended',
  OFFLINE: 'offline'
} as const

export const TALLY_STATUS = {
  PENDING: 'pending',
  DISCREPANCY: 'discrepancy',
  MATCH: 'match'
} as const

export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
} as const

export const ALERT_STATUS = {
  OPEN: 'open',
  ESCALATED: 'escalated',
  DISMISSED: 'dismissed'
} as const

export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const

export const SCAN_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed'
} as const

export const FORM_TYPES = {
  FORM_34A: '34A',
  FORM_34B: '34B',
  FORM_34C: '34C'
} as const

export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Kisii', 'Kitale', 'Kakamega', 'Meru', 'Nanyuki',
  'Thika', 'Malindi', 'Lamu', 'Garissa', 'Wajir',
  'Mandera', 'Marsabit', 'Isiolo', 'Turkana', 'West Pokot',
  'Samburu', 'Baringo', 'Laikipia', 'Nyandarua', 'Nyeri',
  'Kirinyaga', 'Muranga', 'Kiambu', 'Machakos', 'Makueni',
  'Kitui', 'Taita Taveta', 'Kilifi', 'Kwale', 'Tana River',
  'Homa Bay', 'Migori', 'Kericho', 'Bomet', 'Narok',
  'Bungoma', 'Busia', 'Siaya', 'Vihiga', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi'
]

export const MAJOR_PARTIES = [
  'UDA', 'ODM', 'ANC', 'WDM-K', 'Jubilee', 'Ford Kenya',
  'Chama Cha Kazi', 'Roots Party', 'Agano Party', 'CCM'
]

export const VOTE_EXTRACTION_REGEX = /([A-Za-z\s]+)\s+(?:received|got)\s+([\d,]+)\s+votes/i

export const SUPPORTED_VIDEO_PLATFORMS = {
  TIKTOK: 'tiktok.com',
  YOUTUBE: 'youtube.com',
  YOUTUBE_SHORT: 'youtu.be',
  PLATFORM: 'platform.example.com'
} as const

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILES_PER_AGENT: 50
}

export const REALTIME_CHANNELS = {
  TALLIES: 'tally_entries',
  ALERTS: 'alerts',
  STREAMS: 'live_streams'
} as const

export const DEMO_CREDENTIALS = {
  AGENT: {
    email: 'agent@kuralive.ke',
    password: 'KuraLive2027!'
  },
  ADMIN: {
    email: 'admin@kuralive.ke',
    password: 'AdminKura2027!'
  }
}
