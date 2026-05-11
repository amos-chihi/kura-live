import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { randomUUID, createHash } from 'node:crypto'

import {
  DEMO_AGENTS,
  DEMO_FORM_34A_DATA,
  DEMO_IEBC_DATA,
  DEMO_STATIONS,
  DEMO_TRANSCRIPT_LINES,
} from '@/lib/demo-data'
import type { Alert, FormUpload, TallyEntry } from '@/lib/types'
import type { ExtractedVote } from '@/lib/transcriptExtraction'
import { extractVotesFromTranscript } from '@/lib/transcriptExtraction'
import type { LiveSession } from '@/lib/liveSession'
import { createLiveSession } from '@/lib/liveSession'
import { buildDiscrepancyAlerts, buildVerificationEvents } from '@/lib/reconciliationEngine'

export type VerificationSource = 'audio_ai' | 'form34a_votes' | 'iebc_votes'

export interface CandidateResult {
  candidate_name: string
  party: string | null
  votes: number
}

export interface TranscriptRecord {
  id: string
  station_code: string
  agent_id: string | null
  sample_id: string
  source_label: string
  transcript_text: string
  extracted_votes: ExtractedVote[]
  created_at: string
}

export interface DemoAudioSample {
  id: string
  label: string
  station_code: string
  transcript_lines: string[]
  transcript_text: string
  description: string
}

export interface DemoFormSample {
  id: string
  label: string
  station_code: string
  preview_path: string
  extracted_results: CandidateResult[]
  total_valid_votes: number
  total_rejected_votes: number
  presiding_officer: string
}

export interface DemoIebcPayload {
  station_code: string
  results: CandidateResult[]
  last_updated: string
  source: string
}

export interface VerificationComparisonRow {
  station_code: string
  agent_id: string | null
  candidate_name: string
  party: string | null
  audio_votes: number | null
  form34a_votes: number | null
  iebc_votes: number | null
  max_delta: number
  status: 'pending' | 'match' | 'discrepancy'
  confidence: number
}

export interface VerificationStats {
  total_candidates: number
  matching: number
  discrepancies: number
  pending: number
}

export interface TranscriptSegmentRecord {
  id: string
  session_id: string
  station_code: string
  agent_id: string | null
  chunk_index: number
  transcript_text: string
  confidence: number
  created_at: string
}

export interface StationActivityRecord {
  id: string
  station_code: string
  activity_type: 'stream_started' | 'stream_updated' | 'transcript_received' | 'alert_generated' | 'verification_complete'
  message: string
  created_at: string
}

export interface VerificationEventRecord {
  id: string
  station_code: string
  candidate_name: string
  delta: number
  severity: Alert['severity']
  created_at: string
}

export interface VerificationDemoState {
  version: 1
  last_seeded_at: string
  demo_audio_samples: DemoAudioSample[]
  demo_form_samples: DemoFormSample[]
  demo_iebc_payloads: DemoIebcPayload[]
  live_sessions: LiveSession[]
  transcript_records: TranscriptRecord[]
  transcript_segments: TranscriptSegmentRecord[]
  form_uploads: FormUpload[]
  tally_entries: TallyEntry[]
  alerts: Alert[]
  station_activity: StationActivityRecord[]
  verification_events: VerificationEventRecord[]
}

const DATA_FILE = path.join(process.cwd(), 'data', 'verification-demo.json')
const SAMPLE_AGENT = DEMO_AGENTS[0]
const SAMPLE_STATION = DEMO_STATIONS[0]

function createAudioSample(id: string, label: string, transcriptLines: string[], description: string): DemoAudioSample {
  return {
    id,
    label,
    station_code: SAMPLE_STATION.station_code,
    transcript_lines: transcriptLines,
    transcript_text: transcriptLines.join(' '),
    description,
  }
}

