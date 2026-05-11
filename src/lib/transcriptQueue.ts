export interface TranscriptChunkJob {
  id: string
  station_code: string
  agent_id: string
  session_id: string
  chunk_index: number
  mime_type: string
  sample_id?: string
  started_at: number
  ended_at: number
}

const activeChunks = new Map<string, Set<number>>()

export function canProcessChunk(sessionId: string, chunkIndex: number) {
  const current = activeChunks.get(sessionId) ?? new Set<number>()
  if (current.has(chunkIndex)) {
    return false
  }
  current.add(chunkIndex)
  activeChunks.set(sessionId, current)
  return true
}

export function completeChunk(sessionId: string, chunkIndex: number) {
  const current = activeChunks.get(sessionId)
  if (!current) {
    return
  }
  current.delete(chunkIndex)
  if (current.size === 0) {
    activeChunks.delete(sessionId)
  }
}
