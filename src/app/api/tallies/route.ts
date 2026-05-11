import { NextRequest, NextResponse } from 'next/server'

import type { ApiResponse, TallyEntry } from '@/lib/types'
import { getVerificationState, persistSourceResults, syncStationAlerts } from '@/lib/verificationDemo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationCode = searchParams.get('station_code')
    const source = searchParams.get('source')
    const state = await getVerificationState()

    const tallies = state.tally_entries.filter((entry) => {
      if (stationCode && entry.station_code !== stationCode) {
        return false
      }
      if (source && entry.source !== source) {
        return false
      }
      return true
    })

    return NextResponse.json<ApiResponse<TallyEntry[]>>({ data: tallies, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to load tally entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      station_code?: string
      agent_id?: string | null
      candidate_name: string
      party?: string | null
      audio_votes?: number | null
      form34a_votes?: number | null
      iebc_votes?: number | null
      confidence?: number
      source?: 'audio_ai' | 'form34a_votes' | 'iebc_votes'
    }

    const stationCode = body.station_code ?? 'KE-047-290-0001'
    const source = body.source ?? 'audio_ai'
    const votes =
      source === 'audio_ai'
        ? body.audio_votes
        : source === 'form34a_votes'
          ? body.form34a_votes
          : body.iebc_votes

    if (!body.candidate_name || votes === null || votes === undefined) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: 'Candidate name and a source-specific vote value are required',
      }, { status: 400 })
    }

    const state = await persistSourceResults({
      station_code: stationCode,
      agent_id: body.agent_id ?? null,
      source,
      confidence: body.confidence ?? 0.9,
      results: [
        {
          candidate_name: body.candidate_name,
          party: body.party ?? null,
          votes,
        },
      ],
    })

    const synced = await syncStationAlerts(stationCode)
    const created = state.tally_entries.find(
      (entry) => entry.station_code === stationCode && entry.source === source && entry.candidate_name === body.candidate_name
    )

    return NextResponse.json<ApiResponse<TallyEntry>>({ data: created ?? null, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to save tally entry' }, { status: 500 })
  }
}
