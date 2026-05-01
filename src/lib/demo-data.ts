import type { Agent, PollingStation, TallyEntry, Alert } from './types'

export const DEMO_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    user_id: 'user-001',
    agent_id: 'AGT-2027-001',
    full_name: 'James Mwangi',
    station_code: 'KE-047-290-0001',
    tiktok_url: 'https://www.tiktok.com/@jmwangi_iebc/live',
    youtube_url: 'https://www.youtube.com/watch?v=demo001',
    platform_url: 'https://platform.example.com/stream/001',
    status: 'active',
    created_at: '2027-08-08T06:00:00Z'
  },
  {
    id: 'agent-002',
    user_id: 'user-002',
    agent_id: 'AGT-2027-002',
    full_name: 'Sarah Njoroge',
    station_code: 'KE-047-290-0002',
    tiktok_url: 'https://www.tiktok.com/@snjoroge_iebc/live',
    youtube_url: 'https://www.youtube.com/watch?v=demo002',
    platform_url: 'https://platform.example.com/stream/002',
    status: 'active',
    created_at: '2027-08-08T06:00:00Z'
  },
  {
    id: 'agent-003',
    user_id: 'user-003',
    agent_id: 'AGT-2027-003',
    full_name: 'David Ochieng',
    station_code: 'KE-047-290-0003',
    tiktok_url: 'https://www.tiktok.com/@dochieng_iebc/live',
    youtube_url: 'https://www.youtube.com/watch?v=demo003',
    platform_url: 'https://platform.example.com/stream/003',
    status: 'active',
    created_at: '2027-08-08T06:00:00Z'
  },
  {
    id: 'agent-004',
    user_id: 'user-004',
    agent_id: 'AGT-2027-004',
    full_name: 'Grace Wanjiru',
    station_code: 'KE-047-290-0004',
    tiktok_url: 'https://www.tiktok.com/@gwanjiru_iebc/live',
    youtube_url: 'https://www.youtube.com/watch?v=demo004',
    platform_url: 'https://platform.example.com/stream/004',
    status: 'active',
    created_at: '2027-08-08T06:00:00Z'
  },
  {
    id: 'agent-005',
    user_id: 'user-005',
    agent_id: 'AGT-2027-005',
    full_name: 'Michael Kamau',
    station_code: 'KE-047-290-0005',
    tiktok_url: 'https://www.tiktok.com/@mkamau_iebc/live',
    youtube_url: 'https://www.youtube.com/watch?v=demo005',
    platform_url: 'https://platform.example.com/stream/005',
    status: 'active',
    created_at: '2027-08-08T06:00:00Z'
  }
]

export const DEMO_STATIONS: PollingStation[] = [
  {
    station_code: 'KE-047-290-0001',
    station_name: 'Westlands Primary School Stream 1',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Parklands',
    gps_lat: -1.26285,
    gps_lng: 36.80374,
    registered_voters: 347
  },
  {
    station_code: 'KE-047-290-0002',
    station_name: 'Westlands Primary School Stream 2',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Parklands',
    gps_lat: -1.26285,
    gps_lng: 36.80374,
    registered_voters: 352
  },
  {
    station_code: 'KE-047-290-0003',
    station_name: 'Kangemi Health Centre Stream 1',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Kangemi',
    gps_lat: -1.23456,
    gps_lng: 36.78901,
    registered_voters: 289
  },
  {
    station_code: 'KE-047-290-0004',
    station_name: 'Kangemi Health Centre Stream 2',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Kangemi',
    gps_lat: -1.23456,
    gps_lng: 36.78901,
    registered_voters: 295
  },
  {
    station_code: 'KE-047-290-0005',
    station_name: 'Lavington Primary School Stream 1',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Lavington',
    gps_lat: -1.29876,
    gps_lng: 36.81234,
    registered_voters: 418
  },
  {
    station_code: 'KE-047-290-0006',
    station_name: 'Lavington Primary School Stream 2',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Lavington',
    gps_lat: -1.29876,
    gps_lng: 36.81234,
    registered_voters: 412
  },
  {
    station_code: 'KE-047-290-0007',
    station_name: 'Riverside Primary School Stream 1',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Riverside',
    gps_lat: -1.27654,
    gps_lng: 36.82345,
    registered_voters: 378
  },
  {
    station_code: 'KE-047-290-0008',
    station_name: 'Riverside Primary School Stream 2',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Riverside',
    gps_lat: -1.27654,
    gps_lng: 36.82345,
    registered_voters: 382
  },
  {
    station_code: 'KE-047-290-0009',
    station_name: 'Kileleshwa Community Centre Stream 1',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Kileleshwa',
    gps_lat: -1.28765,
    gps_lng: 36.83456,
    registered_voters: 324
  },
  {
    station_code: 'KE-047-290-0010',
    station_name: 'Kileleshwa Community Centre Stream 2',
    constituency: 'Westlands',
    county: 'Nairobi',
    ward: 'Kileleshwa',
    gps_lat: -1.28765,
    gps_lng: 36.83456,
    registered_voters: 318
  }
]

