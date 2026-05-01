'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function ResultsTallyPanel() {
  const [selectedView, setSelectedView] = useState<'national' | 'county'>('national')
  const { tallies, total_votes, stations_reporting } = useWebSocketStore()

  // Sort tallies by votes
  const sortedTallies = [...tallies].sort((a, b) => b.votes - a.votes)
  
  // Calculate projected winner
  const leadingCandidate = sortedTallies[0]
  const winnerProbability = leadingCandidate ? Math.round((leadingCandidate.percentage / 100) * 85 + 15) : 0

  // Party colors
  const partyColors: { [key: string]: string } = {
    'UDA': '#00D26A',
    'ODM': '#3B82F6',
    'Jubilee': '#F5B942',
    'Wiper': '#8B5CF6',
    'ANC': '#EC4899',
    'Ford Kenya': '#14B8A6',
    'DPP': '#F97316',
    'UDP': '#6366F1'
  }

  const getPartyColor = (party: string) => {
    return partyColors[party] || '#94A3B8'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-kura-green" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-kura-red" />
      default:
        return <Minus className="w-4 h-4 text-kura-muted" />
    }
  }

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-kura-green" />
            <span>Results Tally</span>
          </h2>
          <p className="text-xs text-kura-muted">National election results</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex space-x-2">
          {(['national', 'county'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`ops-button text-xs capitalize ${
                selectedView === view ? 'ops-button-primary' : 'ops-button-secondary'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* County Reporting Progress */}
      <div className="p-4 border-b border-kura-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-kura-muted">County Reporting Progress</span>
          <span className="text-xs text-kura-text font-medium">
            {Math.round((stations_reporting / 47) * 100)}%
          </span>
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stations_reporting / 47) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-kura-blue to-kura-green"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-kura-muted">0</span>
          <span className="text-[10px] text-kura-muted">47 Counties</span>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedTallies.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-kura-panel2 border border-kura-border rounded-lg p-3 ${
              index === 0 ? 'ring-2 ring-kura-green/50 shadow-glow-green' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Rank Badge */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: getPartyColor(candidate.party) }}
              >
                {index + 1}
              </div>

              {/* Candidate Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-kura-text">
                    {candidate.candidate_name}
                  </span>
                  {getTrendIcon(candidate.trend)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPartyColor(candidate.party) }}
                  />
                  <span className="text-xs text-kura-muted">{candidate.party}</span>
                  <span className="text-xs text-kura-muted">•</span>
                  <span className="text-xs text-kura-muted">
                    {candidate.stations_reporting} stations
                  </span>
                </div>
              </div>

              {/* Votes and Percentage */}
              <div className="text-right">
                <div className="text-lg font-bold text-kura-text">
                  {candidate.votes.toLocaleString()}
                </div>
                <div className="text-xs text-kura-muted">
                  {candidate.percentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-kura-panel rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className="h-full"
                  style={{ backgroundColor: getPartyColor(candidate.party) }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Projected Winner */}
      <div className="p-4 border-t border-kura-border">
        <div className="bg-kura-panel2 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-kura-muted mb-1">Projected Winner</p>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPartyColor(leadingCandidate?.party || '') }}
                />
                <span className="text-sm font-semibold text-kura-text">
                  {leadingCandidate?.candidate_name || 'TBD'}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-kura-green">
                {winnerProbability}%
              </div>
              <p className="text-xs text-kura-muted">Probability</p>
            </div>
          </div>
          
          {/* Probability Gauge */}
          <div className="mt-3">
            <div className="w-full bg-kura-panel rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winnerProbability}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-kura-amber to-kura-green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="p-4 border-t border-kura-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-kura-muted">Vote Trend (Last Hour)</span>
          <Users className="w-4 h-4 text-kura-muted" />
        </div>
        
        {/* Simple trend visualization */}
        <div className="flex items-end space-x-1 h-16">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = Math.random() * 100
            const isLeading = i === 11 // Current position
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`flex-1 rounded-t ${
                  isLeading ? 'bg-kura-green' : 'bg-kura-blue/50'
                }`}
              />
            )
          })}
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-kura-muted">-1h</span>
          <span className="text-[9px] text-kura-muted">Now</span>
        </div>
      </div>
    </div>
  )
}
