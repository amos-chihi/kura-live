import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TRANSCRIPT_LINES } from '@/lib/constants'
import { extractVotesFromTranscript } from '@/lib/transcriptExtraction'
import type { ApiResponse, TranscriptLine } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { delay = 500 } = body

    // Simulate live transcript with vote extraction
    const transcriptLines: TranscriptLine[] = DEMO_TRANSCRIPT_LINES.map((line: string, index: number) => {
      const timestamp = new Date(Date.now() + index * 2000).toISOString()
      const extractedVotes = extractVotesFromTranscript(line)

      return {
        text: line,
        timestamp,
        extracted_votes: extractedVotes.length > 0 ? extractedVotes : undefined
      }
    })

    return NextResponse.json<ApiResponse<TranscriptLine[]>>({
      data: transcriptLines,
      error: null
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<TranscriptLine[]>>({
      data: null,
      error: 'Failed to simulate transcript'
    }, { status: 500 })
  }
}
