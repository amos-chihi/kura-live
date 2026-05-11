import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createLiveSession } from '@/lib/liveSession'
import { inferStreamPlatform, streamRegistrationSchema } from '@/lib/streamManager'
import { supabase } from '@/lib/supabase'
import type { LiveStream, ApiResponse } from '@/lib/types'
import { getVerificationState, registerLiveSession, updateLiveSession } from '@/lib/verificationDemo'

const streamUpdateSchema = z.object({
  session_id: z.string().optional(),
  stream_id: z.string().optional(),
  status: z.enum(['scheduled', 'live', 'paused', 'ended', 'offline']).optional(),
  viewer_count: z.number().int().nonnegative().optional(),
  bitrate_kbps: z.number().nonnegative().optional(),
  latency_ms: z.number().nonnegative().optional(),
})

function buildFallbackStream(session: ReturnType<typeof createLiveSession>): LiveStream {
  return {
    id: session.id,
    agent_id: session.agent_id,
    station_code: session.station_code,
    tiktok_url: session.platform === 'tiktok' ? session.source_url : null,
    youtube_url: session.platform === 'youtube' ? session.source_url : null,
    platform_url: session.platform === 'rtmp' || session.platform === 'browser' ? session.source_url : null,
    platform:
      session.platform === 'rtmp' || session.platform === 'browser' || session.platform === 'microphone'
        ? 'platform'
        : session.platform,
    status: session.status === 'monitoring' ? 'live' : session.status === 'ended' ? 'ended' : session.status === 'reconnecting' ? 'paused' : 'offline',
    start_time: session.started_at,
    end_time: session.status === 'ended' ? session.updated_at : null,
    viewer_count: session.viewer_count,
    created_at: session.started_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const stationCode = searchParams.get('station_code')

    try {
      let query = supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false })

      if (agentId) {
        query = query.eq('agent_id', agentId)
      }
      if (stationCode) {
        query = query.eq('station_code', stationCode)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return NextResponse.json<ApiResponse<LiveStream[]>>({
        data: data || [],
        error: null
      })
    } catch {
      const state = await getVerificationState()
      const liveStreams = state.live_sessions
        .map((session) => buildFallbackStream(session))
        .filter((stream) => {
          if (agentId && stream.agent_id !== agentId) {
            return false
          }
          if (stationCode && stream.station_code !== stationCode) {
            return false
          }
          return true
        })

      return NextResponse.json<ApiResponse<LiveStream[]>>({
        data: liveStreams,
        error: null
      })
    }
  } catch (error) {
    return NextResponse.json<ApiResponse<LiveStream[]>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sourceUrl = body.source_url ?? body.tiktok_url ?? body.youtube_url ?? body.platform_url
    const platform = body.platform ?? (sourceUrl ? inferStreamPlatform(sourceUrl) : null)
    const parsed = streamRegistrationSchema.safeParse({
      agent_id: body.agent_id,
      station_code: body.station_code ?? 'KE-047-290-0001',
      source_url: sourceUrl,
      platform,
    })

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: null,
        error: 'A valid agent id, station code, and live stream URL are required'
      }, { status: 400 })
    }

    const session = createLiveSession(parsed.data)
    const streamData = {
      agent_id: parsed.data.agent_id,
      station_code: parsed.data.station_code || null,
      tiktok_url: parsed.data.platform === 'tiktok' ? parsed.data.source_url : null,
      youtube_url: parsed.data.platform === 'youtube' ? parsed.data.source_url : null,
      platform_url: parsed.data.platform === 'rtmp' || parsed.data.platform === 'browser' ? parsed.data.source_url : null,
      status: 'live' as const,
      start_time: session.started_at,
      end_time: null,
      viewer_count: 0
    }

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .insert(streamData)
        .select()
        .single()

      if (error) {
        throw error
      }

      await registerLiveSession(session)
      return NextResponse.json<ApiResponse<LiveStream>>({
        data,
        error: null
      }, { status: 201 })
    } catch {
      await registerLiveSession(session)
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: buildFallbackStream(session),
        error: null
      }, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json<ApiResponse<LiveStream>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = streamUpdateSchema.safeParse(body)
    if (!parsed.success || (!parsed.data.session_id && !parsed.data.stream_id)) {
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: null,
        error: 'A session identifier is required to update stream state'
      }, { status: 400 })
    }

    const state = parsed.data.status
    const sessionId = parsed.data.session_id ?? parsed.data.stream_id ?? ''
    const mappedStatus =
      state === 'live'
        ? 'monitoring'
        : state === 'paused'
          ? 'reconnecting'
          : state === 'ended'
            ? 'ended'
            : state === 'offline'
              ? 'error'
              : 'idle'

    const updatedState = await updateLiveSession(sessionId, {
      status: mappedStatus,
      viewer_count: parsed.data.viewer_count,
      bitrate_kbps: parsed.data.bitrate_kbps,
      latency_ms: parsed.data.latency_ms,
      health:
        parsed.data.status === 'offline'
          ? 'offline'
          : parsed.data.status === 'paused'
            ? 'degraded'
            : 'healthy',
    })

    const session = updatedState.live_sessions.find((entry) => entry.id === sessionId)
    if (!session) {
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: null,
        error: 'Live session not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<LiveStream>>({
      data: buildFallbackStream(session),
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<LiveStream>>({
      data: null,
      error: 'Failed to update the live stream session'
    }, { status: 500 })
  }
}
