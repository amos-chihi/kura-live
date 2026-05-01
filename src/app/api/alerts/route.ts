import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Alert, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const stationCode = searchParams.get('station_code')
    const status = searchParams.get('alert_status')
    const severity = searchParams.get('severity')

    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }
    if (stationCode) {
      query = query.eq('station_code', stationCode)
    }
    if (status) {
      query = query.eq('alert_status', status)
    }
    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse<Alert[]>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<Alert[]>>({
      data: data || [],
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<Alert[]>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      station_code, 
      agent_id, 
      candidate_name, 
      delta, 
      audio_votes, 
      form34a_votes, 
      iebc_votes,
      severity = 'warning',
      alert_status = 'open'
    } = body

    if (!candidate_name || delta === undefined) {
      return NextResponse.json<ApiResponse<Alert>>({
        data: null,
        error: 'Candidate name and delta are required'
      }, { status: 400 })
    }

    const alertData = {
      station_code: station_code || null,
      agent_id: agent_id || null,
      candidate_name,
      delta,
      audio_votes: audio_votes || null,
      form34a_votes: form34a_votes || null,
      iebc_votes: iebc_votes || null,
      severity,
      alert_status
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse<Alert>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<Alert>>({
      data,
      error: null
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<Alert>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, alert_status } = body

    if (!id || !alert_status) {
      return NextResponse.json<ApiResponse<Alert>>({
        data: null,
        error: 'Alert ID and status are required'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('alerts')
      .update({ alert_status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse<Alert>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<Alert>>({
      data,
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<Alert>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
