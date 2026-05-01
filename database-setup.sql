-- KURA LIVE Database Setup
-- Run this in your Supabase SQL Editor

-- Polling stations (pre-loaded reference data)
CREATE TABLE polling_stations (
  station_code TEXT PRIMARY KEY,
  station_name TEXT NOT NULL,
  constituency TEXT NOT NULL,
  county TEXT NOT NULL,
  ward TEXT NOT NULL,
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  registered_voters INTEGER DEFAULT 0
);

-- Agents (linked to Supabase auth users)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  station_code TEXT REFERENCES polling_stations(station_code),
  tiktok_url TEXT,
  youtube_url TEXT,
  platform_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Live streams
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  station_code TEXT REFERENCES polling_stations(station_code),
  tiktok_url TEXT,
  youtube_url TEXT,
  platform_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','paused','ended','offline')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tally entries
CREATE TABLE tally_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code TEXT REFERENCES polling_stations(station_code),
  agent_id UUID REFERENCES agents(id),
  candidate_name TEXT NOT NULL,
  party TEXT,
  audio_votes INTEGER,
  form34a_votes INTEGER,
  iebc_votes INTEGER,
  max_delta INTEGER GENERATED ALWAYS AS (
    GREATEST(
      ABS(COALESCE(audio_votes,0) - COALESCE(form34a_votes,0)),
      ABS(COALESCE(audio_votes,0) - COALESCE(iebc_votes,0)),
      ABS(COALESCE(form34a_votes,0) - COALESCE(iebc_votes,0))
    )
  ) STORED,
  status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN audio_votes IS NULL OR form34a_votes IS NULL OR iebc_votes IS NULL THEN 'pending'
      WHEN ABS(audio_votes-form34a_votes)>=1 OR ABS(audio_votes-iebc_votes)>=1
      OR ABS(form34a_votes-iebc_votes)>=1 THEN 'discrepancy'
      ELSE 'match'
    END
  ) STORED,
  confidence DECIMAL(3,2) DEFAULT 0.90,
  source TEXT DEFAULT 'audio_ai',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Form uploads
CREATE TABLE form_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code TEXT REFERENCES polling_stations(station_code),
  agent_id UUID REFERENCES agents(id),
  form_type TEXT NOT NULL DEFAULT '34A',
  file_path TEXT,
  sha256_hash TEXT,
  scan_status TEXT DEFAULT 'pending'
  CHECK (scan_status IN ('pending','processing','complete','failed')),
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code TEXT REFERENCES polling_stations(station_code),
  agent_id UUID REFERENCES agents(id),
  candidate_name TEXT NOT NULL,
  delta INTEGER NOT NULL,
  audio_votes INTEGER,
  form34a_votes INTEGER,
  iebc_votes INTEGER,
  severity TEXT DEFAULT 'warning'
  CHECK (severity IN ('critical','warning','info')),
  alert_status TEXT DEFAULT 'open'
  CHECK (alert_status IN ('open','escalated','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tally_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for results dashboard
CREATE POLICY "Public read access to tally entries" ON tally_entries
  FOR SELECT USING (true);

CREATE POLICY "Public read access to alerts" ON alerts
  FOR SELECT USING (true);

-- Agents can only access their own data
CREATE POLICY "Agents can view own streams" ON live_streams
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM agents WHERE id = agent_id));

CREATE POLICY "Agents can insert own streams" ON live_streams
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM agents WHERE id = agent_id));

CREATE POLICY "Agents can update own streams" ON live_streams
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM agents WHERE id = agent_id));

-- Similar policies for other tables...
