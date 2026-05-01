import { motion } from 'framer-motion'

interface StreamStatusDotProps {
  status: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
  className?: string
}

export default function StreamStatusDot({ status, className = '' }: StreamStatusDotProps) {
  const statusColors = {
    scheduled: 'bg-kura-amber',
    live: 'bg-kura-red',
    paused: 'bg-kura-amber',
    ended: 'bg-kura-text-muted',
    offline: 'bg-kura-text-faint'
  }

  const isLive = status === 'live'

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${statusColors[status]}`}
      />
      {isLive && (
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-kura-red live-pulse" />
      )}
    </div>
  )
}
