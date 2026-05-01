'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Filter, MoreVertical, MapPin, Phone, Mail, Shield, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface AgentManagementProps {
  onAgentSelect?: (agent: Agent) => void
}

export default function AgentManagement({ onAgentSelect }: AgentManagementProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock agent data
    const mockAgents: Agent[] = Array.from({ length: 100 }, (_, i) => ({
      id: `agent-${i}`,
      user_id: `user-${i}`,
      agent_id: `AG-${String(i + 1).padStart(4, '0')}`,
      full_name: `Agent ${i + 1}`,
      station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}` as string,
      tiktok_url: Math.random() > 0.5 ? `https://www.tiktok.com/@agent${i}` : null,
      youtube_url: Math.random() > 0.5 ? `https://www.youtube.com/channel/abc${i}` : null,
      platform_url: Math.random() > 0.7 ? `https://platform.example.com/agent${i}` : null,
      status: ['pending', 'approved', 'active', 'inactive', 'suspended'][Math.floor(Math.random() * 5)] as Agent['status'],
      phone: `+2547${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `agent${i + 1}@example.com`,
      verification_status: ['unverified', 'id_verified', 'fully_verified'][Math.floor(Math.random() * 3)] as Agent['verification_status'],
      created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    }))

    setAgents(mockAgents)
    setFilteredAgents(mockAgents)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = agents

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.station_code && agent.station_code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter)
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(agent => agent.verification_status === verificationFilter)
    }

    setFilteredAgents(filtered)
  }, [agents, searchTerm, statusFilter, verificationFilter])

  const handleStatusChange = (agentId: string, newStatus: Agent['status']) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, status: newStatus } : agent
    ))
  }

  const handleVerificationChange = (agentId: string, newVerification: Agent['verification_status']) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, verification_status: newVerification } : agent
    ))
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getVerificationColor = (verification: Agent['verification_status']) => {
    switch (verification) {
      case 'unverified': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      case 'id_verified': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'fully_verified': return 'bg-green-500/10 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    pending: agents.filter(a => a.status === 'pending').length,
    verified: agents.filter(a => a.verification_status === 'fully_verified').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <div className="text-sm text-gray-400">Active Agents</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
          </div>
          <div className="text-sm text-gray-400">Pending Approval</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.verified}</span>
          </div>
          <div className="text-sm text-gray-400">Fully Verified</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-kura-navy border border-kura-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-kura-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="bg-kura-navy border border-kura-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-kura-accent"
          >
            <option value="all">All Verification</option>
            <option value="unverified">Unverified</option>
            <option value="id_verified">ID Verified</option>
            <option value="fully_verified">Fully Verified</option>
          </select>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-kura-surface border border-kura-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-kura-navy">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Agent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Station</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Verification</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Platforms</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-kura-border">
                    <td colSpan={7} className="px-4 py-8">
                      <div className="animate-pulse bg-kura-navy rounded h-4 w-3/4 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No agents found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-kura-border hover:bg-kura-navy/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-kura-navy rounded-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{agent.full_name}</div>
                          <div className="text-sm text-gray-400">{agent.agent_id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{agent.station_code || 'Not assigned'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-white">{agent.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-white">{agent.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="default" size="sm" className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="default" size="sm" className={getVerificationColor(agent.verification_status || 'unverified')}>
                        {agent.verification_status || 'unverified'}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        {agent.tiktok_url && <div className="w-6 h-6 bg-gray-700 rounded" title="TikTok" />}
                        {agent.youtube_url && <div className="w-6 h-6 bg-red-900 rounded" title="YouTube" />}
                        {agent.platform_url && <div className="w-6 h-6 bg-blue-900 rounded" title="Platform" />}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {agent.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(agent.id, 'approved')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(agent.id, 'suspended')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {agent.verification_status === 'unverified' && (
                          <button
                            onClick={() => handleVerificationChange(agent.id, 'id_verified')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                          >
                            Verify ID
                          </button>
                        )}
                        
                        {agent.verification_status === 'id_verified' && (
                          <button
                            onClick={() => handleVerificationChange(agent.id, 'fully_verified')}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          >
                            Full Verify
                          </button>
                        )}
                        
                        <button
                          onClick={() => onAgentSelect?.(agent)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Bulk Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg text-sm transition-colors">
            Approve Selected
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
            Verify Selected
          </button>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors">
            Suspend Selected
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
            Remove Selected
          </button>
        </div>
      </div>
    </div>
  )
}
