import test from 'node:test'
import assert from 'node:assert/strict'

import { parseVotesFromTranscript } from '@/lib/voteParser'

test('parseVotesFromTranscript extracts English and Swahili tallies', () => {
  const result = parseVotesFromTranscript(
    'John Kariuki received 120 votes. Mary Wambui amepata kura 115. Rejected votes ni 3.'
  )

  assert.equal(result.find((entry) => entry.candidate_name === 'John Kariuki')?.votes, 120)
  assert.equal(result.find((entry) => entry.candidate_name === 'Mary Wambui')?.votes, 115)
  assert.equal(result.find((entry) => entry.candidate_name === 'Rejected Votes')?.votes, 3)
})