function createFormSample(id: string, label: string, previewPath: string, voteDelta: number): DemoFormSample {
  const extractedResults = DEMO_FORM_34A_DATA.results.map((result) => ({
    candidate_name: result.candidate_name,
    party: result.party,
    votes: result.candidate_name === 'Mary Wambui' ? result.votes + voteDelta : result.votes,
  }))

  return {
    id,
    label,
    station_code: DEMO_FORM_34A_DATA.station_code,
    preview_path: previewPath,
    extracted_results: extractedResults,
    total_valid_votes: extractedResults.reduce((sum, result) => sum + result.votes, 0),
    total_rejected_votes: DEMO_FORM_34A_DATA.total_rejected_votes,
    presiding_officer: DEMO_FORM_34A_DATA.presiding_officer,
  }
}

export const DEMO_AUDIO_SAMPLES: DemoAudioSample[] = [
  createAudioSample(
    'audio-westlands-official',
    'Westlands RO final announcement',
    DEMO_TRANSCRIPT_LINES,
    'A clean returning-officer announcement with one-vote drift against Form 34A and IEBC.'
  ),
  createAudioSample(
    'audio-westlands-ward-recap',
    'Ward verification recap',
    [
      'Polling station Westlands Primary School Stream 1 verification is now starting.',
      'John Kariuki received 14,523 votes.',
      'Mary Wambui received 12,890 votes.',
      'Peter Omondi got 9,044 votes.',
      'Grace Akinyi got 3,210 votes.',
      'The station total valid votes stand at 39,667.',
    ],
    'A second audio sample with a larger discrepancy for Mary Wambui.'
  ),
]

export const DEMO_FORM_SAMPLES: DemoFormSample[] = [
  createFormSample(
    'form-westlands-a',
    'Form 34A - Station copy A',
    '/demo/forms/KE-047-290-0001-form34a-a.svg',
    0
  ),
  createFormSample(
    'form-westlands-b',
    'Form 34A - Station copy B',
    '/demo/forms/KE-047-290-0001-form34a-b.svg',
    1
  ),
  createFormSample(
    'form-westlands-c',
    'Form 34A - Station copy C',
    '/demo/forms/KE-047-290-0001-form34a-c.svg',
    -1
  ),
]

export const DEMO_IEBC_PAYLOADS: DemoIebcPayload[] = [
  {
    station_code: DEMO_IEBC_DATA.station_code,
    results: DEMO_IEBC_DATA.results.map((result) => ({
      candidate_name: result.candidate_name,
      party: result.party,
      votes: result.votes,
    })),
    last_updated: DEMO_IEBC_DATA.last_updated,
    source: DEMO_IEBC_DATA.source,
  },
]

function sourceVoteFields(source: VerificationSource, votes: number) {
  return {
    audio_votes: source === 'audio_ai' ? votes : null,
    form34a_votes: source === 'form34a_votes' ? votes : null,
    iebc_votes: source === 'iebc_votes' ? votes : null,
  }
}

