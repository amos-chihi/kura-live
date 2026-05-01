'use client'

import { MapPin, Phone, Mail, Circle, Clock } from 'lucide-react'
import { Agent } from '@/lib/types'

interface AgentTopBarProps {
  agent: Agent
  isStreaming: boolean
  streamTimer: number
  formatTime: (seconds: number) => string
}

export default function AgentTopBar({ agent, isStreaming, streamTimer, formatTime }: AgentTopBarProps) {
  return (
    <div className="bg-kura-surface border-b border-kura-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Agent Info */}
          <div>
            <h1 className="text-xl font-semibold text-white">{agent.full_name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{agent.station_code}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{agent.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stream Status */}
        <div className="flex items-center space-x-4">
          {isStreaming && (
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-red-500 fill-current animate-pulse" />
              <span className="text-sm text-white">LIVE</span>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatTime(streamTimer)}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 px-3 py-1 bg-kura-navy rounded-lg">
            <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-sm text-white capitalize">{agent.status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
