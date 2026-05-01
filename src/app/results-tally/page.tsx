'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Search, Download, FileSpreadsheet } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { generateKenyanName, KENYAN_COUNTIES, KENYAN_POLITICAL_PARTIES } from '@/lib/kenyanData'

interface TallyResult {
  id: string
  candidate_name: string
  party: string
  votes: number
  elective_seat: string
  station_code: string
  verification_status: string
  created_at: string
}

interface AggregatedResult {
  candidate_name: string
  party: string
  votes: number
  station_count: number
  verification_status: string[]
  percentage: number
  rank: number
}

const COLORS = ["#00D26A","#3B82F6","#FF3B3B","#FFB800","#8B5CF6","#06B6D4","#EC4899","#F97316","#14B8A6","#6366F1"]

const ELECTION_SEATS = [
  { id: 'president', label: 'President' },
  { id: 'governor', label: 'Governor' },
  { id: 'senator', label: 'Senator' },
  { id: 'mp', label: 'MP' },
  { id: 'woman_rep', label: 'Woman Rep' },
  { id: 'mca', label: 'MCA' }
]

export default function ResultsTallyPage() {
  const [tallyResults, setTallyResults] = useState<TallyResult[]>([])
  const [seat, setSeat] = useState('president')
  const [countyFilter, setCountyFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockCandidates = Array.from({ length: 20 }, (_, i) => ({
      name: generateKenyanName(),
      party: KENYAN_POLITICAL_PARTIES[Math.floor(Math.random() * KENYAN_POLITICAL_PARTIES.length)]
    }))
    
    const mockTallies: TallyResult[] = Array.from({ length: 500 }, (_, i) => {
      const candidate = mockCandidates[Math.floor(Math.random() * mockCandidates.length)]
      const seats = ['president', 'governor', 'senator', 'mp', 'woman_rep', 'mca']
      
      return {
        id: `tally-${i}`,
        candidate_name: candidate.name,
        party: candidate.party,
        votes: Math.floor(Math.random() * 500) + 50,
        elective_seat: seats[Math.floor(Math.random() * seats.length)],
        station_code: `KE-${String(Math.floor(Math.random() * 47) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 290) + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
        verification_status: Math.random() > 0.3 ? 'verified' : 'pending',
        created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    })

    setTallyResults(mockTallies)
    setLoading(false)
  }, [])

  const aggregatedResults = useMemo(() => {
    let filtered = tallyResults.filter(tally => tally.elective_seat === seat)
    
    if (countyFilter !== 'all') {
      // In real app, filter by county from station data
      filtered = filtered.filter(tally => Math.random() > 0.5) // Mock county filter
    }
    
    if (search) {
      filtered = filtered.filter(tally => 
        tally.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
        tally.party.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Group by candidate_name
    const grouped = filtered.reduce((acc, tally) => {
      const existing = acc.find(item => item.candidate_name === tally.candidate_name)
      if (existing) {
        existing.votes += tally.votes
        existing.station_count += 1
        if (!existing.verification_status.includes(tally.verification_status)) {
          existing.verification_status.push(tally.verification_status)
        }
      } else {
        acc.push({
          candidate_name: tally.candidate_name,
          party: tally.party,
          votes: tally.votes,
          station_count: 1,
          verification_status: [tally.verification_status],
          percentage: 0,
          rank: 0
        })
      }
      return acc
    }, [] as AggregatedResult[])

    // Calculate percentages and ranks
    const totalVotes = grouped.reduce((sum, result) => sum + result.votes, 0)
    grouped.forEach(result => {
      result.percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
    })
    
    grouped.sort((a, b) => b.votes - a.votes)
    grouped.forEach((result, index) => {
      result.rank = index + 1
    })

    return grouped
  }, [tallyResults, seat, countyFilter, search])

  const totalVotes = aggregatedResults.reduce((sum, result) => sum + result.votes, 0)
  const counties = useMemo(() => {
    const uniqueCounties = KENYAN_COUNTIES.slice(0, 10)
    return ['all', ...uniqueCounties]
  }, [])

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(aggregatedResults.map(result => ({
      Rank: result.rank,
      Candidate: result.candidate_name,
      Party: result.party,
      Votes: result.votes,
      'Stations Reporting': result.station_count,
      'Percentage (%):': result.percentage.toFixed(2),
      'Verification Status': result.verification_status.join(', ')
    })))
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${seat} Results`)
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    saveAs(data, `${seat}-results-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToGoogleSheets = () => {
    // In a real implementation, this would use Google Sheets API
    const csvContent = [
      ['Rank', 'Candidate', 'Party', 'Votes', 'Stations Reporting', 'Percentage (%)', 'Verification Status'],
      ...aggregatedResults.map(result => [
        result.rank,
        result.candidate_name,
        result.party,
        result.votes,
        result.station_count,
        result.percentage.toFixed(2),
        result.verification_status.join(', ')
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    saveAs(blob, `${seat}-results-${new Date().toISOString().split('T')[0]}.csv`)
    
    // In production, you would upload this to Google Sheets via API
    console.log('Google Sheets export initiated')
  }

  return (
    <div className="min-h-screen bg-kura-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-6 h-6 text-[#00D26A]" />
            <h1 className="text-2xl font-bold text-white">Results Tally</h1>
          </div>
          <p className="text-sm text-kura-text-body">
            Real-time aggregated results from all reporting stations
          </p>
        </div>

        {/* Seat Tabs */}
        <div className="bg-[#111114] border border-[#1E1E24] h-9 rounded-lg flex items-center overflow-x-auto">
          {ELECTION_SEATS.map((seatOption) => (
            <button
              key={seatOption.id}
              onClick={() => setSeat(seatOption.id)}
              className={`px-4 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                seat === seatOption.id
                  ? 'bg-[#00D26A]/10 text-[#00D26A]'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              {seatOption.label}
            </button>
          ))}
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              placeholder="Search candidate or party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 bg-[#111114] border border-[#1E1E24] text-white text-xs h-9 rounded-lg focus:outline-none focus:border-[#00D26A]"
            />
          </div>
          
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="w-44 bg-[#111114] border border-[#1E1E24] text-white text-xs h-9 rounded-lg pl-3 pr-8 appearance-none"
          >
            <option value="all">National (All Counties)</option>
            {counties.slice(1).map((county) => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="p-2 bg-[#111114] border border-[#1E1E24] rounded-lg hover:bg-[#1A1A1F] transition-colors"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-kura-text" />
            </button>
            <button
              onClick={exportToGoogleSheets}
              className="p-2 bg-[#111114] border border-[#1E1E24] rounded-lg hover:bg-[#1A1A1F] transition-colors"
              title="Export to Google Sheets"
            >
              <Download className="w-4 h-4 text-kura-text" />
            </button>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="flex items-center gap-6 px-1">
          <div>
            <div className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</div>
            <div className="text-[11px] text-[#52525B] uppercase tracking-wider">Total Votes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{aggregatedResults.length}</div>
            <div className="text-[11px] text-[#52525B] uppercase tracking-wider">Candidates</div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#111114] border border-[#1E1E24] rounded-lg animate-pulse"></div>
            ))
          ) : aggregatedResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-[#52525B] mx-auto mb-4" />
              <p className="text-sm text-[#52525B]">No results found</p>
            </div>
          ) : (
            aggregatedResults.map((result, index) => (
              <motion.div
                key={result.candidate_name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-[#1E1E24] bg-[#111114] hover:border-[#2A2A30] transition-colors"
              >
                {/* Rank Badge */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ 
                    backgroundColor: COLORS[index % COLORS.length] + '15',
                    color: COLORS[index % COLORS.length]
                  }}
                >
                  {result.rank}
                </div>

                {/* Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{result.candidate_name}</span>
                    <span className="text-[11px] text-[#52525B]">• {result.party}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {result.verification_status.includes('verified') && (
                      <span className="text-green-500 text-[10px]">✓</span>
                    )}
                    {result.verification_status.includes('pending') && (
                      <span className="text-amber-500 text-[10px]">⏱</span>
                    )}
                    <span className="text-[10px] text-[#71717A]">
                      {result.station_count} stations
                    </span>
                  </div>
                </div>

                {/* Votes and Progress */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{result.votes.toLocaleString()}</div>
                    <div className="text-[11px] text-[#71717A]">{result.percentage.toFixed(2)}%</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="hidden md:block w-32">
                    <div className="h-2 rounded-full bg-[#1A1A1F] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.percentage}%` }}
                        transition={{ delay: index * 0.06 + 0.2, duration: 0.6 }}
                        className="h-full"
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length],
                          opacity: 0.75
                        }}
                      />
                    </div>
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
