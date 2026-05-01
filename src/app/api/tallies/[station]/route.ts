import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { TallyEntry, ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { station: string } }
) {
  try {
    const stationCode = params.station

    const { data, error } = await supabase
      .from('tally_entries')
      .select('*')
      .eq('station_code', stationCode)
      .order('created_at', { ascending: false })

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
