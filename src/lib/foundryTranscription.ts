import {
  buildFoundryAudioTranscriptionUrl,
  buildFoundryChatCompletionsUrl,
  type FoundryTranscriptionConfig,
} from '@/lib/foundryConfig'

export class FoundryTranscriptionError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'FoundryTranscriptionError'
    this.status = status
    this.code = code
  }
}

interface TranscriptionApiPayload {
  text?: string
  error?: { message?: string; code?: string; type?: string }
}

/**
 * Optional Azure OpenAI / Foundry `/audio/transcriptions` path (demoted).
 * Prefer Azure Speech MAI-Transcribe for STT; keep this for compatibility.
 */
export async function transcribeWithFoundry(
  file: File,
  config: FoundryTranscriptionConfig
): Promise<string> {
  const form = new FormData()
  form.append('file', file, file.name || 'audio.webm')
  form.append('model', config.transcriptionDeployment)
  form.append('response_format', 'json')

  const response = await fetch(buildFoundryAudioTranscriptionUrl(config.endpoint), {
    method: 'POST',
    headers: {
      'api-key': config.apiKey,
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: form,
  })

  let payload: TranscriptionApiPayload = {}
  try {
    payload = (await response.json()) as TranscriptionApiPayload
  } catch {
    payload = {}
  }

  if (!response.ok) {
    const code = payload.error?.code
    const message =
      payload.error?.message ??
      `Foundry transcription failed (${response.status}) for deployment "${config.transcriptionDeployment}"`
    throw new FoundryTranscriptionError(message, response.status, code)
  }

  const text = payload.text?.trim()
  if (!text) {
    throw new FoundryTranscriptionError(
      'Foundry transcription returned an empty transcript',
      response.status
    )
  }

  return text
}

/**
 * Optional light cleanup of noisy STT output via a Foundry chat deployment.
 * Disabled by default — enable with AZURE_FOUNDRY_TRANSCRIPT_CLEANUP=true.
 * Default deployment: DeepSeek-V4-Pro (AgileBoard).
 */
export async function cleanupTranscriptWithFoundry(
  transcript: string,
  config: FoundryTranscriptionConfig
): Promise<string> {
  if (!config.cleanupEnabled || !transcript.trim()) {
    return transcript
  }

  const response = await fetch(
    buildFoundryChatCompletionsUrl(config.endpoint, config.apiVersion),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.cleanupDeployment.trim(),
        temperature: 0,
        max_tokens: 512,
        messages: [
          {
            role: 'system',
            content:
              'You clean election announcement speech-to-text. Fix obvious ASR errors, keep candidate names and vote numbers exact, preserve English/Swahili wording, and return only the cleaned transcript with no commentary.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    return transcript
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const cleaned = payload.choices?.[0]?.message?.content?.trim()
  return cleaned || transcript
}
