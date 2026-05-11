import { NextResponse } from 'next/server'

import type { ApiResponse, TallyEntry } from '@/lib/types'
import {
  buildComparisonRows,
  buildVerificationStats,
  persistSourceResults,
  recordTranscript,
  resolveDemoAudioSample,
  syncStationAlerts,
} from '@/lib/verificationDemo'
import { parseVotesFromTranscript } from '@/lib/voteParser'
import { transcribeAudioChunk } from '@/lib/whisperRealtime'

interface TranscriptionResponse {
  transcript_text: string
  extracted_votes: Array<{ candidate_name: string; votes: number; confidence?: number }>
  tally_entries: TallyEntry[]
  comparison_rows: ReturnType<typeof buildComparisonRows>
  stats: ReturnType<typeof buildVerificationStats>
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const sampleId = (formData.get('sample_id') as string | null) ?? null
    const stationCode = ((formData.get('station_code') as string | null) ?? 'KE-047-290-0001').trim()
    const agentId = ((formData.get('agent_id') as string | null) ?? 'agent-001').trim()

    let transcriptText = ''
    let sourceLabel = 'Uploaded audio file'
    const demoSample = resolveDemoAudioSample(sampleId, audioFile?.name ?? null)

    if (audioFile) {
      transcriptText = (await transcribeAudioChunk(audioFile, demoSample.transcript_text).catch(() => null))?.transcript_text ?? demoSample.transcript_text
      sourceLabel = audioFile.name
    } else {
      transcriptText = demoSample.transcript_text
      sourceLabel = demoSample.label
    }

    const extractedVotes = parseVotesFromTranscript(transcriptText).map((vote) => ({
      candidate_name: vote.candidate_name,
      votes: vote.votes,
      confidence: vote.confidence,
      party: vote.party,
    }))
    const results = extractedVotes.map((vote) => ({
      candidate_name: vote.candidate_name,
      party: vote.party ?? null,
      votes: vote.votes,
    }))

    const stateWithTallies = await persistSourceResults({
      station_code: stationCode,
      agent_id: agentId || null,
      source: 'audio_ai',
      confidence: 0.9,
      results,
    })

    const stateWithTranscript = await recordTranscript({
      station_code: stationCode,
      agent_id: agentId || null,
      sample_id: demoSample.id,
      source_label: sourceLabel,
      transcript_text: transcriptText,
      extracted_votes: extractedVotes,
    })

    const syncedState = await syncStationAlerts(stationCode)
    const comparisonRows = buildComparisonRows(syncedState.tally_entries, stationCode)
    const tallyEntries = stateWithTallies.tally_entries.filter((entry) => entry.station_code === stationCode)

    return NextResponse.json<ApiResponse<TranscriptionResponse>>({
      data: {
        transcript_text: transcriptText,
        extracted_votes: extractedVotes,
        tally_entries: tallyEntries,
        comparison_rows: comparisonRows,
        stats: buildVerificationStats(comparisonRows),
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: 'Failed to transcribe the provided audio sample',
    }, { status: 500 })
  }
}
