import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TRANSCRIPT_LINES, VOTE_EXTRACTION_REGEX } from '@/lib/constants'
import type { ApiResponse, TranscriptLine } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { delay = 500 } = body

    // Simulate live transcript with vote extraction
    const transcriptLines: TranscriptLine[] = DEMO_TRANSCRIPT_LINES.map((line: string, index: number) => {
      const timestamp = new Date(Date.now() + index * 2000).toISOString()
      
      // Extract votes from transcript lines
      const match = line.match(VOTE_EXTRACTION_REGEX)
      let extractedVotes
      
      if (match) {
        extractedVotes = [{
          candidate_name: match[1].trim(),
          votes: parseInt(match[2].replace(/,/g, ''))
        }]
      }

      return {
        text: line,
        timestamp,
        extracted_votes: extractedVotes
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
