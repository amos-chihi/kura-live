'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PARTY_COLORS = [
  "#00D26A", "#3B82F6", "#FF3B3B", "#FFB800", "#8B5CF6", 
  "#06B6D4", "#EC4899", "#F97316", "#14B8A6", "#6366F1"
]

interface TallyData {
  candidate_name: string
  party: string
  votes: number
  percentage: number
  elective_seat?: string
}

interface TallyProgressChartProps {
  tallyData: TallyData[]
  electionType: string
}

export function TallyProgressChart({ tallyData, electionType }: TallyProgressChartProps) {
  const processedData = useMemo(() => {
    const filtered = tallyData.filter(t => t.elective_seat === electionType)
    const aggregated = filtered.reduce((acc, tally) => {
      const existing = acc.find(item => item.candidate_name === tally.candidate_name)
      if (existing) {
        existing.votes += tally.votes
      } else {
        acc.push({
          candidate_name: tally.candidate_name,
          party: tally.party || 'Independent',
          votes: tally.votes,
          percentage: 0
        })
      }
      return acc
    }, [] as TallyData[])

    const totalVotes = aggregated.reduce((sum, item) => sum + item.votes, 0)
    return aggregated
      .map(item => ({
        ...item,
        percentage: totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10)
  }, [tallyData, electionType])

  const totalVotes = processedData.reduce((sum, item) => sum + item.votes, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#1A1A1F] border border-[#2A2A30] rounded-lg p-2 shadow-xl">
          <div className="text-white text-[12px] font-medium">{data.candidate_name}</div>
          <div className="text-[#71717A] text-[11px]">{data.party}</div>
          <div className="text-white text-[11px] font-medium">{data.votes.toLocaleString()} votes</div>
          <div className="text-[#71717A] text-[11px]">{data.percentage.toFixed(1)}%</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border border-[#1E1E24] bg-[#111114] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Presidential Tally Progress</h3>
        <p className="text-[11px] text-[#52525B]">{totalVotes.toLocaleString()} total votes counted</p>
      </div>

      <div className="space-y-3">
        {processedData.map((item, index) => (
          <div key={item.candidate_name} className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: PARTY_COLORS[index % PARTY_COLORS.length] }}
              />
              <div>
                <div className="text-xs font-medium text-white">{item.candidate_name}</div>
                <div className="text-[10px] text-[#52525B]">{item.party}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white w-16 text-right">
                {item.votes.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#71717A] w-12 text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}

        {/* Progress Bars */}
        <div className="space-y-2 mt-4">
          {processedData.map((item, index) => (
            <div key={`progress-${item.candidate_name}`} className="relative">
              <div className="h-2 rounded-full bg-[#1A1A1F] overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: PARTY_COLORS[index % PARTY_COLORS.length],
                    opacity: 0.8
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="mt-6 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData}>
            <XAxis 
              dataKey="candidate_name" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              fill="#52525B" 
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="votes" 
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PARTY_COLORS[index % PARTY_COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
