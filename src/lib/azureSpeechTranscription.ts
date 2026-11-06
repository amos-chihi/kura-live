import {
  buildAzureSpeechTranscribeUrl,
  type AzureSpeechTranscriptionConfig,
} from '@/lib/foundryConfig'

export class AzureSpeechTranscriptionError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'AzureSpeechTranscriptionError'
    this.status = status
    this.code = code
  }
}

interface SpeechPhrase {
  text?: string
}

interface SpeechTranscriptionPayload {
  durationMilliseconds?: number
  duration?: number
  combinedPhrases?: SpeechPhrase[]
  phrases?: SpeechPhrase[]
  error?: { code?: string; message?: string }
  code?: string
  message?: string
}

function extractTranscriptText(payload: SpeechTranscriptionPayload): string {
  const fromCombined = (payload.combinedPhrases ?? [])
    .map((phrase) => phrase.text?.trim() ?? '')
    .filter(Boolean)
    .join(' ')
    .trim()
  if (fromCombined) {
    return fromCombined
  }

  return (payload.phrases ?? [])
    .map((phrase) => phrase.text?.trim() ?? '')
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Azure Speech Fast Transcription with MAI-Transcribe (AgileBoard-compatible).
 * Sync multipart API — good fit for 8s live chunks and file uploads.
 *
 * POST {endpoint}/speechtotext/transcriptions:transcribe?api-version=…
 * definition.enhancedMode.model = MAI-Transcribe-1.5
 */
export async function transcribeWithAzureSpeech(
  file: File,
  config: AzureSpeechTranscriptionConfig
): Promise<string> {
  const form = new FormData()
  form.append('audio', file, file.name || 'audio.webm')
  form.append(
    'definition',
    JSON.stringify({
      enhancedMode: {
        enabled: true,
        model: config.model,
      },
    })
  )

  const response = await fetch(buildAzureSpeechTranscribeUrl(config), {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': config.apiKey,
      Accept: 'application/json',
    },
    body: form,
  })

  let payload: SpeechTranscriptionPayload = {}
  try {
    payload = (await response.json()) as SpeechTranscriptionPayload
  } catch {
    payload = {}
  }

  if (!response.ok) {
    const code = payload.error?.code ?? payload.code
    const message =
      payload.error?.message ??
      payload.message ??
      `Azure Speech transcription failed (${response.status}) for model "${config.model}"`
    throw new AzureSpeechTranscriptionError(message, response.status, code)
  }

  // Empty string is a valid result (e.g. silence); callers decide on demo fallback.
  return extractTranscriptText(payload)
}
