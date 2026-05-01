import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: ReactNode
  className?: string
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  className = '' 
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && (
              <div className="stat-icon text-kura-green">
                {icon}
              </div>
            )}
            <p className="stat-label">{title}</p>
          </div>
          <p className="stat-value">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-[9px] ${
              change.type === 'increase' ? 'text-kura-green' :
              change.type === 'decrease' ? 'text-kura-red' : 'text-kura-muted'
            }`}>
              <span className="mr-1">
                {change.type === 'increase' ? '↑' : change.type === 'decrease' ? '↓' : '→'}
              </span>
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
