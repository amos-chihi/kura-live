'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'

interface TallyEntry {
  id: string
  candidate_name: string
  party: string
  station_name: string
  constituency: string
  votes: number
  verification_status: 'verified' | 'pending'
  created_at: string
}

interface LiveTickerProps {
  tallies: TallyEntry[]
}

export function LiveTicker({ tallies }: LiveTickerProps) {
  const [latestTallies, setLatestTallies] = useState<TallyEntry[]>([])

  useEffect(() => {
    // Get latest 20 entries, sorted by created_date desc
    const sorted = [...tallies]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
    setLatestTallies(sorted)
  }, [tallies])

  return (
    <div className="rounded-xl border border-[#1E1E24] bg-[#111114] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00D26A] rounded-full live-pulse"></div>
          <h3 className="text-sm font-semibold text-white">Live Results Feed</h3>
        </div>
        <div className="text-[10px] text-[#52525B]">
          {latestTallies.length} latest
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto space-y-2">
        {latestTallies.map((tally, index) => (
          <motion.div
            key={tally.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0B] border border-[#1A1A1F] hover:border-[#2A2A30] transition-colors"
          >
            {/* Status Icon */}
            <div className="p-1.5 rounded-md">
              {tally.verification_status === 'verified' ? (
                <div className="bg-[#00D26A]/10 p-1 rounded">
                  <CheckCircle2 className="w-3 h-3 text-[#00D26A]" />
                </div>
              ) : (
                <div className="bg-[#FFB800]/10 p-1 rounded">
                  <Clock className="w-3 h-3 text-[#FFB800]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white">
                {tally.candidate_name} — {tally.party}
              </div>
              <div className="text-[11px] text-[#52525B]">
                {tally.station_name} · {tally.constituency}
              </div>
            </div>

            {/* Vote Count */}
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {tally.votes.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#52525B]">votes</div>
            </div>
          </motion.div>
        ))}

        {latestTallies.length === 0 && (
          <div className="text-center py-8">
            <div className="text-[#52525B] text-sm">No results yet</div>
            <div className="text-[#71717A] text-[11px] mt-1">Waiting for polling stations to report</div>
          </div>
        )}
      </div>
    </div>
  )
}
