import test from 'node:test'
import assert from 'node:assert/strict'

import { extractVotesFromTranscript, mergeExtractedVotes } from '@/lib/transcriptExtraction'

test('extractVotesFromTranscript parses announced vote statements', () => {
  const votes = extractVotesFromTranscript(
    'Mary Wambui has received 245 votes. John Kariuki got 189 votes.'
  )

  assert.deepEqual(votes, [
    { candidate_name: 'Mary Wambui', votes: 245, confidence: 0.85 },
    { candidate_name: 'John Kariuki', votes: 189, confidence: 0.85 },
  ])
})

test('mergeExtractedVotes keeps the latest value for the same candidate', () => {
  const merged = mergeExtractedVotes(
    [{ candidate_name: 'Mary Wambui', votes: 245, confidence: 0.72 }],
    [{ candidate_name: 'Mary Wambui', votes: 248, confidence: 0.9 }]
  )

  assert.deepEqual(merged, [
    { candidate_name: 'Mary Wambui', votes: 248, confidence: 0.9 },
  ])
})

test('extractVotesFromTranscript ignores narration phrases before candidate names', () => {
  const votes = extractVotesFromTranscript(
    'The Returning Officer is now announcing the final results for Westlands Constituency. John Kariuki received 14,523 votes.'
  )

  assert.deepEqual(votes, [
    { candidate_name: 'John Kariuki', votes: 14523, confidence: 0.85 },
  ])
})
