'use client'

import { useState, useEffect } from 'react'
import { useTallyStore } from '@/store/tallyStore'
import { useAlertStore } from '@/store/alertStore'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react'

export function ComparisonPanel() {
  const { tallies, comparisonStats, setComparisonStats, setLoading } = useTallyStore()
  const { alerts, addAlert } = useAlertStore()
  
  const [isComparing, setIsComparing] = useState(false)

  const runComparison = async () => {
    setIsComparing(true)
    setLoading(true)

    try {
      // Simulate comparison process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Group tallies by candidate
      const candidateGroups = tallies.reduce((groups, tally) => {
        const candidate = tally.candidate_name
        if (!groups[candidate]) {
          groups[candidate] = []
        }
        groups[candidate].push(tally)
        return groups
      }, {} as Record<string, typeof tallies>)

      let matching = 0
      let discrepancies = 0
      let pending = 0

      // Check each candidate's tallies for discrepancies
      Object.entries(candidateGroups).forEach(([candidateName, candidateTallies]) => {
        const audioVotes = candidateTallies.find(t => t.source === 'audio_ai')?.audio_votes
        const formVotes = candidateTallies.find(t => t.source === 'form_ocr')?.form34a_votes
        const iebcVotes = candidateTallies.find(t => t.iebc_votes !== null)?.iebc_votes

        // If we have all three sources, compare them
        if (audioVotes !== null && audioVotes !== undefined && 
            formVotes !== null && formVotes !== undefined && 
            iebcVotes !== null && iebcVotes !== undefined) {
          const deltas = [
            Math.abs(audioVotes - formVotes),
            Math.abs(audioVotes - iebcVotes),
            Math.abs(formVotes - iebcVotes)
          ]
          
          const maxDelta = Math.max(...deltas)
          
          if (maxDelta === 0) {
            matching++
          } else {
            discrepancies++
            
            // Create alert for discrepancy
            addAlert({
              id: `alert-${Date.now()}-${candidateName}`,
              station_code: candidateTallies[0].station_code,
              agent_id: candidateTallies[0].agent_id,
              candidate_name: candidateName,
              delta: maxDelta,
              audio_votes: audioVotes || null,
              form34a_votes: formVotes || null,
              iebc_votes: iebcVotes || null,
              severity: maxDelta >= 5 ? 'critical' : 'warning',
              alert_status: 'open',
              created_at: new Date().toISOString()
            })
          }
        } else {
          pending++
        }
      })

      const stats = {
        total_candidates: Object.keys(candidateGroups).length,
        matching,
        pending,
        discrepancies
      }

      setComparisonStats(stats)

    } catch (error) {
      console.error('Comparison failed:', error)
    } finally {
      setIsComparing(false)
      setLoading(false)
    }
  }

  const getStatusColor = (status: 'match' | 'discrepancy' | 'pending') => {
    switch (status) {
      case 'match':
        return 'text-kura-green'
      case 'discrepancy':
        return 'text-kura-accent2'
      case 'pending':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: 'match' | 'discrepancy' | 'pending') => {
    switch (status) {
      case 'match':
        return <CheckCircle className="w-4 h-4" />
      case 'discrepancy':
        return <AlertTriangle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: 'match' | 'discrepancy' | 'pending') => {
    switch (status) {
      case 'match':
        return <Badge variant="success" size="sm">MATCH</Badge>
      case 'discrepancy':
        return <Badge variant="error" size="sm">DISCREPANCY</Badge>
      case 'pending':
        return <Badge variant="default" size="sm">PENDING</Badge>
      default:
        return <Badge variant="default" size="sm">PENDING</Badge>
    }
  }

  // Group tallies by candidate for display
  const candidateGroups = tallies.reduce((groups, tally) => {
    const candidate = tally.candidate_name
    if (!groups[candidate]) {
      groups[candidate] = []
    }
    groups[candidate].push(tally)
    return groups
  }, {} as Record<string, typeof tallies>)

  return (
    <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-kura-accent" />
          Three-Source Comparison
        </h2>
        <button
          onClick={runComparison}
          disabled={isComparing || tallies.length === 0}
          className="flex items-center px-6 py-2 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isComparing ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Comparing...</span>
            </>
          ) : (
            'Run Comparison'
          )}
        </button>
      </div>

      {/* Comparison Stats */}
      {comparisonStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-kura-navy border border-kura-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {comparisonStats.total_candidates}
            </div>
            <div className="text-sm text-gray-400">Candidates</div>
          </div>
          <div className="bg-kura-navy border border-kura-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-kura-green mb-1">
              {comparisonStats.matching}
            </div>
            <div className="text-sm text-gray-400">Matching</div>
          </div>
          <div className="bg-kura-navy border border-kura-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-kura-accent2 mb-1">
              {comparisonStats.discrepancies}
            </div>
            <div className="text-sm text-gray-400">Discrepancies</div>
          </div>
          <div className="bg-kura-navy border border-kura-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400 mb-1">
              {comparisonStats.pending}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-kura-navy border border-kura-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-kura-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Candidate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Party</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Audio AI</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Form 34A</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">IEBC</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Delta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(candidateGroups).map(([candidateName, candidateTallies]) => {
              const audioVotes = candidateTallies.find(t => t.source === 'audio_ai')?.audio_votes
              const formVotes = candidateTallies.find(t => t.source === 'form_ocr')?.form34a_votes
              const iebcVotes = candidateTallies.find(t => t.iebc_votes !== null)?.iebc_votes

              // Calculate status
              let status: 'match' | 'discrepancy' | 'pending' = 'pending'
              let maxDelta = 0

              if (audioVotes !== null && audioVotes !== undefined && 
                  formVotes !== null && formVotes !== undefined && 
                  iebcVotes !== null && iebcVotes !== undefined) {
                const deltas = [
                  Math.abs(audioVotes - formVotes),
                  Math.abs(audioVotes - iebcVotes),
                  Math.abs(formVotes - iebcVotes)
                ]
                maxDelta = Math.max(...deltas)
                status = maxDelta === 0 ? 'match' : 'discrepancy'
              }

              return (
                <tr 
                  key={candidateName}
                  className={`border-b border-kura-border last:border-b-0 ${
                    status === 'match' ? 'bg-green-900/20' :
                    status === 'discrepancy' ? 'bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-white font-medium">{candidateName}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {candidateTallies[0]?.party || '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono">
                    {audioVotes !== null && audioVotes !== undefined ? audioVotes.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono">
                    {formVotes !== null && formVotes !== undefined ? formVotes.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono">
                    {iebcVotes !== null && iebcVotes !== undefined ? iebcVotes.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="ml-1 font-mono">
                        {maxDelta > 0 ? `+${maxDelta}` : '0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(status)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {Object.keys(candidateGroups).length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              No data available. Add tallies from Transcription and Results panels to compare.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
