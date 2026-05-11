'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Eye, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'
import { useTallyStore } from '@/store/tallyStore'

interface ComparisonPanelProps {
  agent: Agent | null
}

interface VoteComparison {
  candidate_name: string
  audio_votes: number | null
  form34a_votes: number | null
  iebc_votes: number | null
  max_delta: number
  status: 'match' | 'discrepancy' | 'pending'
  confidence: number
}

export default function ComparisonPanel({ agent }: ComparisonPanelProps) {
  const tallies = useTallyStore((state) => state.tallies)
  const [selectedComparison, setSelectedComparison] = useState<VoteComparison | null>(null)

  const comparisons = useMemo(() => {
    const byCandidate = new Map<string, VoteComparison>()

    for (const tally of tallies) {
      const key = tally.candidate_name.toLowerCase()
      const current = byCandidate.get(key) ?? {
        candidate_name: tally.candidate_name,
        audio_votes: null,
        form34a_votes: null,
        iebc_votes: null,
        max_delta: 0,
        status: 'pending',
        confidence: tally.confidence,
      }

      if (tally.audio_votes !== null) {
        current.audio_votes = tally.audio_votes
      }
      if (tally.form34a_votes !== null) {
        current.form34a_votes = tally.form34a_votes
      }
      if (tally.iebc_votes !== null) {
        current.iebc_votes = tally.iebc_votes
      }

      current.confidence = Math.max(current.confidence, tally.confidence)
      byCandidate.set(key, current)
    }

    return Array.from(byCandidate.values())
      .map((comparison): VoteComparison => {
        const votes = [comparison.audio_votes, comparison.form34a_votes, comparison.iebc_votes]
          .filter((value): value is number => value !== null)

        const max = votes.length > 0 ? Math.max(...votes) : 0
        const min = votes.length > 0 ? Math.min(...votes) : 0
        const maxDelta = votes.length > 1 ? max - min : 0

        return {
          ...comparison,
          max_delta: maxDelta,
          status: votes.length < 3 ? 'pending' : maxDelta === 0 ? 'match' : 'discrepancy',
        }
      })
      .sort((left, right) => right.max_delta - left.max_delta || left.candidate_name.localeCompare(right.candidate_name))
  }, [tallies])

  const stats = {
    total_candidates: comparisons.length,
    matching: comparisons.filter((item) => item.status === 'match').length,
    discrepancies: comparisons.filter((item) => item.status === 'discrepancy').length,
    pending: comparisons.filter((item) => item.status === 'pending').length,
  }

  const getStatusColor = (status: VoteComparison['status']) => {
    switch (status) {
      case 'match':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'discrepancy':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: VoteComparison['status']) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="w-4 h-4" />
      case 'discrepancy':
        return <AlertTriangle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Three-Source Comparison</h2>
          <div className="text-sm text-gray-400">
            Station {agent?.station_code ?? 'unassigned'}
          </div>
        </div>

        {comparisons.length > 0 ? (
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
                    <td className="px-4 py-3 text-center text-white">{comparison.audio_votes ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-white">{comparison.form34a_votes ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-white">{comparison.iebc_votes ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-medium ${
                          comparison.max_delta === 0
                            ? 'text-green-400'
                            : comparison.max_delta <= 5
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
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
        ) : (
          <div className="rounded-lg bg-kura-navy p-6 text-sm text-gray-400">
            No comparison data yet. Run live transcription or upload Form 34A/IEBC data to populate this matrix.
          </div>
        )}
      </div>

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
            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Audio Transcription</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Extracted Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.audio_votes ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-medium ${getConfidenceColor(selectedComparison.confidence)}`}>
                    {Math.round(selectedComparison.confidence * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">Live tab audio capture</span>
                </div>
              </div>
            </div>

            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Form 34A</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Scanned Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.form34a_votes ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scan Status:</span>
                  <span className="text-green-400">
                    {selectedComparison.form34a_votes !== null ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">Uploaded document</span>
                </div>
              </div>
            </div>

            <div className="bg-kura-navy rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">IEBC Portal</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Published Votes:</span>
                  <span className="text-white font-medium">{selectedComparison.iebc_votes ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">
                    {selectedComparison.iebc_votes !== null ? 'Fetched' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">IEBC portal sync</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
