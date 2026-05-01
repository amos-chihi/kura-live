import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { LiveStream, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const stationCode = searchParams.get('station_code')

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
      return NextResponse.json<ApiResponse<LiveStream[]>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<LiveStream[]>>({
      data: data || [],
      error: null
    })
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
    const { agent_id, station_code, tiktok_url, youtube_url, platform_url } = body

    if (!agent_id) {
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: null,
        error: 'Agent ID is required'
      }, { status: 400 })
    }

    const streamData = {
      agent_id,
      station_code: station_code || null,
      tiktok_url: tiktok_url || null,
      youtube_url: youtube_url || null,
      platform_url: platform_url || null,
      status: 'scheduled' as const,
      start_time: null,
      end_time: null,
      viewer_count: 0
    }

    const { data, error } = await supabase
      .from('live_streams')
      .insert(streamData)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse<LiveStream>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<LiveStream>>({
      data,
      error: null
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<LiveStream>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
