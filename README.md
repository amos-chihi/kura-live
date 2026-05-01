# KURA LIVE - Kenya Election 2027 MVP

Kenya Unified Results Architecture - Live Intelligence Platform

## Overview

KURA LIVE is a comprehensive election monitoring platform for Kenya's 2027 General Election. It provides real-time vote tally capture, stream management, form scanning, cross-source comparison, and discrepancy alerting across ~46,229 polling stations.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (no separate backend service)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Video**: react-player
- **Deployment**: Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the following SQL in your Supabase project to create the required tables:

```sql
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
```

## Access Routes

### Public Routes
- **Landing**: `/` - Platform overview and access options
- **Public Results**: `/results` - Live election results dashboard
- **Login**: `/login` - Authentication page

### Protected Routes
- **Agent Dashboard**: `/dashboard` - Agent portal with stream management, transcription, results, comparison, and alerts
- **Admin Panel**: `/admin` - Campaign oversight and management

## Demo Credentials

For MVP demonstration:

- **Agent Login**: `agent@kuralive.ke` / `KuraLive2027!`
- **Admin Login**: `admin@kuralive.ke` / `AdminKura2027!`

## Features

### Agent Portal (`/dashboard`)
- **Stream Management**: Multi-platform streaming (TikTok, YouTube, Platform)
- **Live Transcription**: AI-powered speech-to-text with vote extraction
- **Form Processing**: Form 34A OCR scanning and data extraction
- **Three-Source Comparison**: Audio AI vs Form 34A vs IEBC Portal verification
- **Real-time Alerts**: Discrepancy detection and escalation workflows

### Public Dashboard (`/results`)
- **National Results**: Live tally table with sorting and filtering
- **Interactive Map**: Kenya county map with results visualization
- **Station Search**: Lookup results by station code, name, or constituency
- **Auto-refresh**: Real-time updates every 30 seconds

### Admin Panel (`/admin`)
- **System Overview**: Platform metrics and statistics
- **Agent Management**: Monitor and manage polling agents
- **Analytics**: Reporting progress and geographic distribution
- **Alert Management**: Review and escalate critical alerts
- **System Settings**: Configure thresholds and preferences

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Authentication
│   ├── dashboard/         # Agent portal
│   ├── admin/             # Admin panel
│   ├── results/           # Public results
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Core UI components
│   ├── dashboard/        # Dashboard panels
│   └── public/           # Public-facing components
├── lib/                  # Utilities and configuration
│   ├── supabase.ts       # Database client
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # App constants
│   └── demo-data.ts      # Mock data
├── store/                # Zustand state management
├── hooks/                # Custom React hooks
└── middleware.ts         # Authentication middleware
```

## Color System

The platform uses a custom color palette optimized for election monitoring:

- `kura-navy`: #0A1628 (primary background)
- `kura-accent`: #00AACC (primary accent)
- `kura-accent2`: #FF3D71 (alerts/secondary)
- `kura-green`: #1A7A4A (success/positive)
- `kura-amber`: #D4860A (warnings)
- `kura-surface`: #0D2137 (card backgrounds)
- `kura-border`: #1A2540 (borders)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

```bash
npm run build
npm run start
```

## Security Notes

- All API routes follow RESTful conventions and return `{ data, error }` shape
- Row Level Security (RLS) is enabled on all tables
- Agents can only access their own data
- Public read access is granted to tally_entries and alerts for the public dashboard
- Authentication middleware protects sensitive routes

## Development Guidelines

- No `any` TypeScript types - use strict typing
- All components are named exports (no default exports)
- Mobile-first responsive design on all components
- All async operations show loading states
- User-facing errors are caught and displayed as toast notifications
- Never use inline styles - always Tailwind classes

## License

© 2027 KURA LIVE - Kenya Unified Results Architecture
Built for Kenya's 2027 General Election Monitoring
