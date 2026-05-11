export interface CapturedAudioChunk {
  id: string
  blob: Blob
  started_at: number
  ended_at: number
  mime_type: string
}

export function createAudioChunk(blob: Blob, startedAt: number, endedAt: number): CapturedAudioChunk {
  return {
    id: crypto.randomUUID(),
    blob,
    started_at: startedAt,
    ended_at: endedAt,
    mime_type: blob.type || 'audio/webm',
  }
}

export function estimateBitrateKbps(chunk: CapturedAudioChunk) {
  const durationSeconds = Math.max((chunk.ended_at - chunk.started_at) / 1000, 1)
  return Math.round((chunk.blob.size * 8) / 1024 / durationSeconds)
}
