/**
 * Microsoft Foundry / Azure OpenAI transcription configuration.
 * Secrets come from env only — never hard-code keys.
 */

export type TranscriptionProviderName = 'foundry' | 'openai' | 'demo'

/** Recommended STT deployments to create on the Foundry resource. */
export const FOUNDRY_RECOMMENDED_TRANSCRIPTION_DEPLOYMENTS = [
  'gpt-4o-mini-transcribe',
  'gpt-4o-transcribe',
  'whisper',
] as const

/** Default STT deployment name when env is unset (must exist on the resource). */
export const FOUNDRY_DEFAULT_TRANSCRIPTION_DEPLOYMENT = 'gpt-4o-mini-transcribe'

/** Optional LLM for light transcript cleanup / vote-language normalization. */
export const FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT = 'Llama-3.3-70B-Instruct'

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

export interface FoundryTranscriptionConfig {
  endpoint: string
  apiKey: string
  /** Deployment / model id passed as `model` to /audio/transcriptions */
  transcriptionDeployment: string
  /** Optional chat deployment for post-STT cleanup */
  cleanupDeployment: string
  cleanupEnabled: boolean
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

  return {
    endpoint: normalizeEndpoint(endpoint),
    apiKey,
    transcriptionDeployment,
    cleanupDeployment,
    cleanupEnabled,
  }
}

export function resolveTranscriptionProviderPreference(
  env: NodeJS.ProcessEnv = process.env
): 'auto' | TranscriptionProviderName {
  const raw = env.TRANSCRIPTION_PROVIDER?.trim().toLowerCase()
  if (raw === 'foundry' || raw === 'openai' || raw === 'demo') {
    return raw
  }
  return 'auto'
}

export function buildFoundryAudioTranscriptionUrl(endpoint: string): string {
  const base = normalizeEndpoint(endpoint)
  // Supports both `…/openai/v1` and bare resource roots.
  if (base.endsWith('/openai/v1') || base.endsWith('/v1')) {
    return `${base}/audio/transcriptions`
  }
  return `${base}/openai/v1/audio/transcriptions`
}

export function buildFoundryChatCompletionsUrl(endpoint: string): string {
  const base = normalizeEndpoint(endpoint)
  if (base.endsWith('/openai/v1') || base.endsWith('/v1')) {
    return `${base}/chat/completions`
  }
  return `${base}/openai/v1/chat/completions`
}