function createTallyEntry(
  stationCode: string,
  agentId: string | null,
  result: CandidateResult,
  source: VerificationSource,
  confidence: number
): TallyEntry {
  return {
    id: randomUUID(),
    station_code: stationCode,
    agent_id: agentId,
    candidate_name: result.candidate_name,
    party: result.party,
    ...sourceVoteFields(source, result.votes),
    max_delta: 0,
    status: 'pending',
    confidence,
    source,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function buildComparisonRows(tallyEntries: TallyEntry[], stationCode?: string) {
  const grouped = new Map<string, VerificationComparisonRow>()

  for (const tally of tallyEntries) {
    if (stationCode && tally.station_code !== stationCode) {
      continue
    }

    const key = `${tally.station_code ?? 'unknown'}::${tally.candidate_name.toLowerCase()}`
    const current = grouped.get(key) ?? {
      station_code: tally.station_code ?? SAMPLE_STATION.station_code,
      agent_id: tally.agent_id ?? SAMPLE_AGENT.id,
      candidate_name: tally.candidate_name,
      party: tally.party,
      audio_votes: null,
      form34a_votes: null,
      iebc_votes: null,
      max_delta: 0,
      status: 'pending',
      confidence: tally.confidence,
    }

    current.audio_votes = tally.audio_votes ?? current.audio_votes
    current.form34a_votes = tally.form34a_votes ?? current.form34a_votes
    current.iebc_votes = tally.iebc_votes ?? current.iebc_votes
    current.party = tally.party ?? current.party
    current.confidence = Math.max(current.confidence, tally.confidence)

    grouped.set(key, current)
  }

  return Array.from(grouped.values())
    .map((row) => {
      const availableVotes = [row.audio_votes, row.form34a_votes, row.iebc_votes].filter(
        (value): value is number => value !== null
      )
      const maxVote = availableVotes.length > 0 ? Math.max(...availableVotes) : 0
      const minVote = availableVotes.length > 0 ? Math.min(...availableVotes) : 0
      const maxDelta = availableVotes.length >= 2 ? maxVote - minVote : 0
      const status: VerificationComparisonRow['status'] =
        availableVotes.length < 3 ? (maxDelta >= 1 ? 'discrepancy' : 'pending') : maxDelta >= 1 ? 'discrepancy' : 'match'

      return {
        ...row,
        max_delta: maxDelta,
        status,
      }
    })
    .sort((left, right) => right.max_delta - left.max_delta || left.candidate_name.localeCompare(right.candidate_name))
}

export function buildVerificationStats(rows: VerificationComparisonRow[]): VerificationStats {
  return {
    total_candidates: rows.length,
    matching: rows.filter((row) => row.status === 'match').length,
    discrepancies: rows.filter((row) => row.status === 'discrepancy').length,
    pending: rows.filter((row) => row.status === 'pending').length,
  }
}

function createSeedState(): VerificationDemoState {
  const audioTallies = DEMO_AUDIO_SAMPLES[0].transcript_lines.flatMap((line) =>
    extractVotesFromTranscript(line, 0.91).map((vote) =>
      createTallyEntry(
        SAMPLE_STATION.station_code,
        SAMPLE_AGENT.id,
        {
          candidate_name: vote.candidate_name,
          party: DEMO_FORM_34A_DATA.results.find((result) => result.candidate_name === vote.candidate_name)?.party ?? null,
          votes: vote.votes,
        },
        'audio_ai',
        vote.confidence ?? 0.91
      )
    )
  )

  const formTallies = DEMO_FORM_SAMPLES[0].extracted_results.map((result) =>
    createTallyEntry(SAMPLE_STATION.station_code, SAMPLE_AGENT.id, result, 'form34a_votes', 0.97)
  )

  const iebcTallies = DEMO_IEBC_PAYLOADS[0].results.map((result) =>
    createTallyEntry(SAMPLE_STATION.station_code, SAMPLE_AGENT.id, result, 'iebc_votes', 0.99)
  )

  const tallyEntries = [...audioTallies, ...formTallies, ...iebcTallies]
  const comparisonRows = buildComparisonRows(tallyEntries, SAMPLE_STATION.station_code)
  const alerts = buildDiscrepancyAlerts(comparisonRows)
  const seedSession = createLiveSession({
    agent_id: SAMPLE_AGENT.id,
    station_code: SAMPLE_STATION.station_code,
    source_url: SAMPLE_AGENT.tiktok_url ?? SAMPLE_AGENT.youtube_url ?? 'https://www.tiktok.com/@jmwangi_iebc/live',
    platform: 'tiktok',
  })

  return {
    version: 1,
    last_seeded_at: new Date().toISOString(),
    demo_audio_samples: DEMO_AUDIO_SAMPLES,
    demo_form_samples: DEMO_FORM_SAMPLES,
    demo_iebc_payloads: DEMO_IEBC_PAYLOADS,
    live_sessions: [seedSession],
    transcript_records: [
      {
        id: randomUUID(),
        station_code: SAMPLE_STATION.station_code,
        agent_id: SAMPLE_AGENT.id,
        sample_id: DEMO_AUDIO_SAMPLES[0].id,
        source_label: DEMO_AUDIO_SAMPLES[0].label,
        transcript_text: DEMO_AUDIO_SAMPLES[0].transcript_text,
        extracted_votes: extractVotesFromTranscript(DEMO_AUDIO_SAMPLES[0].transcript_text, 0.91),
        created_at: new Date().toISOString(),
      },
    ],
    transcript_segments: DEMO_AUDIO_SAMPLES[0].transcript_lines.map((line, index) => ({
      id: randomUUID(),
      session_id: seedSession.id,
      station_code: SAMPLE_STATION.station_code,
      agent_id: SAMPLE_AGENT.id,
      chunk_index: index,
      transcript_text: line,
      confidence: 0.91,
      created_at: new Date().toISOString(),
    })),
    form_uploads: [
      {
        id: randomUUID(),
        station_code: SAMPLE_STATION.station_code,
        agent_id: SAMPLE_AGENT.id,
        form_type: '34A',
        file_path: DEMO_FORM_SAMPLES[0].preview_path,
        sha256_hash: createHash('sha256').update(DEMO_FORM_SAMPLES[0].preview_path).digest('hex'),
        scan_status: 'complete',
        extracted_data: {
          station_code: SAMPLE_STATION.station_code,
          results: DEMO_FORM_SAMPLES[0].extracted_results,
          total_valid_votes: DEMO_FORM_SAMPLES[0].total_valid_votes,
          total_rejected_votes: DEMO_FORM_SAMPLES[0].total_rejected_votes,
          presiding_officer: DEMO_FORM_SAMPLES[0].presiding_officer,
        },
        created_at: new Date().toISOString(),
      },
    ],
    tally_entries: tallyEntries,
    alerts,
    station_activity: [
      {
        id: randomUUID(),
        station_code: SAMPLE_STATION.station_code,
        activity_type: 'stream_started',
        message: `Monitoring session started for ${SAMPLE_STATION.station_name}`,
        created_at: new Date().toISOString(),
      },
    ],
    verification_events: buildVerificationEvents(comparisonRows),
  }
}

async function writeState(state: VerificationDemoState) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf8')
}

function normalizeVerificationState(state: VerificationDemoState | Partial<VerificationDemoState>): VerificationDemoState {
  const seeded = createSeedState()

  return {
    ...seeded,
    ...state,
    live_sessions: state.live_sessions ?? seeded.live_sessions,
    transcript_records: state.transcript_records ?? seeded.transcript_records,
    transcript_segments: state.transcript_segments ?? seeded.transcript_segments,
    form_uploads: state.form_uploads ?? seeded.form_uploads,
    tally_entries: state.tally_entries ?? seeded.tally_entries,
    alerts: state.alerts ?? seeded.alerts,
    station_activity: state.station_activity ?? seeded.station_activity,
    verification_events: state.verification_events ?? seeded.verification_events,
  }
}

export async function getVerificationState() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<VerificationDemoState>
    const normalized = normalizeVerificationState(parsed)
    if (
      !parsed.live_sessions ||
      !parsed.transcript_segments ||
      !parsed.station_activity ||
      !parsed.verification_events
    ) {
      await writeState(normalized)
    }
    return normalized
  } catch (error) {
    const seeded = createSeedState()
    await writeState(seeded)
    return seeded
  }
}

