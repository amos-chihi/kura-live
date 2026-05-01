'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Shield, 
  Package, 
  Cpu, 
  Flag, 
  Clock, 
  MapPin, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function IncidentOpsPanel() {
  const [filter, setFilter] = useState<'all' | 'security' | 'logistics' | 'technical' | 'irregularity'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all')
  const { incidents, addIncident, resolveIncident } = useWebSocketStore()

  const filteredIncidents = incidents.filter(incident => {
    const typeMatch = filter === 'all' || incident.type === filter
    const statusMatch = statusFilter === 'all' || incident.status === statusFilter
    return typeMatch && statusMatch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-kura-red bg-kura-red/20 border-kura-red/30'
      case 'high': return 'text-kura-amber bg-kura-amber/20 border-kura-amber/30'
      case 'medium': return 'text-kura-blue bg-kura-blue/20 border-kura-blue/30'
      default: return 'text-kura-muted bg-kura-panel2 border-kura-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-kura-red" />
      case 'investigating': return <Clock className="w-4 h-4 text-kura-amber animate-spin" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-kura-green" />
      default: return <XCircle className="w-4 h-4 text-kura-muted" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />
      case 'logistics': return <Package className="w-4 h-4" />
      case 'technical': return <Cpu className="w-4 h-4" />
      case 'irregularity': return <Flag className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-kura-red'
      case 'logistics': return 'text-kura-amber'
      case 'technical': return 'text-kura-blue'
      case 'irregularity': return 'text-kura-purple'
      default: return 'text-kura-muted'
    }
  }

  const handleResolveIncident = (incidentId: string) => {
    resolveIncident(incidentId)
  }

  const handleAddIncident = () => {
    const types = ['security', 'logistics', 'technical', 'irregularity']
    const severities = ['critical', 'high', 'medium', 'low']
    const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
    
    addIncident({
      severity: severities[Math.floor(Math.random() * severities.length)] as any,
      type: types[Math.floor(Math.random() * types.length)] as any,
      location: locations[Math.floor(Math.random() * locations.length)],
      description: 'New incident reported via field agent',
      assigned_agent: 'Field Agent ' + Math.floor(Math.random() * 100),
      status: 'open'
    })
  }

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-kura-red" />
            <span>Incident Operations</span>
          </h2>
          <p className="text-xs text-kura-muted">
            {incidents.filter(i => i.status === 'open').length} active incidents
          </p>
        </div>
        
        <button
          onClick={handleAddIncident}
          className="ops-button-danger text-xs"
        >
          Log Incident
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 p-4 border-b border-kura-border">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-kura-panel2 border border-kura-border text-kura-text text-xs px-3 py-2 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="security">Security</option>
          <option value="logistics">Logistics</option>
          <option value="technical">Technical</option>
          <option value="irregularity">Irregularity</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-kura-panel2 border border-kura-border text-kura-text text-xs px-3 py-2 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-kura-muted mx-auto mb-4" />
            <p className="text-sm text-kura-muted">No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map((incident, index) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`command-panel cursor-pointer transition-all duration-200 ${
                incident.status === 'open' ? 'shadow-glow-red' : ''
              }`}
            >
              <div className="p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(incident.status)}
                    <span className={`status-badge ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(incident.type)}
                    <span className={`text-xs ${getTypeColor(incident.type)}`}>
                      {incident.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-sm text-kura-text">{incident.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-kura-muted">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{incident.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{incident.assigned_agent}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(incident.timestamp).toLocaleTimeString('en-KE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {incident.status === 'open' && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-kura-border">
                    <button className="ops-button-secondary text-xs">
                      Assign
                    </button>
                    <button className="ops-button-secondary text-xs">
                      Escalate
                    </button>
                    <button
                      onClick={() => handleResolveIncident(incident.id)}
                      className="ops-button-primary text-xs"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-t border-kura-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-kura-red">
              {incidents.filter(i => i.status === 'open').length}
            </div>
            <div className="text-xs text-kura-muted">Open</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-amber">
              {incidents.filter(i => i.status === 'investigating').length}
            </div>
            <div className="text-xs text-kura-muted">Investigating</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-green">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-xs text-kura-muted">Resolved</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-purple">
              {incidents.filter(i => i.severity === 'critical').length}
            </div>
            <div className="text-xs text-kura-muted">Critical</div>
          </div>
        </div>
      </div>
    </div>
  )
}
