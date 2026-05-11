import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { ApiResponse } from '@/lib/types'
import { completeChunk, canProcessChunk } from '@/lib/transcriptQueue'
import { buildComparisonRows, buildVerificationStats, persistSourceResults, syncStationAlerts, updateVerificationState, resolveDemoAudioSample } from '@/lib/verificationDemo'
import { transcribeAudioChunk } from '@/lib/whisperRealtime'

const liveTranscriptionSchema = z.object({
  station_code: z.string().min(1),
  agent_id: z.string().min(1),
  session_id: z.string().min(1),
  chunk_index: z.coerce.number().int().nonnegative(),
  started_at: z.coerce.number(),
  ended_at: z.coerce.number(),
  sample_id: z.string().optional(),
})

const RATE_LIMIT_WINDOW_MS = 10_000
const RATE_LIMIT_MAX = 25
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(key: string) {
  const now = Date.now()
  const existing = rateLimitMap.get(key) ?? []
  const recent = existing.filter((entry) => now - entry < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  rateLimitMap.set(key, recent)
  return recent.length <= RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  let sessionId = ''
  let chunkIndex = -1

  try {
    const formData = await request.formData()
    const chunk = formData.get('audio') as File | null
    const parsedInput = liveTranscriptionSchema.parse({
      station_code: formData.get('station_code'),
      agent_id: formData.get('agent_id'),
      session_id: formData.get('session_id'),
      chunk_index: formData.get('chunk_index'),
      started_at: formData.get('started_at'),
      ended_at: formData.get('ended_at'),
      sample_id: formData.get('sample_id'),
    })

    sessionId = parsedInput.session_id
    chunkIndex = parsedInput.chunk_index

    if (!chunk) {
      return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Audio chunk is required' }, { status: 400 })
    }

    if (!checkRateLimit(parsedInput.agent_id)) {
      return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Rate limit exceeded for live transcription' }, { status: 429 })
    }

    if (!canProcessChunk(parsedInput.session_id, parsedInput.chunk_index)) {
      return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Duplicate chunk suppressed' }, { status: 409 })
    }

    const demoSample = resolveDemoAudioSample(parsedInput.sample_id ?? null, chunk.name)
    const fallbackLines = demoSample.transcript_lines
    const fallbackTranscript = fallbackLines[parsedInput.chunk_index % fallbackLines.length] ?? demoSample.transcript_text
    const whisperResult = await transcribeAudioChunk(chunk, fallbackTranscript)

    const filteredVotes = whisperResult.extracted_votes.filter((vote) => vote.candidate_name !== 'Rejected Votes')

    await persistSourceResults({
      station_code: parsedInput.station_code,
      agent_id: parsedInput.agent_id,
      source: 'audio_ai',
      confidence: whisperResult.confidence,
      results: filteredVotes.map((vote) => ({
        candidate_name: vote.candidate_name,
        party: vote.party,
        votes: vote.votes,
      })),
    })

    const state = await updateVerificationState((current) => ({
      ...current,
      transcript_segments: [
        {
          id: crypto.randomUUID(),
          session_id: parsedInput.session_id,
          station_code: parsedInput.station_code,
          agent_id: parsedInput.agent_id,
          chunk_index: parsedInput.chunk_index,
          transcript_text: whisperResult.transcript_text,
          confidence: whisperResult.confidence,
          created_at: new Date().toISOString(),
        },
        ...current.transcript_segments.filter(
          (segment) => !(segment.session_id === parsedInput.session_id && segment.chunk_index === parsedInput.chunk_index)
        ),
      ].sort((left, right) => left.chunk_index - right.chunk_index),
    }))

    const synced = await syncStationAlerts(parsedInput.station_code)
    const rows = buildComparisonRows(synced.tally_entries, parsedInput.station_code)

    return NextResponse.json<ApiResponse<{
      transcript_text: string
      merged_transcript: string
      extracted_votes: typeof whisperResult.extracted_votes
      comparison_rows: typeof rows
      stats: ReturnType<typeof buildVerificationStats>
    }>>({
      data: {
        transcript_text: whisperResult.transcript_text,
        merged_transcript: state.transcript_segments
          .filter((segment) => segment.session_id === parsedInput.session_id)
          .sort((left, right) => left.chunk_index - right.chunk_index)
          .map((segment) => segment.transcript_text)
          .join(' '),
        extracted_votes: whisperResult.extracted_votes,
        comparison_rows: rows,
        stats: buildVerificationStats(rows),
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to transcribe live audio chunk' }, { status: 500 })
  } finally {
    if (sessionId && chunkIndex >= 0) {
      completeChunk(sessionId, chunkIndex)
    }
  }
}
