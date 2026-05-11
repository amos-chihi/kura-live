import { z } from 'zod'

export const streamRegistrationSchema = z.object({
  agent_id: z.string().min(1),
  station_code: z.string().min(1),
  source_url: z.string().url(),
  platform: z.enum(['tiktok', 'youtube', 'rtmp', 'browser', 'microphone']),
})

export function inferStreamPlatform(url: string): 'tiktok' | 'youtube' | 'rtmp' | 'browser' {
  const normalized = url.toLowerCase()
  if (normalized.startsWith('rtmp://') || normalized.startsWith('rtmps://')) {
    return 'rtmp'
  }
  if (normalized.includes('tiktok.com')) {
    return 'tiktok'
  }
  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) {
    return 'youtube'
  }
  return 'browser'
}

export function estimateStreamHealth(input: { bitrateKbps: number; latencyMs: number; hasAudio: boolean }) {
  if (!input.hasAudio) {
    return 'offline' as const
  }
  if (input.bitrateKbps < 64 || input.latencyMs > 5000) {
    return 'degraded' as const
  }
  return 'healthy' as const
}
