import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/lib/types'
import { buildCommandCentreSnapshot, type CommandCentreSnapshot } from '@/lib/commandCenter'

export async function GET() {
  try {
    const snapshot = await buildCommandCentreSnapshot()

    return NextResponse.json<ApiResponse<CommandCentreSnapshot>>({
      data: snapshot,
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: 'Failed to load the command centre snapshot',
      },
      { status: 500 }
    )
  }
}
