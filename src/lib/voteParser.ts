import { matchCandidateName } from '@/lib/candidateMatcher'

export interface ParsedVote {
  candidate_name: string
  party: string | null
  votes: number
  confidence: number
  source_text: string
  rejected_votes?: number
}

const ANNOUNCEMENT_PATTERNS = [
  /([A-Za-z][A-Za-z\s'.-]+?)\s+(?:has\s+received|received|got|has|is\s+at)\s+([\d,]+)\s+votes?/gi,
  /([A-Za-z][A-Za-z\s'.-]+?)\s+amepata\s+kura\s+([\d,]+)/gi,
  /kura\s+za\s+([A-Za-z][A-Za-z\s'.-]+?)\s+ni\s+([\d,]+)/gi,
]

const REJECTED_PATTERNS = [
  /rejected\s+votes?\s+(?:ni|are|were|stood\s+at)?\s*([\d,]+)/i,
  /kura\s+zilizoharibika\s+ni\s+([\d,]+)/i,
]

function toNumeric(value: string) {
  return Number.parseInt(value.replace(/,/g, ''), 10)
}

export function parseVotesFromTranscript(text: string) {
  const parsedVotes: ParsedVote[] = []
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return parsedVotes
  }

  for (const pattern of ANNOUNCEMENT_PATTERNS) {
    let match: RegExpExecArray | null
    pattern.lastIndex = 0

    while ((match = pattern.exec(normalized)) !== null) {
      const rawName = match[1]?.trim()
      const rawVotes = match[2]?.trim()

      if (!rawName || !rawVotes) {
        continue
      }

      const votes = toNumeric(rawVotes)
      if (Number.isNaN(votes)) {
        continue
      }

      const candidateMatch = matchCandidateName(rawName)
      parsedVotes.push({
        candidate_name: candidateMatch.candidate_name,
        party: candidateMatch.party,
        votes,
        confidence: candidateMatch.confidence,
        source_text: match[0],
      })
    }
  }

  for (const pattern of REJECTED_PATTERNS) {
    const match = normalized.match(pattern)
    const rejectedVotes = match?.[1] ? toNumeric(match[1]) : null
    if (rejectedVotes !== null && !Number.isNaN(rejectedVotes)) {
      parsedVotes.push({
        candidate_name: 'Rejected Votes',
        party: null,
        votes: rejectedVotes,
        rejected_votes: rejectedVotes,
        confidence: 0.92,
        source_text: match?.[0] ?? '',
      })
      break
    }
  }

  const unique = new Map<string, ParsedVote>()
  for (const vote of parsedVotes) {
    const key = vote.candidate_name.toLowerCase()
    const existing = unique.get(key)
    if (!existing || vote.confidence >= existing.confidence) {
      unique.set(key, vote)
    }
  }

  return Array.from(unique.values())
}
