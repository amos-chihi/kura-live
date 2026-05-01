import { Alert } from '@/lib/types'
import Badge from './Badge'
import { formatDistanceToNow } from 'date-fns'

interface AlertCardProps {
  alert: Alert
  onEscalate?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
}

export default function AlertCard({ alert, onEscalate, onDismiss }: AlertCardProps) {
  const severityColors = {
    critical: 'error',
    warning: 'warning',
    info: 'info'
  } as const

  return (
    <div className={`data-card ${
      alert.severity === 'critical' ? 'data-card-error' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Badge variant={severityColors[alert.severity]} size="sm">
              {alert.severity.toUpperCase()}
            </Badge>
            <span className="faint-text ml-2">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <h4 className="item-title mb-2">{alert.candidate_name}</h4>
          
          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <span className="faint-text">Audio:</span>
              <span className="body-text ml-2">{alert.audio_votes || '—'}</span>
            </div>
            <div>
              <span className="faint-text">Form 34A:</span>
              <span className="body-text ml-2">{alert.form34a_votes || '—'}</span>
            </div>
            <div>
              <span className="faint-text">IEBC:</span>
              <span className="body-text ml-2">{alert.iebc_votes || '—'}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="faint-text">Delta:</span>
            <span className={`text-sm font-medium ml-2 ${
              alert.delta > 0 ? 'text-kura-red' : 'text-kura-green'
            }`}>
              {alert.delta > 0 ? '+' : ''}{alert.delta}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {onEscalate && (
            <button
              onClick={() => onEscalate(alert.id)}
              className="btn-amber"
            >
              Escalate
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="px-3 py-1 text-xs bg-kura-panel text-kura-muted border border-kura-border rounded hover:bg-kura-panel2 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
