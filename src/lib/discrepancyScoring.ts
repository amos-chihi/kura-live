import type { Alert } from '@/lib/types'

export function scoreDiscrepancySeverity(delta: number): Alert['severity'] {
  if (delta >= 5) {
    return 'critical'
  }

  if (delta >= 1) {
    return 'warning'
  }

  return 'info'
}
