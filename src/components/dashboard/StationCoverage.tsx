'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface StationCoverageProps {
  stations: {
    total: number
    declared: number
    active: number
    streaming: number
    pending: number
  }
}

export function StationCoverage({ stations }: StationCoverageProps) {
  const data = [
    { name: 'Declared', value: stations.declared, color: '#00D26A' },
    { name: 'Active', value: stations.active, color: '#3B82F6' },
    { name: 'Streaming', value: stations.streaming, color: '#8B5CF6' },
    { name: 'Pending', value: stations.pending, color: '#2A2A30' }
  ]

  const completionPercentage = stations.total > 0 
    ? ((stations.declared / stations.total) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="rounded-xl border border-[#1E1E24] bg-[#111114] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Station Coverage</h3>
        <p className="text-[11px] text-[#52525B]">{stations.total.toLocaleString()} total stations</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <ResponsiveContainer width={128} height={128}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                strokeWidth={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-white">{completionPercentage}%</div>
            <div className="text-[9px] text-[#52525B]">Complete</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-[#71717A]">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
