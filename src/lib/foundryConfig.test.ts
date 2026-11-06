import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AZURE_SPEECH_DEFAULT_API_VERSION,
  AZURE_SPEECH_DEFAULT_MODEL,
  FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT,
  buildAzureSpeechTranscribeUrl,
  buildFoundryAudioTranscriptionUrl,
  buildFoundryChatCompletionsUrl,
  normalizeAzureSpeechModel,
  resolveAzureSpeechConfig,
  resolveFoundryConfig,
  resolveTranscriptionProviderPreference,
} from '@/lib/foundryConfig'

test('normalizeAzureSpeechModel maps AgileBoard ids to API names', () => {
  assert.equal(normalizeAzureSpeechModel('mai-transcribe-1.5'), 'MAI-Transcribe-1.5')
  assert.equal(normalizeAzureSpeechModel(' MAI-Transcribe-1.5 '), 'MAI-Transcribe-1.5')
  assert.equal(normalizeAzureSpeechModel('mai-transcribe-2'), 'MAI-Transcribe-2')
})

test('resolveAzureSpeechConfig returns null without endpoint or key', () => {
  assert.equal(resolveAzureSpeechConfig({}), null)
  assert.equal(
    resolveAzureSpeechConfig({
      AZURE_SPEECH_ENDPOINT: 'https://eastus.api.cognitive.microsoft.com/',
    }),
    null
  )
})

test('resolveAzureSpeechConfig accepts SPEECH_* aliases and defaults model', () => {
  const config = resolveAzureSpeechConfig({
    SPEECH_ENDPOINT: 'https://eastus.api.cognitive.microsoft.com/',
    SPEECH_API_KEY: 'speech-key',
    AZURE_SPEECH_TRANSCRIPTION_MODEL: 'mai-transcribe-1.5',
  })

  assert.ok(config)
  assert.equal(config.endpoint, 'https://eastus.api.cognitive.microsoft.com')
  assert.equal(config.apiKey, 'speech-key')
  assert.equal(config.model, AZURE_SPEECH_DEFAULT_MODEL)
  assert.equal(config.apiVersion, AZURE_SPEECH_DEFAULT_API_VERSION)
  assert.equal(
    buildAzureSpeechTranscribeUrl(config),
    'https://eastus.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=2025-10-15'
  )
})

test('resolveFoundryConfig defaults cleanup to DeepSeek-V4-Pro', () => {
  const config = resolveFoundryConfig({
    AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com',
    AZURE_FOUNDRY_API_KEY: 'test-key',
  })

  assert.ok(config)
  assert.equal(config.cleanupDeployment, FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT)
  assert.equal(config.cleanupEnabled, false)
  assert.equal(config.apiVersion, '2024-06-01')
  assert.equal(
    buildFoundryChatCompletionsUrl(config.endpoint, config.apiVersion),
    'https://example.openai.azure.com/openai/v1/chat/completions?api-version=2024-06-01'
  )
  assert.equal(
    buildFoundryAudioTranscriptionUrl(config.endpoint),
    'https://example.openai.azure.com/openai/v1/audio/transcriptions'
  )
})

test('resolveTranscriptionProviderPreference maps speech aliases', () => {
  assert.equal(resolveTranscriptionProviderPreference({}), 'auto')
  assert.equal(resolveTranscriptionProviderPreference({ TRANSCRIPTION_PROVIDER: 'speech' }), 'speech')
  assert.equal(
    resolveTranscriptionProviderPreference({ TRANSCRIPTION_PROVIDER: 'azure-speech' }),
    'speech'
  )
  assert.equal(resolveTranscriptionProviderPreference({ TRANSCRIPTION_PROVIDER: 'openai' }), 'openai')
})
