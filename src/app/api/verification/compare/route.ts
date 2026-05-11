import { NextRequest, NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/types'
import { buildComparisonRows, buildVerificationStats, getVerificationState, syncStationAlerts } from '@/lib/verificationDemo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationCode = searchParams.get('station_code') ?? 'KE-047-290-0001'
    const synced = await syncStationAlerts(stationCode)
    const rows = buildComparisonRows(synced.tally_entries, stationCode)

    return NextResponse.json<ApiResponse<{ rows: typeof rows; stats: ReturnType<typeof buildVerificationStats> }>>({
      data: {
        rows,
        stats: buildVerificationStats(rows),
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to compare verification sources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
