'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import { Search, MapPin, Users } from 'lucide-react'

export function StationSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Mock station data
  const mockStations = [
    {
      station_code: 'KE-047-290-0001',
      station_name: 'Westlands Primary School Stream 1',
      constituency: 'Westlands',
      county: 'Nairobi',
      registered_voters: 347,
      reporting_status: 'complete',
      leading_candidate: 'John Kariuki',
      leading_party: 'UDA'
    },
    {
      station_code: 'KE-047-290-0002',
      station_name: 'Westlands Primary School Stream 2',
      constituency: 'Westlands',
      county: 'Nairobi',
      registered_voters: 352,
      reporting_status: 'complete',
      leading_candidate: 'John Kariuki',
      leading_party: 'UDA'
    },
    {
      station_code: 'KE-047-290-0003',
      station_name: 'Kangemi Health Centre Stream 1',
      constituency: 'Westlands',
      county: 'Nairobi',
      registered_voters: 289,
      reporting_status: 'in_progress',
      leading_candidate: 'Mary Wambui',
      leading_party: 'ODM'
    },
  ]

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find matching station (mock)
      const station = mockStations.find(s => 
        s.station_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.constituency.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      setSelectedStation(station || null)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="success" size="sm">Complete</Badge>
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>
      default:
        return <Badge variant="default" size="sm">Pending</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter station code, name, or constituency..."
          className="w-full px-4 py-2 pl-10 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      </div>

      <button
        onClick={handleSearch}
        disabled={isSearching || !searchTerm.trim()}
        className="w-full px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {isSearching ? 'Searching...' : 'Search Station'}
      </button>

      {/* Search Results */}
      {selectedStation && (
        <div className="bg-kura-navy border border-kura-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">{selectedStation.station_name}</h3>
            {getStatusBadge(selectedStation.reporting_status)}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Code:</span>
              <span className="text-white font-mono">{selectedStation.station_code}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Location:</span>
              <span className="text-white">{selectedStation.constituency}, {selectedStation.county}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Registered Voters:</span>
              <span className="text-white">{selectedStation.registered_voters.toLocaleString()}</span>
            </div>
            
            <div className="pt-2 border-t border-kura-border">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Leading:</span>
                <div className="text-right">
                  <div className="text-white font-medium">{selectedStation.leading_candidate}</div>
                  <Badge variant="default" size="sm">{selectedStation.leading_party}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && selectedStation === null && !isSearching && (
        <div className="text-center py-4">
          <MapPin className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No station found</p>
          <p className="text-gray-500 text-xs">Try a different station code or name</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Search by station code (e.g., KE-047-290-0001)</p>
        <p>Or station name (e.g., Westlands Primary)</p>
        <p>Or constituency (e.g., Westlands)</p>
      </div>
    </div>
  )
}