export async function resetVerificationState() {
  const seeded = createSeedState()
  await writeState(seeded)
  return seeded
}

export async function updateVerificationState(
  mutator: (state: VerificationDemoState) => VerificationDemoState | Promise<VerificationDemoState>
) {
  const state = await getVerificationState()
  const updated = await mutator(state)
  await writeState(updated)
  return updated
}

export async function syncStationAlerts(stationCode: string) {
  return updateVerificationState((state) => {
    const comparisons = buildComparisonRows(state.tally_entries, stationCode)
    const retainedAlerts = state.alerts.filter((alert) => alert.station_code !== stationCode)
    const generatedAlerts = buildDiscrepancyAlerts(comparisons)
    const retainedEvents = state.verification_events.filter((event) => event.station_code !== stationCode)
    const generatedEvents = buildVerificationEvents(comparisons)

    return {
      ...state,
      alerts: [...generatedAlerts, ...retainedAlerts].sort((left, right) => right.created_at.localeCompare(left.created_at)),
      verification_events: [...generatedEvents, ...retainedEvents].sort((left, right) => right.created_at.localeCompare(left.created_at)),
      station_activity: [
        {
          id: randomUUID(),
          station_code: stationCode,
          activity_type: generatedAlerts.length > 0 ? 'alert_generated' : 'verification_complete',
          message:
            generatedAlerts.length > 0
              ? `${generatedAlerts.length} discrepancy alert(s) generated at ${stationCode}`
              : `Verification completed for ${stationCode} with no open discrepancies`,
          created_at: new Date().toISOString(),
        },
        ...state.station_activity.filter((entry) => entry.station_code !== stationCode).slice(0, 11),
      ],
    }
  })
}

