import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { TallyEntry, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const stationCode = searchParams.get('station_code')
    const status = searchParams.get('status')

    let query = supabase
      .from('tally_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }
    if (stationCode) {
      query = query.eq('station_code', stationCode)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse<TallyEntry[]>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<TallyEntry[]>>({
      data: data || [],
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<TallyEntry[]>>({
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
      party, 
      audio_votes, 
      form34a_votes, 
      iebc_votes,
      confidence = 0.90,
      source = 'audio_ai'
    } = body

    if (!candidate_name) {
      return NextResponse.json<ApiResponse<TallyEntry>>({
        data: null,
        error: 'Candidate name is required'
      }, { status: 400 })
    }

    const tallyData = {
      station_code: station_code || null,
      agent_id: agent_id || null,
      candidate_name,
      party: party || null,
      audio_votes: audio_votes || null,
      form34a_votes: form34a_votes || null,
      iebc_votes: iebc_votes || null,
      confidence,
      source
    }

    const { data, error } = await supabase
      .from('tally_entries')
      .insert(tallyData)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse<TallyEntry>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<TallyEntry>>({
      data,
      error: null
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<TallyEntry>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
