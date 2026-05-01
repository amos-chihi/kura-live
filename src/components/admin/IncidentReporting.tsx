'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, Clock, MapPin, User, Filter, Search, Download, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Incident {
  id: string
  title: string
  description: string
  type: 'security' | 'technical' | 'procedural' | 'discrepancy' | 'medical' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  agentId: string
  agentName: string
  stationCode: string
  location?: string
  reportedAt: string
  resolvedAt?: string
  assignedTo?: string
  notes: IncidentNote[]
  attachments: string[]
}

interface IncidentNote {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: string
  type: 'update' | 'action' | 'resolution'
}

export default function IncidentReporting() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'open' | 'resolved' | 'critical'>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    // Mock incident data
    const mockIncidents: Incident[] = [
      {
        id: 'inc-001',
        title: 'Vote Discrepancy Detected',
        description: 'Significant difference between audio transcription and Form 34A results for candidate Mary Wambui',
        type: 'discrepancy',
        severity: 'critical',
        status: 'open',
        agentId: 'agent-001',
        agentName: 'James Mwangi',
        stationCode: 'KE-047-290-0001',
        location: 'Main counting area',
        reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        notes: [
          {
            id: 'note-1',
            authorId: 'admin',
            authorName: 'Admin',
            content: 'Investigation initiated. Agent requested to verify Form 34A.',
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            type: 'action'
          }
        ],
        attachments: ['form34a_scan.jpg', 'audio_transcript.pdf']
      },
      {
        id: 'inc-002',
        title: 'Stream Quality Issues',
        description: 'Poor video quality affecting vote transcription accuracy',
        type: 'technical',
        severity: 'medium',
        status: 'investigating',
        agentId: 'agent-002',
        agentName: 'Sarah Njoroge',
        stationCode: 'KE-047-290-0002',
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'tech-team',
        notes: [
          {
            id: 'note-2',
            authorId: 'tech-team',
            authorName: 'Tech Team',
            content: 'Agent advised to improve lighting and reduce background noise.',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            type: 'update'
          }
        ],
        attachments: []
      },
      {
        id: 'inc-003',
        title: 'Unauthorized Access Attempt',
        description: 'Unknown individual attempting to access restricted voting area',
        type: 'security',
        severity: 'high',
        status: 'resolved',
        agentId: 'agent-003',
        agentName: 'David Ochieng',
        stationCode: 'KE-047-290-0003',
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        notes: [
          {
            id: 'note-3',
            authorId: 'security',
            authorName: 'Security Team',
            content: 'Individual escorted from premises. No further issues reported.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            type: 'resolution'
          }
        ],
        attachments: ['security_report.pdf']
      }
    ]

    setIncidents(mockIncidents)
    setLoading(false)
  }, [])

  const getFilteredIncidents = () => {
    let filtered = [...incidents]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.stationCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterType === 'open') {
      filtered = filtered.filter(incident => incident.status === 'open' || incident.status === 'investigating')
    } else if (filterType === 'resolved') {
      filtered = filtered.filter(incident => incident.status === 'resolved' || incident.status === 'closed')
    } else if (filterType === 'critical') {
      filtered = filtered.filter(incident => incident.severity === 'critical')
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(incident => incident.severity === filterSeverity)
    }

    return filtered.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
  }

  const getTypeColor = (type: Incident['type']) => {
    switch (type) {
      case 'security': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'technical': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'procedural': return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'discrepancy': return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'medical': return 'bg-green-500/10 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'investigating': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'closed': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const filteredIncidents = getFilteredIncidents()
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-kura-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-sm text-gray-400">Total Incidents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.open}</span>
          </div>
          <div className="text-sm text-gray-400">Open</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.investigating}</span>
          </div>
          <div className="text-sm text-gray-400">Investigating</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.resolved}</span>
          </div>
          <div className="text-sm text-gray-400">Resolved</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.critical}</span>
          </div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-kura-accent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'open' | 'resolved' | 'critical')}
            className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="critical">Critical Only</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low')}
            className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="flex items-center px-3 py-1 bg-kura-accent hover:bg-kura-accent/80 text-white rounded text-sm">
            <Download className="w-3 h-3 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-kura-surface border border-kura-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-kura-navy">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Incident</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Agent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Station</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Reported</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="border-b border-kura-border hover:bg-kura-navy/30">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-white font-medium">{incident.title}</div>
                      <div className="text-sm text-gray-400 max-w-xs truncate">{incident.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="default" size="sm" className={getTypeColor(incident.type)}>
                      {incident.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="default" size="sm" className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-white">{incident.agentName}</div>
                      <div className="text-sm text-gray-400">{incident.agentId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{incident.stationCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="default" size="sm" className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-400">
                      {new Date(incident.reportedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIncident(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-kura-surface border border-kura-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{selectedIncident.title}</h2>
                  <div className="flex items-center space-x-3">
                    <Badge variant="default" size="sm" className={getTypeColor(selectedIncident.type)}>
                      {selectedIncident.type}
                    </Badge>
                    <Badge variant="default" size="sm" className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity}
                    </Badge>
                    <Badge variant="default" size="sm" className={getStatusColor(selectedIncident.status)}>
                      {selectedIncident.status}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Description</h3>
                  <p className="text-gray-300">{selectedIncident.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-medium mb-2">Agent Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-400">Name: <span className="text-white">{selectedIncident.agentName}</span></div>
                      <div className="text-gray-400">ID: <span className="text-white">{selectedIncident.agentId}</span></div>
                      <div className="text-gray-400">Station: <span className="text-white">{selectedIncident.stationCode}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">Timeline</h3>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-400">Reported: <span className="text-white">{new Date(selectedIncident.reportedAt).toLocaleString()}</span></div>
                      {selectedIncident.resolvedAt && (
                        <div className="text-gray-400">Resolved: <span className="text-white">{new Date(selectedIncident.resolvedAt).toLocaleString()}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedIncident.notes.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Notes & Updates</h3>
                    <div className="space-y-3">
                      {selectedIncident.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-kura-navy rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{note.authorName}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" size="sm" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
                                {note.type}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(note.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIncident.attachments.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Attachments</h3>
                    <div className="space-y-2">
                      {selectedIncident.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-kura-navy rounded">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg">
                    Add Note
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    Update Status
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
