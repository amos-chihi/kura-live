'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Clock, Info, MapPin } from 'lucide-react'

import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Agent, Alert } from '@/lib/types'
import { useAlertStore } from '@/store/alertStore'
import { useToastStore } from '@/store/toastStore'

interface AlertsPanelProps {
  agent: Agent | null
}

type AlertFilter = 'all' | 'open' | 'escalated' | 'dismissed'

async function loadAlerts(stationCode: string) {
  const response = await fetch(`/api/alerts?station_code=${encodeURIComponent(stationCode)}`)
  const payload = (await response.json()) as { data: Alert[] | null; error: string | null }
  if (!response.ok || payload.error || !payload.data) {
    throw new Error(payload.error ?? 'Failed to load alerts')
  }
  return payload.data
}

export function AlertsPanel({ agent }: AlertsPanelProps) {
  const stationCode = agent?.station_code ?? 'KE-047-290-0001'
  const alerts = useAlertStore((state) => state.alerts)
  const setAlerts = useAlertStore((state) => state.setAlerts)
  const setLoading = useAlertStore((state) => state.setLoading)
  const showToast = useToastStore((state) => state.showToast)

  const [filter, setFilter] = useState<AlertFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | Alert['severity']>('all')
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        setAlerts(await loadAlerts(stationCode))
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Unable to load discrepancy alerts.')
      } finally {
        setLoading(false)
      }
    })()
  }, [setAlerts, setLoading, showToast, stationCode])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (filter !== 'all' && alert.alert_status !== filter) {
        return false
      }
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false
      }
      return true
    })
  }, [alerts, filter, severityFilter])

  const stats = {
    critical: alerts.filter((alert) => alert.severity === 'critical' && alert.alert_status === 'open').length,
    warning: alerts.filter((alert) => alert.severity === 'warning' && alert.alert_status === 'open').length,
    info: alerts.filter((alert) => alert.severity === 'info' && alert.alert_status === 'open').length,
    total: alerts.filter((alert) => alert.alert_status === 'open').length,
  }

  const updateAlertStatus = async (id: string, nextStatus: Alert['alert_status']) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, alert_status: nextStatus }),
      })
      const payload = (await response.json()) as { data: Alert | null; error: string | null }
      if (!response.ok || payload.error || !payload.data) {
        throw new Error(payload.error ?? 'Failed to update alert')
      }
      setAlerts(await loadAlerts(stationCode))
      showToast('success', `Alert moved to ${nextStatus}.`)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to update the selected alert.')
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityBadgeClass = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Critical', value: stats.critical, color: 'text-red-400' },
          { label: 'Warning', value: stats.warning, color: 'text-yellow-400' },
          { label: 'Info', value: stats.info, color: 'text-blue-400' },
          { label: 'Open', value: stats.total, color: 'text-kura-accent' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-kura-border bg-kura-surface p-4">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="mt-1 text-sm text-gray-400">{item.label} alerts</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-kura-border bg-kura-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Discrepancy Alerts</h2>
            <p className="mt-1 text-sm text-gray-400">Any delta of one vote or more is flagged automatically once source data arrives.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as AlertFilter)}
              className="rounded-lg border border-kura-border bg-kura-navy px-3 py-2 text-sm text-white"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="escalated">Escalated</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as 'all' | Alert['severity'])}
              className="rounded-lg border border-kura-border bg-kura-navy px-3 py-2 text-sm text-white"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-lg border border-kura-border"
              >
                <button
                  onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                  className="flex w-full items-start justify-between gap-4 bg-kura-navy p-4 text-left hover:bg-kura-navy-mid"
                >
                  <div className="flex gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-white">{alert.candidate_name}</span>
                        <Badge variant="default" size="sm" className={getSeverityBadgeClass(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {alert.alert_status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="inline-flex items-center"><MapPin className="mr-1 h-3 w-3" />{alert.station_code}</span>
                        <span className="inline-flex items-center"><Clock className="mr-1 h-3 w-3" />{new Date(alert.created_at).toLocaleString()}</span>
                        <span>Delta: {alert.delta} vote{alert.delta === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>
                  {expandedAlertId === alert.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {expandedAlertId === alert.id && (
                  <div className="border-t border-kura-border bg-kura-surface p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {[
                        ['Audio AI', alert.audio_votes],
                        ['Form 34A', alert.form34a_votes],
                        ['IEBC', alert.iebc_votes],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-kura-navy p-4 text-center">
                          <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
                          <div className="mt-2 text-xl font-mono text-white">{value ?? '—'}</div>
                        </div>
                      ))}
                    </div>

                    {alert.alert_status === 'open' && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => void updateAlertStatus(alert.id, 'escalated')}
                          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                        >
                          Escalate
                        </button>
                        <button
                          onClick={() => void updateAlertStatus(alert.id, 'dismissed')}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed border-kura-border text-sm text-gray-400">
              No alerts match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertsPanel
