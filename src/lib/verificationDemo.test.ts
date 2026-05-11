import test from 'node:test'
import assert from 'node:assert/strict'

import { buildComparisonRows, buildVerificationStats } from '@/lib/verificationDemo'
import type { TallyEntry } from '@/lib/types'

const tallies: TallyEntry[] = [
  {
    id: 'a1',
    station_code: 'KE-047-290-0001',
    agent_id: 'agent-001',
    candidate_name: 'Mary Wambui',
    party: 'ODM',
    audio_votes: 245,
    form34a_votes: null,
    iebc_votes: null,
    max_delta: 0,
    status: 'pending',
    confidence: 0.9,
    source: 'audio_ai',
    created_at: '2027-01-01T00:00:00.000Z',
    updated_at: '2027-01-01T00:00:00.000Z',
  },
  {
    id: 'f1',
    station_code: 'KE-047-290-0001',
    agent_id: 'agent-001',
    candidate_name: 'Mary Wambui',
    party: 'ODM',
    audio_votes: null,
    form34a_votes: 246,
    iebc_votes: null,
    max_delta: 0,
    status: 'pending',
    confidence: 0.97,
    source: 'form34a_votes',
    created_at: '2027-01-01T00:00:00.000Z',
    updated_at: '2027-01-01T00:00:00.000Z',
  },
]

test('buildComparisonRows merges tallies across sources and flags discrepancies', () => {
  const rows = buildComparisonRows(tallies, 'KE-047-290-0001')

  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.candidate_name, 'Mary Wambui')
  assert.equal(rows[0]?.max_delta, 1)
  assert.equal(rows[0]?.status, 'discrepancy')
})

test('buildVerificationStats counts status buckets', () => {
  const stats = buildVerificationStats([
    {
      station_code: 'A',
      agent_id: null,
      candidate_name: 'One',
      party: null,
      audio_votes: 1,
      form34a_votes: 1,
      iebc_votes: 1,
      max_delta: 0,
      status: 'match',
      confidence: 0.9,
    },
    {
      station_code: 'A',
      agent_id: null,
      candidate_name: 'Two',
      party: null,
      audio_votes: 1,
      form34a_votes: 2,
      iebc_votes: null,
      max_delta: 1,
      status: 'discrepancy',
      confidence: 0.9,
    },
  ])

  assert.deepEqual(stats, {
    total_candidates: 2,
    matching: 1,
    discrepancies: 1,
    pending: 0,
  })
})
