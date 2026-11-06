import {
  resolveFoundryConfig,
  resolveTranscriptionProviderPreference,
  type TranscriptionProviderName,
} from '@/lib/foundryConfig'
import {
  cleanupTranscriptWithFoundry,
  FoundryTranscriptionError,
  transcribeWithFoundry,
} from '@/lib/foundryTranscription'
import { parseVotesFromTranscript } from '@/lib/voteParser'

export interface WhisperRealtimeResult {
  transcript_text: string
  extracted_votes: ReturnType<typeof parseVotesFromTranscript>
  confidence: number
  provider: TranscriptionProviderName
}

function demoResult(fallbackTranscript: string, confidence = 0.86): WhisperRealtimeResult {
  return {
    transcript_text: fallbackTranscript,
    extracted_votes: parseVotesFromTranscript(fallbackTranscript),
    confidence,
    provider: 'demo',
  }
}

async function transcribeWithOpenAI(
  file: File,
  fallbackTranscript: string
): Promise<WhisperRealtimeResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return demoResult(fallbackTranscript)
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
      provider: 'openai',
    }
  } catch {
    return demoResult(fallbackTranscript, 0.82)
  }
}

async function transcribeWithFoundryProvider(
  file: File,
  fallbackTranscript: string
): Promise<WhisperRealtimeResult> {
  const config = resolveFoundryConfig()
  if (!config) {
    throw new FoundryTranscriptionError('Foundry endpoint/API key are not configured', 0)
  }

  const raw = await transcribeWithFoundry(file, config)
  const transcript = await cleanupTranscriptWithFoundry(raw, config)

  return {
    transcript_text: transcript,
    extracted_votes: parseVotesFromTranscript(transcript),
    confidence: 0.94,
    provider: 'foundry',
  }
}

/**
 * Transcribe one live/upload audio chunk.
 *
 * Provider order when TRANSCRIPTION_PROVIDER=auto (default):
 * 1. Microsoft Foundry / Azure OpenAI (AZURE_FOUNDRY_* or AZURE_OPENAI_*)
 * 2. Public OpenAI Whisper (OPENAI_API_KEY)
 * 3. Demo fallback transcript
 */
export async function transcribeAudioChunk(
  file: File,
  fallbackTranscript: string
): Promise<WhisperRealtimeResult> {
  const preference = resolveTranscriptionProviderPreference()

  if (preference === 'demo') {
    return demoResult(fallbackTranscript)
  }

  if (preference === 'foundry') {
    try {
      return await transcribeWithFoundryProvider(file, fallbackTranscript)
    } catch {
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  if (preference === 'openai') {
    return transcribeWithOpenAI(file, fallbackTranscript)
  }

  // auto
  if (resolveFoundryConfig()) {
    try {
      return await transcribeWithFoundryProvider(file, fallbackTranscript)
    } catch (error) {
      // Missing STT deployment or transient Foundry failure → try OpenAI, then demo.
      if (process.env.OPENAI_API_KEY) {
        return transcribeWithOpenAI(file, fallbackTranscript)
      }
      if (error instanceof FoundryTranscriptionError && error.code === 'DeploymentNotFound') {
        return demoResult(fallbackTranscript, 0.8)
      }
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  return transcribeWithOpenAI(file, fallbackTranscript)
}
