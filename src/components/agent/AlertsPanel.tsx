'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, Clock, MapPin, User, ChevronUp, ChevronDown, Send } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface AlertsPanelProps {
  agent: Agent | null
}

interface Alert {
  id: string
  candidate_name: string
  delta: number
  audio_votes?: number
  form34a_votes?: number
  iebc_votes?: number
  severity: 'critical' | 'warning' | 'info'
  alert_status: 'open' | 'escalated' | 'dismissed'
  created_at: string
  station_code: string
  description?: string
  action_taken?: string
}

export default function AlertsPanel({ agent }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-001',
      candidate_name: 'Mary Wambui',
      delta: 5,
      audio_votes: 245,
      form34a_votes: 248,
      iebc_votes: 250,
      severity: 'critical',
      alert_status: 'open',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      station_code: agent?.station_code || 'KE-047-290-0001',
      description: 'Significant vote discrepancy detected between audio transcription and official results'
    },
    {
      id: 'alert-002',
      candidate_name: 'John Kariuki',
      delta: 0,
      audio_votes: 189,
      form34a_votes: 189,
      iebc_votes: 189,
      severity: 'info',
      alert_status: 'dismissed',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      station_code: agent?.station_code || 'KE-047-290-0001',
      description: 'All vote sources match perfectly'
    },
    {
      id: 'alert-003',
      candidate_name: 'Sarah Njoroge',
      delta: 156,
      audio_votes: 156,
      form34a_votes: 0,
      iebc_votes: 0,
      severity: 'warning',
      alert_status: 'open',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      station_code: agent?.station_code || 'KE-047-290-0001',
      description: 'Audio transcription detected votes but no matching Form 34A or IEBC data'
    }
  ])

  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')

  const stats = {
    critical: alerts.filter(a => a.severity === 'critical' && a.alert_status === 'open').length,
    warning: alerts.filter(a => a.severity === 'warning' && a.alert_status === 'open').length,
    info: alerts.filter(a => a.severity === 'info' && a.alert_status === 'open').length,
    total: alerts.filter(a => a.alert_status === 'open').length
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Alert['alert_status']) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400'
      case 'escalated': return 'bg-yellow-500/10 text-yellow-400'
      case 'dismissed': return 'bg-green-500/10 text-green-400'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  const handleEscalateAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, alert_status: 'escalated' as const }
        : alert
    ))
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, alert_status: 'dismissed' as const }
        : alert
    ))
  }

  const handleAddNote = (alertId: string) => {
    if (newNote.trim()) {
      // In real app, this would save the note to the database
      console.log(`Adding note to alert ${alertId}: ${newNote}`)
      setNewNote('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.critical}</span>
          </div>
          <div className="text-sm text-gray-400">Critical Alerts</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.warning}</span>
          </div>
          <div className="text-sm text-gray-400">Warning Alerts</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Info className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.info}</span>
          </div>
          <div className="text-sm text-gray-400">Info Alerts</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-sm text-gray-400">Open Alerts</div>
        </div>
      </div>

      {/* Create New Alert */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Alert</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Candidate Name</label>
              <input
                type="text"
                placeholder="Enter candidate name"
                className="w-full bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
              <select className="w-full bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-kura-accent">
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              placeholder="Describe the issue or observation..."
              rows={3}
              className="w-full bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
            />
          </div>
          
          <button className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors">
            Create Alert
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Active Alerts</h2>
        
        <div className="space-y-4">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-kura-border rounded-lg overflow-hidden"
            >
              {/* Alert Header */}
              <div 
                className="p-4 bg-kura-navy cursor-pointer hover:bg-kura-navy/80 transition-colors"
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium">{alert.candidate_name}</span>
                        <Badge variant="default" size="sm" className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="default" size="sm" className={getStatusColor(alert.alert_status)}>
                          {alert.alert_status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        {alert.description}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.station_code}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Delta: {alert.delta} votes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {expandedAlert === alert.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAlert === alert.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="border-t border-kura-border p-4 bg-kura-surface"
                >
                  {/* Vote Comparison */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Vote Comparison</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Audio</p>
                        <p className="text-lg font-bold text-white">{alert.audio_votes || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Form 34A</p>
                        <p className="text-lg font-bold text-white">{alert.form34a_votes || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">IEBC</p>
                        <p className="text-lg font-bold text-white">{alert.iebc_votes || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {alert.alert_status === 'open' && (
                    <div className="flex items-center space-x-3 mb-4">
                      <button
                        onClick={() => handleEscalateAlert(alert.id)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Add Note</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this alert..."
                        className="flex-1 bg-kura-navy border border-kura-border rounded px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-kura-accent"
                      />
                      <button
                        onClick={() => handleAddNote(alert.id)}
                        className="px-3 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded text-sm transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-alert on Discrepancy</p>
              <p className="text-sm text-gray-400">Automatically create alerts when vote discrepancies are detected</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Critical Threshold</p>
              <p className="text-sm text-gray-400">Vote difference that triggers critical alerts</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>1 vote</option>
              <option>5 votes</option>
              <option>10 votes</option>
              <option>25 votes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Alert Notifications</p>
              <p className="text-sm text-gray-400">Send notifications for new alerts</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
