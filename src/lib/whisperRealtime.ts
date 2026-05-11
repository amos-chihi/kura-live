import { parseVotesFromTranscript } from '@/lib/voteParser'

export interface WhisperRealtimeResult {
  transcript_text: string
  extracted_votes: ReturnType<typeof parseVotesFromTranscript>
  confidence: number
}

export async function transcribeAudioChunk(file: File, fallbackTranscript: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      transcript_text: fallbackTranscript,
      extracted_votes: parseVotesFromTranscript(fallbackTranscript),
      confidence: 0.86,
    } satisfies WhisperRealtimeResult
  }

  const form = new FormData()
  form.append('file', file, file.name)
  form.append('model', 'whisper-1')
  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    })

    if (!response.ok) {
      throw new Error('Whisper chunk transcription failed')
    }

    const payload = (await response.json()) as { text?: string }
    const transcript = payload.text?.trim() || fallbackTranscript
    return {
      transcript_text: transcript,
      extracted_votes: parseVotesFromTranscript(transcript),
      confidence: 0.93,
    } satisfies WhisperRealtimeResult
  } catch {
    return {
      transcript_text: fallbackTranscript,
      extracted_votes: parseVotesFromTranscript(fallbackTranscript),
      confidence: 0.82,
    } satisfies WhisperRealtimeResult
  }
}
