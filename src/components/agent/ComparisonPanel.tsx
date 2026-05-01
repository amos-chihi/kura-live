'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface ComparisonPanelProps {
  agent: Agent | null
}

interface VoteComparison {
  candidate_name: string
  audio_votes: number
  form34a_votes: number
  iebc_votes: number
  max_delta: number
  status: 'match' | 'discrepancy' | 'pending'
  confidence: number
}

export default function ComparisonPanel({ agent }: ComparisonPanelProps) {
  const [comparisons, setComparisons] = useState<VoteComparison[]>([
    {
      candidate_name: 'Mary Wambui',
      audio_votes: 245,
      form34a_votes: 248,
      iebc_votes: 250,
      max_delta: 5,
      status: 'discrepancy',
      confidence: 0.92
    },
    {
      candidate_name: 'John Kariuki',
      audio_votes: 189,
      form34a_votes: 189,
      iebc_votes: 189,
      max_delta: 0,
      status: 'match',
      confidence: 0.98
    },
    {
      candidate_name: 'Sarah Njoroge',
      audio_votes: 156,
      form34a_votes: 0,
      iebc_votes: 0,
      max_delta: 156,
      status: 'pending',
      confidence: 0.75
    }
  ])

  const [selectedComparison, setSelectedComparison] = useState<VoteComparison | null>(null)

  const stats = {
    total_candidates: comparisons.length,
    matching: comparisons.filter(c => c.status === 'match').length,
    discrepancies: comparisons.filter(c => c.status === 'discrepancy').length,
    pending: comparisons.filter(c => c.status === 'pending').length
  }

  const getStatusColor = (status: VoteComparison['status']) => {
    switch (status) {
      case 'match': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'discrepancy': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: VoteComparison['status']) => {
    switch (status) {
      case 'match': return <CheckCircle className="w-4 h-4" />
      case 'discrepancy': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{stats.total_candidates}</span>
          </div>
          <div className="text-sm text-gray-400">Total Candidates</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.matching}</span>
          </div>
          <div className="text-sm text-gray-400">Matching Results</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.discrepancies}</span>
          </div>
          <div className="text-sm text-gray-400">Discrepancies</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
          </div>
          <div className="text-sm text-gray-400">Pending Verification</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Three-Source Comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kura-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Candidate</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Audio</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Form 34A</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">IEBC</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Max Delta</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Confidence</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comparison) => (
                <motion.tr
                  key={comparison.candidate_name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-kura-border last:border-b-0 hover:bg-kura-navy/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{comparison.candidate_name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white">{comparison.audio_votes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white">{comparison.form34a_votes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white">{comparison.iebc_votes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${
                      comparison.max_delta === 0 ? 'text-green-400' :
                      comparison.max_delta <= 5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {comparison.max_delta}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="default" size="sm" className={getStatusColor(comparison.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(comparison.status)}
                        <span className="text-xs capitalize">{comparison.status}</span>
                      </div>
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${getConfidenceColor(comparison.confidence)}`}>
                      {Math.round(comparison.confidence * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedComparison(comparison)}
                      className="text-kura-accent hover:text-kura-accent/80 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Comparison View */}
      {selectedComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-kura-surface border border-kura-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Detailed Comparison: {selectedComparison.candidate_name}
            </h3>
            <button
              onClick={() => setSelectedComparison(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Audio Transcription */}
            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Audio Transcription</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Extracted Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.audio_votes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-medium ${getConfidenceColor(selectedComparison.confidence)}`}>
                    {Math.round(selectedComparison.confidence * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">Live Stream</span>
                </div>
              </div>
            </div>

            {/* Form 34A */}
            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Form 34A</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Scanned Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.form34a_votes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scan Status:</span>
                  <span className="text-green-400">Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">Uploaded Document</span>
                </div>
              </div>
            </div>

            {/* IEBC Portal */}
            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">IEBC Portal</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Official Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.iebc_votes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">2 mins ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">IEBC API</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Analysis */}
          <div className="mt-6 p-4 bg-kura-accent/10 border border-kura-accent/30 rounded-lg">
            <h4 className="text-kura-accent font-medium mb-3">Delta Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Audio vs Form 34A</p>
                <p className="text-white font-medium">
                  {Math.abs(selectedComparison.audio_votes - selectedComparison.form34a_votes)} votes
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Form 34A vs IEBC</p>
                <p className="text-white font-medium">
                  {Math.abs(selectedComparison.form34a_votes - selectedComparison.iebc_votes)} votes
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Audio vs IEBC</p>
                <p className="text-white font-medium">
                  {Math.abs(selectedComparison.audio_votes - selectedComparison.iebc_votes)} votes
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center space-x-4">
            <button className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors">
              Mark as Verified
            </button>
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
              Flag Discrepancy
            </button>
            <button className="px-4 py-2 bg-kura-navy border border-kura-border text-white rounded-lg hover:bg-kura-navy-mid transition-colors">
              Request Manual Review
            </button>
          </div>
        </motion.div>
      )}

      {/* Comparison Settings */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Comparison Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-compare</p>
              <p className="text-sm text-gray-400">Automatically compare new data sources</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Delta Threshold</p>
              <p className="text-sm text-gray-400">Maximum allowed vote difference</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>0 votes</option>
              <option>1 vote</option>
              <option>5 votes</option>
              <option>10 votes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Confidence Threshold</p>
              <p className="text-sm text-gray-400">Minimum confidence for auto-verification</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>95%</option>
              <option>90%</option>
              <option>85%</option>
              <option>80%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
