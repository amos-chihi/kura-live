import { VOTE_EXTRACTION_REGEX } from '@/lib/constants'

export interface ExtractedVote {
  candidate_name: string
  votes: number
  confidence?: number
}

const EXTRACTION_PATTERNS = [
  VOTE_EXTRACTION_REGEX,
  /([A-Za-z][A-Za-z\s'.-]+?)\s+(?:has\s+)?(?:received|got)\s+([\d,]+)\s+votes?/i,
  /([A-Za-z][A-Za-z\s'.-]+?)\s+is\s+at\s+([\d,]+)\s+votes?/i,
  /([A-Za-z][A-Za-z\s'.-]+?)\s*[:,-]\s*([\d,]+)\s+votes?/i,
]

function normalizeCandidateName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
}

function isPlausibleCandidateName(value: string) {
  const words = value.split(' ').filter(Boolean)
  if (words.length < 2 || words.length > 4) {
    return false
  }

  const lowered = value.toLowerCase()
  if (lowered.includes('returning officer') || lowered.includes('polling station')) {
    return false
  }

  return !/[.:]/.test(value)
}

function normalizeTranscript(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\buh\b|\bum\b/gi, '')
    .trim()
}

export function extractVotesFromTranscript(text: string, confidence = 0.85): ExtractedVote[] {
  const normalizedText = normalizeTranscript(text)
  if (!normalizedText) {
    return []
  }

  const extracted = new Map<string, ExtractedVote>()
  const segments = normalizedText
    .split(/[.!?\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  for (const segment of segments) {
    for (const pattern of EXTRACTION_PATTERNS) {
      const matches = Array.from(
        segment.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))
      )

      for (const match of matches) {
        const candidateName = normalizeCandidateName(match[1] ?? '')
        const numericVotes = Number.parseInt((match[2] ?? '').replace(/,/g, ''), 10)

        if (!candidateName || !isPlausibleCandidateName(candidateName) || Number.isNaN(numericVotes)) {
          continue
        }

        extracted.set(candidateName.toLowerCase(), {
          candidate_name: candidateName,
          votes: numericVotes,
          confidence,
        })
      }
    }
  }

  return Array.from(extracted.values())
}

export function mergeExtractedVotes(existing: ExtractedVote[], incoming: ExtractedVote[]) {
  const merged = new Map<string, ExtractedVote>()

  for (const vote of existing) {
    merged.set(vote.candidate_name.toLowerCase(), vote)
  }

  for (const vote of incoming) {
    const key = vote.candidate_name.toLowerCase()
    const current = merged.get(key)

    if (!current || current.votes !== vote.votes || (vote.confidence ?? 0) >= (current.confidence ?? 0)) {
      merged.set(key, vote)
    }
  }

  return Array.from(merged.values()).sort((left, right) => right.votes - left.votes)
}
