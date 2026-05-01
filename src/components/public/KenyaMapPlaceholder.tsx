'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'

export function KenyaMapPlaceholder() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)

  // Mock county data with results
  const counties = [
    { name: 'Nairobi', code: 'NBR', reporting: 92, leader: 'UDA', color: 'bg-kura-green' },
    { name: 'Mombasa', code: 'MSA', reporting: 88, leader: 'ODM', color: 'bg-kura-accent' },
    { name: 'Kisumu', code: 'KSM', reporting: 95, leader: 'ODM', color: 'bg-kura-accent' },
    { name: 'Nakuru', code: 'NRK', reporting: 90, leader: 'UDA', color: 'bg-kura-green' },
    { name: 'Eldoret', code: 'ELD', reporting: 87, leader: 'UDA', color: 'bg-kura-green' },
    { name: 'Kisii', code: 'KSI', reporting: 91, leader: 'ANC', color: 'bg-kura-amber' },
    { name: 'Kitale', code: 'KTL', reporting: 85, leader: 'UDA', color: 'bg-kura-green' },
    { name: 'Kakamega', code: 'KKG', reporting: 89, leader: 'ODM', color: 'bg-kura-accent' },
    { name: 'Meru', code: 'MRU', reporting: 93, leader: 'UDA', color: 'bg-kura-green' },
    { name: 'Nanyuki', code: 'NYK', reporting: 86, leader: 'UDA', color: 'bg-kura-green' },
  ]

  const handleCountyClick = (county: typeof counties[0]) => {
    setSelectedCounty(county.name === selectedCounty ? null : county.name)
  }

  return (
    <div className="space-y-4">
      {/* SVG Map Placeholder */}
      <div className="relative bg-kura-navy rounded-lg p-4 h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {counties.slice(0, 9).map((county) => (
              <button
                key={county.code}
                onClick={() => handleCountyClick(county)}
                className={`
                  p-2 rounded text-xs font-medium transition-all
                  ${county.color} hover:opacity-80
                  ${selectedCounty === county.name ? 'ring-2 ring-white' : ''}
                `}
              >
                {county.code}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4">Interactive Kenya Map</p>
        </div>
      </div>

      {/* County Details */}
      {selectedCounty && (
        <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium">{selectedCounty}</h3>
            <button
              onClick={() => setSelectedCounty(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ×
            </button>
          </div>
          
          {(() => {
            const county = counties.find(c => c.name === selectedCounty)
            if (!county) return null
            
            return (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reporting:</span>
                  <span className="text-white">{county.reporting}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Leading:</span>
                  <Badge variant="default" size="sm">{county.leader}</Badge>
                </div>
                <div className="w-full bg-kura-navy-mid rounded-full h-2 mt-2">
                  <div 
                    className="bg-kura-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${county.reporting}%` }}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Leading Party by County</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-kura-green rounded"></div>
            <span className="text-gray-400">UDA</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-kura-accent rounded"></div>
            <span className="text-gray-400">ODM</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-kura-amber rounded"></div>
            <span className="text-gray-400">ANC</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span className="text-gray-400">Other</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-kura-border">
        <div className="text-center">
          <div className="text-lg font-bold text-kura-green">47</div>
          <div className="text-xs text-gray-400">Total Counties</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-kura-accent">89.2%</div>
          <div className="text-xs text-gray-400">Avg Reporting</div>
        </div>
      </div>
    </div>
  )
}
