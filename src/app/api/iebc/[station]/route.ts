import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/types'
import {
  buildComparisonRows,
  buildVerificationStats,
  getDemoIebcPayload,
  persistSourceResults,
  syncStationAlerts,
} from '@/lib/verificationDemo'

export async function GET(
  request: NextRequest,
  { params }: { params: { station: string } }
) {
  try {
    const stationCode = params.station
    const shouldPersist = new URL(request.url).searchParams.get('persist') === 'true'
    const payload = {
      ...getDemoIebcPayload(stationCode),
      station_code: stationCode,
      last_updated: new Date().toISOString(),
      source: 'IEBC Portal - Demo Feed',
    }

    if (shouldPersist) {
      await persistSourceResults({
        station_code: stationCode,
        agent_id: 'agent-001',
        source: 'iebc_votes',
        confidence: 0.99,
        results: payload.results,
      })
      const synced = await syncStationAlerts(stationCode)
      const comparisonRows = buildComparisonRows(synced.tally_entries, stationCode)

      return NextResponse.json<ApiResponse<{
        iebc: typeof payload
        comparison_rows: typeof comparisonRows
        stats: ReturnType<typeof buildVerificationStats>
      }>>({
        data: {
          iebc: payload,
          comparison_rows: comparisonRows,
          stats: buildVerificationStats(comparisonRows),
        },
        error: null
      })
    }

    return NextResponse.json<ApiResponse<typeof payload>>({
      data: payload,
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: 'Failed to fetch IEBC data'
    }, { status: 500 })
  }
}