export async function persistSourceResults(input: {
  station_code: string
  agent_id: string | null
  source: VerificationSource
  confidence: number
  results: CandidateResult[]
}) {
  const { agent_id, confidence, results, source, station_code } = input

  return updateVerificationState((state) => {
    const withoutSameSource = state.tally_entries.filter(
      (entry) => !(entry.station_code === station_code && entry.source === source)
    )

    const nextEntries = results.map((result) => createTallyEntry(station_code, agent_id, result, source, confidence))

    return {
      ...state,
      tally_entries: [...withoutSameSource, ...nextEntries].sort((left, right) => right.created_at.localeCompare(left.created_at)),
    }
  })
}

export async function recordTranscript(input: {
  station_code: string
  agent_id: string | null
  sample_id: string
  source_label: string
  transcript_text: string
  extracted_votes: ExtractedVote[]
}) {
  return updateVerificationState((state) => ({
    ...state,
    transcript_records: [
      {
        id: randomUUID(),
        created_at: new Date().toISOString(),
        ...input,
      },
      ...state.transcript_records,
    ],
    station_activity: [
      {
        id: randomUUID(),
        station_code: input.station_code,
        activity_type: 'transcript_received',
        message: `Transcript captured for ${input.station_code} from ${input.source_label}`,
        created_at: new Date().toISOString(),
      },
      ...state.station_activity,
    ],
  }))
}

export async function registerLiveSession(session: LiveSession) {
  return updateVerificationState((state) => ({
    ...state,
    live_sessions: [
      session,
      ...state.live_sessions.filter((entry) => entry.id !== session.id && entry.station_code !== session.station_code),
    ],
    station_activity: [
      {
        id: randomUUID(),
        station_code: session.station_code,
        activity_type: 'stream_started',
        message: `Monitoring started for ${session.platform.toUpperCase()} stream at ${session.station_code}`,
        created_at: new Date().toISOString(),
      },
      ...state.station_activity,
    ],
  }))
}

export async function updateLiveSession(sessionId: string, updates: Partial<LiveSession>) {
  return updateVerificationState((state) => ({
    ...state,
    live_sessions: state.live_sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        : session
    ),
  }))
}

export function resolveDemoAudioSample(sampleId: string | null, fileName: string | null) {
  if (sampleId) {
    return DEMO_AUDIO_SAMPLES.find((sample) => sample.id === sampleId) ?? DEMO_AUDIO_SAMPLES[0]
  }

  if (fileName) {
    const normalizedName = fileName.toLowerCase()
    return DEMO_AUDIO_SAMPLES.find((sample) => normalizedName.includes(sample.id.replace(/-/g, ''))) ?? DEMO_AUDIO_SAMPLES[0]
  }

  return DEMO_AUDIO_SAMPLES[0]
}

export function resolveDemoFormSample(sampleId: string | null, fileName: string | null) {
  if (sampleId) {
    return DEMO_FORM_SAMPLES.find((sample) => sample.id === sampleId) ?? DEMO_FORM_SAMPLES[0]
  }

  if (fileName) {
    const normalizedName = fileName.toLowerCase()
    return DEMO_FORM_SAMPLES.find((sample) => normalizedName.includes(sample.id.replace(/-/g, ''))) ?? DEMO_FORM_SAMPLES[0]
  }

  return DEMO_FORM_SAMPLES[0]
}

export function getDemoIebcPayload(stationCode: string) {
  return DEMO_IEBC_PAYLOADS.find((payload) => payload.station_code === stationCode) ?? DEMO_IEBC_PAYLOADS[0]
}
