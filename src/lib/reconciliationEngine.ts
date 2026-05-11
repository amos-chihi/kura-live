import { scoreDiscrepancySeverity } from '@/lib/discrepancyScoring'
import type { Alert } from '@/lib/types'
import type { VerificationComparisonRow } from '@/lib/verificationDemo'

export interface ReconciliationEvent {
  id: string
  station_code: string
  candidate_name: string
  delta: number
  severity: Alert['severity']
  created_at: string
}

export function buildDiscrepancyAlerts(rows: VerificationComparisonRow[]): Alert[] {
  return rows
    .filter((row) => row.max_delta >= 1)
    .map((row) => ({
      id: crypto.randomUUID(),
      station_code: row.station_code,
      agent_id: row.agent_id,
      candidate_name: row.candidate_name,
      delta: row.max_delta,
      audio_votes: row.audio_votes,
      form34a_votes: row.form34a_votes,
      iebc_votes: row.iebc_votes,
      severity: scoreDiscrepancySeverity(row.max_delta),
      alert_status: 'open' as const,
      created_at: new Date().toISOString(),
    }))
}

export function buildVerificationEvents(rows: VerificationComparisonRow[]) {
  return rows.map<ReconciliationEvent>((row) => ({
    id: crypto.randomUUID(),
    station_code: row.station_code,
    candidate_name: row.candidate_name,
    delta: row.max_delta,
    severity: scoreDiscrepancySeverity(row.max_delta),
    created_at: new Date().toISOString(),
  }))
}
