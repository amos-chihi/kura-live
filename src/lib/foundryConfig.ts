/**
 * Transcription provider configuration (Azure Speech + Foundry/OpenAI helpers).
 * Secrets come from env only — never hard-code keys.
 */

export type TranscriptionProviderName = 'speech' | 'openai' | 'foundry' | 'demo'

/** Default Azure Speech MAI-Transcribe model (AgileBoard-compatible). */
export const AZURE_SPEECH_DEFAULT_MODEL = 'MAI-Transcribe-1.5'

/** Fast transcription API version used by MAI-Transcribe. */
export const AZURE_SPEECH_DEFAULT_API_VERSION = '2025-10-15'

/** Optional LLM cleanup on Azure OpenAI / Foundry (AgileBoard uses DeepSeek-V4-Pro). */
export const FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT = 'DeepSeek-V4-Pro'

/** Azure OpenAI API version when using deployment-style chat completions. */
export const FOUNDRY_DEFAULT_API_VERSION = '2024-06-01'

/** Legacy optional Foundry OpenAI-compatible STT deployments (demoted fallback). */
export const FOUNDRY_RECOMMENDED_TRANSCRIPTION_DEPLOYMENTS = [
  'gpt-4o-mini-transcribe',
  'gpt-4o-transcribe',
  'whisper',
] as const

export const FOUNDRY_DEFAULT_TRANSCRIPTION_DEPLOYMENT = 'gpt-4o-mini-transcribe'

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) {
      return trimmed
    }
  }
  return undefined
}

function normalizeEndpoint(raw: string): string {
  return raw.replace(/\/+$/, '')
}

/** Normalize AgileBoard-style ids (`mai-transcribe-1.5`) to API model names. */
export function normalizeAzureSpeechModel(raw: string): string {
  const trimmed = raw.trim()
  const key = trimmed.toLowerCase().replace(/_/g, '-')
  if (key === 'mai-transcribe-1.5' || key === 'maitranscribe-1.5') {
    return 'MAI-Transcribe-1.5'
  }
  if (key === 'mai-transcribe-2' || key === 'maitranscribe-2') {
    return 'MAI-Transcribe-2'
  }
  if (key === 'mai-transcribe-1' || key === 'maitranscribe-1') {
    return 'MAI-Transcribe-1'
  }
  return trimmed
}

export interface AzureSpeechTranscriptionConfig {
  endpoint: string
  apiKey: string
  model: string
  apiVersion: string
}

export interface FoundryTranscriptionConfig {
  endpoint: string
  apiKey: string
  apiVersion: string
  /** Optional OpenAI-compatible STT deployment (demoted; Speech is preferred). */
  transcriptionDeployment: string
  /** Chat deployment for optional post-STT cleanup */
  cleanupDeployment: string
  cleanupEnabled: boolean
}

export function resolveAzureSpeechConfig(
  env: NodeJS.ProcessEnv = process.env
): AzureSpeechTranscriptionConfig | null {
  const endpoint = firstNonEmpty(
    env.AZURE_SPEECH_ENDPOINT,
    env.SPEECH_ENDPOINT
  )
  const apiKey = firstNonEmpty(
    env.AZURE_SPEECH_API_KEY,
    env.SPEECH_API_KEY
  )

  if (!endpoint || !apiKey) {
    return null
  }

  const model = normalizeAzureSpeechModel(
    firstNonEmpty(
      env.AZURE_SPEECH_TRANSCRIPTION_MODEL,
      env.SPEECH_TRANSCRIPTION_MODEL,
      env.AZURE_SPEECH_MODEL,
      AZURE_SPEECH_DEFAULT_MODEL
    )!
  )

  const apiVersion = firstNonEmpty(
    env.AZURE_SPEECH_API_VERSION,
    env.SPEECH_API_VERSION,
    AZURE_SPEECH_DEFAULT_API_VERSION
  )!

  return {
    endpoint: normalizeEndpoint(endpoint),
    apiKey,
    model,
    apiVersion,
  }
}

