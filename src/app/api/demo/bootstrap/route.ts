import { NextRequest, NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/types'
import { getVerificationState, resetVerificationState } from '@/lib/verificationDemo'

export async function GET() {
  try {
    const data = await getVerificationState()
    return NextResponse.json<ApiResponse<typeof data>>({ data, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to load demo verification data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { reset?: boolean }
    const data = body.reset ? await resetVerificationState() : await getVerificationState()
    return NextResponse.json<ApiResponse<typeof data>>({ data, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to bootstrap demo verification data' }, { status: 500 })
  }
}
