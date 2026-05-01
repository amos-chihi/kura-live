'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, UserPlus, Clock, CheckCircle2, MapPin, Camera, Search, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Agent, PollingStation } from '@/lib/types'
import { generateKenyanName, generateKenyanPhone, generateKenyanEmail, KENYAN_COUNTIES } from '@/lib/kenyanData'

interface AgentFormData {
  full_name: string
  national_id: string
  phone: string
  email: string
  party_coalition: string
  candidate_name: string
  station_code: string
  photo_url: string
}

export default function AgentRegistrationPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stations, setStations] = useState<PollingStation[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null)

  const [formData, setFormData] = useState<AgentFormData>({
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    party_coalition: '',
    candidate_name: '',
    station_code: '',
    photo_url: ''
  })

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockAgents: Agent[] = Array.from({ length: 50 }, (_, i) => {
      const name = generateKenyanName()
      return {
        id: `agent-${i}`,
        user_id: `user-${i}`,
        agent_id: `AG-${String(i + 1).padStart(4, '0')}`,
        full_name: name,
        station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        tiktok_url: Math.random() > 0.5 ? `https://www.tiktok.com/@agent${i}` : null,
        youtube_url: Math.random() > 0.5 ? `https://www.youtube.com/channel/abc${i}` : null,
        platform_url: Math.random() > 0.7 ? `https://platform.example.com/agent${i}` : null,
        status: ['pending', 'approved', 'active', 'inactive', 'suspended'][Math.floor(Math.random() * 5)] as Agent['status'],
        phone: generateKenyanPhone(),
        email: generateKenyanEmail(name),
        verification_status: ['unverified', 'id_verified', 'fully_verified'][Math.floor(Math.random() * 3)] as Agent['verification_status'],
        created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
      }
    })

    const mockStations: PollingStation[] = Array.from({ length: 100 }, (_, i) => {
      const county = KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)]
      return {
        station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        station_name: `${county} Station ${i + 1}`,
        constituency: `${county} Constituency ${Math.floor(i / 10) + 1}`,
        county: county,
        ward: `${county} Ward ${Math.floor(i / 5) + 1}`,
        gps_lat: -1.2921 + (Math.random() - 0.5) * 4,
        gps_lng: 36.8219 + (Math.random() - 0.5) * 4,
        registered_voters: Math.floor(Math.random() * 1000) + 200
      }
    })

    setAgents(mockAgents)
    setStations(mockStations)
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        user_id: `user-${Date.now()}`,
        agent_id: `AG-${String(agents.length + 1).padStart(4, '0')}`,
        full_name: formData.full_name,
        station_code: formData.station_code,
        tiktok_url: null,
        youtube_url: null,
        platform_url: null,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      setAgents(prev => [newAgent, ...prev])
      setShowInviteForm(false)
      setFormData({
        full_name: '',
        national_id: '',
        phone: '',
        email: '',
        party_coalition: '',
        candidate_name: '',
        station_code: '',
        photo_url: ''
      })
      setSelectedStation(null)

      // In real app, call base44.users.inviteUser(email, "agent")
      console.log('Agent invited successfully')
    } catch (error) {
      console.error('Failed to create agent:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStationSelect = (stationCode: string) => {
    const station = stations.find(s => s.station_code === stationCode)
    setSelectedStation(station || null)
    setFormData(prev => ({ ...prev, station_code: stationCode }))
  }

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setFormData(prev => ({ 
      ...prev, 
      photo_url: `https://picsum.photos/seed/${Date.now()}/200/200.jpg` 
    }))
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.full_name.toLowerCase().includes(search.toLowerCase()) ||
                         agent.agent_id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    pending: agents.filter(a => a.status === 'pending').length,
    approved: agents.filter(a => a.status === 'approved').length,
    active: agents.filter(a => a.status === 'active').length,
    total: agents.length
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'pending': return 'bg-[#FFB800]/10 text-[#FFB800]'
      case 'approved':
      case 'active': return 'bg-[#00D26A]/10 text-[#00D26A]'
      case 'suspended': return 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
      default: return 'bg-[#52525B]/10 text-[#52525B]'
    }
  }

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case 'unverified': return 'bg-[#52525B]/10 text-[#52525B]'
      case 'id_verified': return 'bg-[#3B82F6]/10 text-[#3B82F6]'
      case 'fully_verified': return 'bg-[#00D26A]/10 text-[#00D26A]'
      default: return 'bg-[#52525B]/10 text-[#52525B]'
    }
  }

  return (
    <div className="min-h-screen bg-kura-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-[#8B5CF6]" />
              <h1 className="text-2xl font-bold text-white">Agent Registration Portal</h1>
            </div>
            <p className="text-sm text-kura-text-body">
              Manage and monitor election agents across all polling stations
            </p>
          </div>
          
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] h-8 text-xs text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Agent
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#111114] border border-[#1E1E24]">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-[#FFB800]" />
              <span className="text-2xl font-bold text-white">{stats.pending}</span>
            </div>
            <div className="text-[10px] text-[#71717A] uppercase">Pending agents</div>
          </div>
          
          <div className="p-3 rounded-xl bg-[#111114] border border-[#1E1E24]">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D26A]" />
              <span className="text-2xl font-bold text-white">{stats.approved}</span>
            </div>
            <div className="text-[10px] text-[#71717A] uppercase">Approved agents</div>
          </div>
          
          <div className="p-3 rounded-xl bg-[#111114] border border-[#1E1E24]">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-2xl font-bold text-white">{stats.active}</span>
            </div>
            <div className="text-[10px] text-[#71717A] uppercase">Active agents</div>
          </div>
          
          <div className="p-3 rounded-xl bg-[#111114] border border-[#1E1E24]">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <div className="text-[10px] text-[#71717A] uppercase">Total agents</div>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-[#1E1E24] bg-[#111114]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Invite New Agent</h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="p-1 rounded hover:bg-[#1A1A1F] transition-colors"
              >
                <X className="w-4 h-4 text-kura-text" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">National ID Number *</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={formData.national_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">Party/Coalition *</label>
                  <input
                    type="text"
                    required
                    value={formData.party_coalition}
                    onChange={(e) => setFormData(prev => ({ ...prev, party_coalition: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-[#71717A] mb-1.5">Candidate Name (optional)</label>
                  <input
                    type="text"
                    value={formData.candidate_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidate_name: e.target.value }))}
                    className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Polling Station Selector */}
              <div>
                <label className="block text-[10px] text-[#71717A] mb-1.5">Polling Station *</label>
                <select
                  required
                  value={formData.station_code}
                  onChange={(e) => handleStationSelect(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#1E1E24] text-white text-xs h-9 rounded-lg px-3 focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="">Select station...</option>
                  {stations.map(station => (
                    <option key={station.station_code} value={station.station_code}>
                      {station.station_name} ({station.station_code}) • {station.ward}, {station.constituency}
                    </option>
                  ))}
                </select>
                
                {selectedStation && (
                  <div className="flex items-center space-x-1 mt-2 text-[10px] text-[#52525B]">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedStation.constituency}, {selectedStation.county}</span>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[10px] text-[#71717A] mb-1.5">Photo Upload (required)</label>
                <div className="flex items-center space-x-4">
                  {formData.photo_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.photo_url}
                        alt="Agent photo"
                        className="w-16 h-16 rounded-lg object-cover border border-[#1E1E24]"
                      />
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#1A1A1F] border border-[#1E1E24] flex items-center justify-center">
                      <Camera className="w-6 h-6 text-[#52525B]" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="px-4 py-2 rounded-lg bg-[#1A1A1F] border border-[#1E1E24] hover:bg-[#2A2A30] text-xs text-white transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin inline mr-2 text-[#8B5CF6]" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 inline mr-2" />
                        Upload Photo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 border border-[#1E1E24] text-xs text-white rounded-lg hover:bg-[#1A1A1F] transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || !formData.photo_url}
                  className="px-4 py-2 bg-[#8B5CF6] text-xs text-white rounded-lg hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filter Row */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              placeholder="Search agent name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 bg-[#111114] border border-[#1E1E24] text-white text-xs h-9 rounded-lg focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44 bg-[#111114] border border-[#1E1E24] text-white text-xs h-9 rounded-lg pl-3 pr-8 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#111114] border border-[#1E1E24] rounded-lg animate-pulse"></div>
            ))
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#52525B] mx-auto mb-4" />
              <p className="text-sm text-[#52525B]">No agents found</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-[#1E1E24] bg-[#111114]"
              >
                <div className="flex items-start gap-4">
                  {/* Agent Photo */}
                  <div className="w-14 h-14 rounded-lg bg-[#1A1A1F] border border-[#1E1E24] flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#52525B]" />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-white">{agent.full_name}</span>
                      <span className="text-[10px] text-[#52525B]">• {agent.agent_id}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="default" size="sm" className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Badge variant="default" size="sm" className={getVerificationColor(agent.verification_status || 'unverified')}>
                        {agent.verification_status || 'unverified'}
                      </Badge>
                    </div>
                    
                    <div className="text-[10px] text-[#71717A] mb-1">
                      {agent.phone} • {agent.email || 'No email'}
                    </div>
                    
                    <div className="text-[10px] text-[#71717A] mb-2">
                      Party: Not specified
                    </div>
                    
                    <div className="flex items-center space-x-1 text-[10px] text-[#71717A]">
                      <MapPin className="w-3 h-3" />
                      <span>{agent.station_code}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <button className="px-3 py-1 bg-[#3B82F6] hover:bg-[#2563EB] h-6 text-[10px] text-white rounded transition-colors">
                      Verify ID
                    </button>
                    {agent.status === 'active' && (
                      <button className="px-3 py-1 border border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10 h-6 text-[10px] rounded transition-colors">
                        Suspend
                      </button>
                    )}
                    {agent.status === 'suspended' && (
                      <button className="px-3 py-1 border border-[#00D26A] text-[#00D26A] hover:bg-[#00D26A]/10 h-6 text-[10px] rounded transition-colors">
                        Reactivate
                      </button>
                    )}
                    <button className="px-3 py-1 border border-[#FF3B3B] text-[#FF3B3B] hover:bg-[#FF3B3B]/10 h-6 text-[10px] rounded transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