export function resolveFoundryConfig(
  env: NodeJS.ProcessEnv = process.env
): FoundryTranscriptionConfig | null {
  const endpoint = firstNonEmpty(
    env.AZURE_FOUNDRY_ENDPOINT,
    env.AZURE_OPENAI_ENDPOINT
  )
  const apiKey = firstNonEmpty(
    env.AZURE_FOUNDRY_API_KEY,
    env.AZURE_OPENAI_API_KEY
  )

  if (!endpoint || !apiKey) {
    return null
  }

  const transcriptionDeployment = firstNonEmpty(
    env.AZURE_FOUNDRY_TRANSCRIPTION_DEPLOYMENT,
    env.AZURE_OPENAI_TRANSCRIPTION_DEPLOYMENT,
    env.AZURE_FOUNDRY_DEPLOYMENT,
    env.AZURE_OPENAI_DEPLOYMENT,
    FOUNDRY_DEFAULT_TRANSCRIPTION_DEPLOYMENT
  )!

  const cleanupDeployment = firstNonEmpty(
    env.AZURE_FOUNDRY_CLEANUP_DEPLOYMENT,
    env.AZURE_OPENAI_CLEANUP_DEPLOYMENT,
    FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT
  )!

  const cleanupFlag = firstNonEmpty(
    env.AZURE_FOUNDRY_TRANSCRIPT_CLEANUP,
    env.AZURE_OPENAI_TRANSCRIPT_CLEANUP
  )
  const cleanupEnabled =
    cleanupFlag === '1' || cleanupFlag?.toLowerCase() === 'true'

  const apiVersion = firstNonEmpty(
    env.AZURE_FOUNDRY_API_VERSION,
    env.AZURE_OPENAI_API_VERSION,
    FOUNDRY_DEFAULT_API_VERSION
  )!

  return {
    endpoint: normalizeEndpoint(endpoint),
    apiKey,
    apiVersion,
    transcriptionDeployment,
    cleanupDeployment,
    cleanupEnabled,
  }
}

export function resolveTranscriptionProviderPreference(
  env: NodeJS.ProcessEnv = process.env
): 'auto' | TranscriptionProviderName {
  const raw = env.TRANSCRIPTION_PROVIDER?.trim().toLowerCase()
  if (raw === 'speech' || raw === 'azure-speech' || raw === 'azure_speech') {
    return 'speech'
  }
  if (raw === 'foundry' || raw === 'openai' || raw === 'demo') {
    return raw
  }
  return 'auto'
}

export function buildAzureSpeechTranscribeUrl(
  config: Pick<AzureSpeechTranscriptionConfig, 'endpoint' | 'apiVersion'>
): string {
  const base = normalizeEndpoint(config.endpoint)
  return `${base}/speechtotext/transcriptions:transcribe?api-version=${encodeURIComponent(config.apiVersion)}`
}

export function buildFoundryAudioTranscriptionUrl(endpoint: string): string {
  const base = normalizeEndpoint(endpoint)
  if (base.endsWith('/openai/v1') || base.endsWith('/v1')) {
    return `${base}/audio/transcriptions`
  }
  return `${base}/openai/v1/audio/transcriptions`
}

/**
 * Chat completions URL for optional transcript cleanup.
 * Prefers OpenAI-compatible `/openai/v1/chat/completions` on the resource root.
 */
export function buildFoundryChatCompletionsUrl(
  endpoint: string,
  apiVersion = FOUNDRY_DEFAULT_API_VERSION
): string {
  const base = normalizeEndpoint(endpoint)
  if (base.endsWith('/openai/v1') || base.endsWith('/v1')) {
    return `${base}/chat/completions`
  }
  // Bare Cognitive/OpenAI resource host — v1 path mirrors AgileBoard OpenAI export.
  return `${base}/openai/v1/chat/completions?api-version=${encodeURIComponent(apiVersion)}`
}