export const DEMO_CANDIDATES = [
  {
    candidate_name: 'John Kariuki',
    party: 'UDA',
    audio_votes: 14523,
    form34a_votes: 14523,
    iebc_votes: 14522
  },
  {
    candidate_name: 'Mary Wambui',
    party: 'ODM',
    audio_votes: 12891,
    form34a_votes: 12892,
    iebc_votes: 12891
  },
  {
    candidate_name: 'Peter Omondi',
    party: 'ANC',
    audio_votes: 9044,
    form34a_votes: 9044,
    iebc_votes: 9044
  },
  {
    candidate_name: 'Grace Akinyi',
    party: 'WDM-K',
    audio_votes: 3210,
    form34a_votes: 3210,
    iebc_votes: 3211
  }
]

export const DEMO_TALLY_ENTRIES: TallyEntry[] = DEMO_CANDIDATES.map((candidate, index) => ({
  id: `tally-${index + 1}`,
  station_code: 'KE-047-290-0001',
  agent_id: 'agent-001',
  candidate_name: candidate.candidate_name,
  party: candidate.party,
  audio_votes: candidate.audio_votes,
  form34a_votes: candidate.form34a_votes,
  iebc_votes: candidate.iebc_votes,
  max_delta: Math.max(
    Math.abs(candidate.audio_votes - candidate.form34a_votes),
    Math.abs(candidate.audio_votes - candidate.iebc_votes),
    Math.abs(candidate.form34a_votes - candidate.iebc_votes)
  ),
  status: candidate.audio_votes === candidate.form34a_votes && candidate.form34a_votes === candidate.iebc_votes 
    ? 'match' 
    : 'discrepancy',
  confidence: 0.90,
  source: 'audio_ai',
  created_at: '2027-08-08T14:30:00Z',
  updated_at: '2027-08-08T14:30:00Z'
}))

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    station_code: 'KE-047-290-0001',
    agent_id: 'agent-001',
    candidate_name: 'Mary Wambui',
    delta: 1,
    audio_votes: 12891,
    form34a_votes: 12892,
    iebc_votes: 12891,
    severity: 'warning',
    alert_status: 'open',
    created_at: '2027-08-08T14:35:00Z'
  },
  {
    id: 'alert-002',
    station_code: 'KE-047-290-0001',
    agent_id: 'agent-001',
    candidate_name: 'Grace Akinyi',
    delta: 1,
    audio_votes: 3210,
    form34a_votes: 3210,
    iebc_votes: 3211,
    severity: 'warning',
    alert_status: 'open',
    created_at: '2027-08-08T14:35:00Z'
  }
]

export const DEMO_TRANSCRIPT_LINES = [
  "The Returning Officer is now announcing the final results for Westlands Constituency.",
  "John Kariuki received 14,523 votes.",
  "Mary Wambui got 12,891 votes.",
  "Peter Omondi received 9,044 votes.",
  "Grace Akinyi got 3,210 votes.",
  "Total valid votes cast: 39,668. Total rejected votes: 412.",
  "The presiding officer confirms these results as per Form 34A duly signed."
]

export const DEMO_FORM_34A_DATA = {
  station_code: 'KE-047-290-0001',
  station_name: 'Westlands Primary School Stream 1',
  constituency: 'Westlands',
  county: 'Nairobi',
  results: [
    {
      candidate_name: 'John Kariuki',
      party: 'UDA',
      votes: 14523,
      valid_votes: true
    },
    {
      candidate_name: 'Mary Wambui',
      party: 'ODM',
      votes: 12892,
      valid_votes: true
    },
    {
      candidate_name: 'Peter Omondi',
      party: 'ANC',
      votes: 9044,
      valid_votes: true
    },
    {
      candidate_name: 'Grace Akinyi',
      party: 'WDM-K',
      votes: 3210,
      valid_votes: true
    }
  ],
  total_valid_votes: 39669,
  total_rejected_votes: 412,
  total_registered_voters: 347,
  voter_turnout: 91.6,
  presiding_officer: 'Jane M. Njoroge',
  timestamp: '2027-08-08T14:20:00Z'
}

export const DEMO_IEBC_DATA = {
  station_code: 'KE-047-290-0001',
  results: [
    {
      candidate_name: 'John Kariuki',
      party: 'UDA',
      votes: 14522
    },
    {
      candidate_name: 'Mary Wambui',
      party: 'ODM',
      votes: 12891
    },
    {
      candidate_name: 'Peter Omondi',
      party: 'ANC',
      votes: 9044
    },
    {
      candidate_name: 'Grace Akinyi',
      party: 'WDM-K',
      votes: 3211
    }
  ],
  last_updated: '2027-08-08T15:45:00Z',
  source: 'IEBC Portal'
}
