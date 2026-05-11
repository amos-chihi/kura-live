export interface CandidateAlias {
  canonical_name: string
  party?: string | null
  aliases: string[]
}

const DEFAULT_CANDIDATES: CandidateAlias[] = [
  {
    canonical_name: 'John Kariuki',
    party: 'UDA',
    aliases: ['john kariuki', 'john', 'kariuki', 'bwana kariuki'],
  },
  {
    canonical_name: 'Mary Wambui',
    party: 'ODM',
    aliases: ['mary wambui', 'mary', 'wambui', 'bi wambui'],
  },
  {
    canonical_name: 'Peter Omondi',
    party: 'ANC',
    aliases: ['peter omondi', 'peter', 'omondi', 'bwana omondi'],
  },
  {
    canonical_name: 'Grace Akinyi',
    party: 'WDM-K',
    aliases: ['grace akinyi', 'grace', 'akinyi', 'bi akinyi'],
  },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(left: string, right: string) {
  const rows = left.length + 1
  const cols = right.length + 1
  const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      )
    }
  }

  return matrix[rows - 1][cols - 1]
}

export interface CandidateMatch {
  candidate_name: string
  party: string | null
  confidence: number
}

export function matchCandidateName(rawName: string, candidates: CandidateAlias[] = DEFAULT_CANDIDATES): CandidateMatch {
  const normalizedRaw = normalize(rawName)
  let bestMatch: CandidateMatch = {
    candidate_name: rawName.trim(),
    party: null,
    confidence: 0.45,
  }

  for (const candidate of candidates) {
    for (const alias of candidate.aliases) {
      const normalizedAlias = normalize(alias)
      const distance = levenshtein(normalizedRaw, normalizedAlias)
      const maxLength = Math.max(normalizedRaw.length, normalizedAlias.length, 1)
      const confidence = 1 - distance / maxLength

      if (
        normalizedRaw === normalizedAlias ||
        normalizedRaw.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedRaw)
      ) {
        return {
          candidate_name: candidate.canonical_name,
          party: candidate.party ?? null,
          confidence: 0.99,
        }
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          candidate_name: candidate.canonical_name,
          party: candidate.party ?? null,
          confidence,
        }
      }
    }
  }

  return bestMatch
}

export function getDefaultCandidateAliases() {
  return DEFAULT_CANDIDATES
}
