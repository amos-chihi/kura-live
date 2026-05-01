import { NextRequest, NextResponse } from 'next/server'
import { DEMO_IEBC_DATA } from '@/lib/demo-data'
import type { ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { station: string } }
) {
  try {
    const stationCode = params.station

    // Mock IEBC portal data - in production this would fetch from actual IEBC API
    // For demo purposes, we'll return mock data with intentional discrepancies
    const mockIebcData = {
      ...DEMO_IEBC_DATA,
      station_code: stationCode,
      results: DEMO_IEBC_DATA.results.map(result => ({
        ...result,
        // Add intentional 1-vote discrepancies for some candidates
        votes: result.candidate_name === 'Mary Wambui' || result.candidate_name === 'Grace Akinyi'
          ? result.votes + 1
          : result.votes
      })),
      last_updated: new Date().toISOString(),
      source: 'IEBC Portal - Live Feed'
    }

    return NextResponse.json<ApiResponse<typeof mockIebcData>>({
      data: mockIebcData,
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: 'Failed to fetch IEBC data'
    }, { status: 500 })
  }
}
