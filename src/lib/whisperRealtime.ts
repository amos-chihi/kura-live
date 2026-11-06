import {
  AzureSpeechTranscriptionError,
  transcribeWithAzureSpeech,
} from '@/lib/azureSpeechTranscription'
import {
  resolveAzureSpeechConfig,
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

async function maybeCleanup(transcript: string): Promise<string> {
  const foundry = resolveFoundryConfig()
  if (!foundry?.cleanupEnabled) {
    return transcript
  }
  return cleanupTranscriptWithFoundry(transcript, foundry)
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
    const raw = payload.text?.trim() || fallbackTranscript
    const transcript = await maybeCleanup(raw)
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

async function transcribeWithSpeechProvider(
  file: File
): Promise<WhisperRealtimeResult> {
  const config = resolveAzureSpeechConfig()
  if (!config) {
    throw new AzureSpeechTranscriptionError(
      'Azure Speech endpoint/API key are not configured',
      0
    )
  }

  const raw = await transcribeWithAzureSpeech(file, config)
  const transcript = await maybeCleanup(raw)

  return {
    transcript_text: transcript,
    extracted_votes: parseVotesFromTranscript(transcript),
    confidence: 0.95,
    provider: 'speech',
  }
}

async function transcribeWithFoundryProvider(
  file: File
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
 * 1. Azure Speech MAI-Transcribe (AZURE_SPEECH_* / SPEECH_*)
 * 2. Public OpenAI Whisper (OPENAI_API_KEY)
 * 3. Optional Foundry `/audio/transcriptions` if configured
 * 4. Demo fallback transcript
 */
export async function transcribeAudioChunk(
  file: File,
  fallbackTranscript: string
): Promise<WhisperRealtimeResult> {
  const preference = resolveTranscriptionProviderPreference()

  if (preference === 'demo') {
    return demoResult(fallbackTranscript)
  }

  if (preference === 'speech') {
    try {
      return await transcribeWithSpeechProvider(file)
    } catch {
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  if (preference === 'openai') {
    return transcribeWithOpenAI(file, fallbackTranscript)
  }

  if (preference === 'foundry') {
    try {
      return await transcribeWithFoundryProvider(file)
    } catch {
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  // auto — Speech first (AgileBoard path)
  if (resolveAzureSpeechConfig()) {
    try {
      return await transcribeWithSpeechProvider(file)
    } catch {
      if (process.env.OPENAI_API_KEY) {
        return transcribeWithOpenAI(file, fallbackTranscript)
      }
      if (resolveFoundryConfig()) {
        try {
          return await transcribeWithFoundryProvider(file)
        } catch {
          return demoResult(fallbackTranscript, 0.82)
        }
      }
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  if (process.env.OPENAI_API_KEY) {
    return transcribeWithOpenAI(file, fallbackTranscript)
  }

  if (resolveFoundryConfig()) {
    try {
      return await transcribeWithFoundryProvider(file)
    } catch {
      return demoResult(fallbackTranscript, 0.82)
    }
  }

  return demoResult(fallbackTranscript)
}
