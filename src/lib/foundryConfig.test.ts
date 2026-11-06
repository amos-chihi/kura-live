import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT,
  FOUNDRY_DEFAULT_TRANSCRIPTION_DEPLOYMENT,
  buildFoundryAudioTranscriptionUrl,
  buildFoundryChatCompletionsUrl,
  resolveFoundryConfig,
  resolveTranscriptionProviderPreference,
} from '@/lib/foundryConfig'

test('resolveFoundryConfig returns null without endpoint or key', () => {
  assert.equal(resolveFoundryConfig({}), null)
  assert.equal(
    resolveFoundryConfig({
      AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com/openai/v1',
    }),
    null
  )
})

test('resolveFoundryConfig accepts AZURE_FOUNDRY_* aliases and defaults deployment', () => {
  const config = resolveFoundryConfig({
    AZURE_FOUNDRY_ENDPOINT: 'https://example.openai.azure.com/openai/v1/',
    AZURE_FOUNDRY_API_KEY: 'test-key',
  })

  assert.ok(config)
  assert.equal(config.endpoint, 'https://example.openai.azure.com/openai/v1')
  assert.equal(config.apiKey, 'test-key')
  assert.equal(config.transcriptionDeployment, FOUNDRY_DEFAULT_TRANSCRIPTION_DEPLOYMENT)
  assert.equal(config.cleanupDeployment, FOUNDRY_DEFAULT_CLEANUP_DEPLOYMENT)
  assert.equal(config.cleanupEnabled, false)
})

test('resolveFoundryConfig accepts AZURE_OPENAI_* aliases and custom deployments', () => {
  const config = resolveFoundryConfig({
    AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
    AZURE_OPENAI_API_KEY: 'openai-key',
    AZURE_OPENAI_TRANSCRIPTION_DEPLOYMENT: 'whisper',
    AZURE_FOUNDRY_CLEANUP_DEPLOYMENT: 'DeepSeek-V4-Pro',
    AZURE_FOUNDRY_TRANSCRIPT_CLEANUP: 'true',
  })

  assert.ok(config)
  assert.equal(config.transcriptionDeployment, 'whisper')
  assert.equal(config.cleanupDeployment, 'DeepSeek-V4-Pro')
  assert.equal(config.cleanupEnabled, true)
  assert.equal(
    buildFoundryAudioTranscriptionUrl(config.endpoint),
    'https://example.openai.azure.com/openai/v1/audio/transcriptions'
  )
  assert.equal(
    buildFoundryChatCompletionsUrl(config.endpoint),
    'https://example.openai.azure.com/openai/v1/chat/completions'
  )
})

test('buildFoundryAudioTranscriptionUrl handles /openai/v1 endpoints', () => {
  assert.equal(
    buildFoundryAudioTranscriptionUrl('https://example.openai.azure.com/openai/v1'),
    'https://example.openai.azure.com/openai/v1/audio/transcriptions'
  )
})

test('resolveTranscriptionProviderPreference defaults to auto', () => {
  assert.equal(resolveTranscriptionProviderPreference({}), 'auto')
  assert.equal(resolveTranscriptionProviderPreference({ TRANSCRIPTION_PROVIDER: 'foundry' }), 'foundry')
  assert.equal(resolveTranscriptionProviderPreference({ TRANSCRIPTION_PROVIDER: 'OPENAI' }), 'openai')
})
