import { z } from 'zod'

export const liveSessionSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  station_code: z.string(),
  platform: z.enum(['tiktok', 'youtube', 'rtmp', 'browser', 'microphone']),
  source_url: z.string().url(),
  status: z.enum(['idle', 'monitoring', 'reconnecting', 'ended', 'error']),
  started_at: z.string(),
  updated_at: z.string(),
  viewer_count: z.number().int().nonnegative().default(0),
  bitrate_kbps: z.number().nonnegative().default(0),
  latency_ms: z.number().nonnegative().default(0),
  health: z.enum(['healthy', 'degraded', 'offline']).default('healthy'),
  last_error: z.string().nullable().default(null),
})

export type LiveSession = z.infer<typeof liveSessionSchema>

export function createLiveSession(input: {
  agent_id: string
  station_code: string
  source_url: string
  platform: LiveSession['platform']
}) {
  const now = new Date().toISOString()
  return liveSessionSchema.parse({
    id: crypto.randomUUID(),
    status: 'monitoring',
    started_at: now,
    updated_at: now,
    viewer_count: 0,
    bitrate_kbps: 0,
    latency_ms: 0,
    health: 'healthy',
    last_error: null,
    ...input,
  })
}
