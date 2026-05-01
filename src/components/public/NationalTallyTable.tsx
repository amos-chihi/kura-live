'use client'

import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { DEMO_CANDIDATES } from '@/lib/demo-data'

export function NationalTallyTable() {
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES)
  const [sortOrder, setSortOrder] = useState<'votes' | 'name'>('votes')
  const [isExpanded, setIsExpanded] = useState(false)

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.iebc_votes, 0)

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortOrder === 'votes') {
      return b.iebc_votes - a.iebc_votes
    }
    return a.candidate_name.localeCompare(b.candidate_name)
  })

  const displayedCandidates = isExpanded ? sortedCandidates : sortedCandidates.slice(0, 5)

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0
  }

  const getWinnerBadge = (index: number) => {
    if (index === 0) return <Badge variant="success">LEADING</Badge>
    return null
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSortOrder('votes')}
            className={`text-sm font-medium transition-colors ${
              sortOrder === 'votes' ? 'text-kura-accent' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sort by Votes
          </button>
          <button
            onClick={() => setSortOrder('name')}
            className={`text-sm font-medium transition-colors ${
              sortOrder === 'name' ? 'text-kura-accent' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sort by Name
          </button>
        </div>
        
        <div className="text-sm text-gray-400">
          Total Votes: {totalVotes.toLocaleString()}
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-kura-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Candidate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Party</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Votes</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">%</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Progress</th>
            </tr>
          </thead>
          <tbody>
            {displayedCandidates.map((candidate, index) => {
              const percentage = getPercentage(candidate.iebc_votes)
              const rank = sortedCandidates.findIndex(c => c.candidate_name === candidate.candidate_name) + 1
              
              return (
                <tr 
                  key={candidate.candidate_name}
                  className={`border-b border-kura-border last:border-b-0 ${
                    rank === 1 ? 'bg-kura-green/10' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className={`font-bold text-lg ${
                      rank === 1 ? 'text-kura-green' : 'text-gray-400'
                    }`}>
                      #{rank}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-white font-medium">{candidate.candidate_name}</div>
                        {getWinnerBadge(index)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300">{candidate.party}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-white font-mono font-medium">
                      {candidate.iebc_votes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-white font-mono">
                      {percentage.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-kura-navy rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          rank === 1 ? 'bg-kura-green' : 'bg-kura-accent'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Show More/Less Button */}
      {candidates.length > 5 && (
        <div className="text-center pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-2 bg-kura-navy-mid hover:bg-kura-navy-mid/80 text-white rounded-lg transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All ${candidates.length} Candidates`}
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-kura-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-kura-green">
            {sortedCandidates[0].candidate_name}
          </div>
          <div className="text-sm text-gray-400">Leading Candidate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {getPercentage(sortedCandidates[0].iebc_votes).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Lead Percentage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-kura-accent">
            {sortedCandidates[0].iebc_votes - sortedCandidates[1].iebc_votes}
          </div>
          <div className="text-sm text-gray-400">Vote Margin</div>
        </div>
      </div>
    </div>
  )
}
