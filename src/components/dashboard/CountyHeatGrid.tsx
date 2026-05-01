'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

// All 47 Kenyan counties in order
const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Muranga', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Bomet',
  'Kericho', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
]

interface CountyData {
  name: string
  votes: number
  stationsReported: number
  totalStations: number
}

interface CountyHeatGridProps {
  countyData: CountyData[]
}

export function CountyHeatGrid({ countyData }: CountyHeatGridProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)

  const maxVotes = Math.max(...countyData.map(d => d.votes), 1)

  const getCountyData = (countyName: string) => {
    return countyData.find(d => d.name === countyName) || {
      name: countyName,
      votes: 0,
      stationsReported: 0,
      totalStations: 0
    }
  }

  const getIntensity = (votes: number) => {
    return Math.max(0.15, votes / maxVotes)
  }

  const getReportedPercentage = (county: CountyData) => {
    return county.totalStations > 0 
      ? ((county.stationsReported / county.totalStations) * 100).toFixed(1)
      : '0.0'
  }

  return (
    <div className="rounded-xl border border-[#1E1E24] bg-[#111114] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">County Results Grid</h3>
        <p className="text-[11px] text-[#52525B]">47 counties — tap to drill down</p>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
        {KENYA_COUNTIES.map((countyName, index) => {
          const county = getCountyData(countyName)
          const intensity = getIntensity(county.votes)
          const hasVotes = county.votes > 0

          return (
            <motion.div
              key={countyName}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.01 }}
              className="relative group"
              onMouseEnter={() => setHoveredCounty(countyName)}
              onMouseLeave={() => setHoveredCounty(null)}
            >
              <div
                className={`
                  aspect-square rounded-md cursor-pointer transition-all
                  hover:scale-110 hover:z-10
                  ${hasVotes 
                    ? `rgba(0, 210, 106, ${intensity})` 
                    : 'rgba(42, 42, 48, 0.5)'
                  }
                `}
                style={{
                  backgroundColor: hasVotes 
                    ? `rgba(0, 210, 106, ${intensity})`
                    : 'rgba(42, 42, 48, 0.5)',
                  border: hasVotes 
                    ? `rgba(0, 210, 106, 0.2) solid 1px`
                    : 'rgba(42, 42, 48, 0.3) solid 1px'
                }}
              >
                <div className="text-[7px] font-medium text-white/60 text-center leading-tight p-1">
                  {countyName.slice(0, 4).toUpperCase()}
                </div>
              </div>

              {/* Hover Tooltip */}
              {hoveredCounty === countyName && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#1A1A1F] border border-[#2A2A30] rounded-lg p-2.5 shadow-xl z-50 whitespace-nowrap">
                  <div className="text-[10px] font-medium text-white mb-1">
                    {countyName}
                  </div>
                  <div className="text-[9px] text-[#71717A]">
                    {county.votes.toLocaleString()} votes
                  </div>
                  <div className="text-[9px] text-[#52525B]">
                    {getReportedPercentage(county)}% reported
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2A2A30]"></div>
          <span className="text-[9px] text-[#71717A]">No data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D26A]/30"></div>
          <span className="text-[9px] text-[#71717A]">Low activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D26A]/60"></div>
          <span className="text-[9px] text-[#71717A]">Medium activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D26A]"></div>
          <span className="text-[9px] text-[#71717A]">High activity</span>
        </div>
      </div>
    </div>
  )
}
