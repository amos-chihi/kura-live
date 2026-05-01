'use client'

import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import { NationalTallyTable } from '@/components/public/NationalTallyTable'
import { KenyaStreamingMap } from '@/components/public/KenyaStreamingMap'
import { StationSearch } from '@/components/public/StationSearch'
import { ResultsPortalNav } from '@/components/public/ResultsPortalNav'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp,
  RefreshCw
} from 'lucide-react'

export default function ResultsPage() {
  const [stats, setStats] = useState({
    totalStations: 46229,
    reportingStations: 41234,
    totalVotes: 12547890,
    voterTurnout: 67.8
  })

  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-kura-navy">
      {/* Header */}
      <header className="bg-kura-surface border-b border-kura-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-kura-accent">KURA LIVE</h1>
              <span className="ml-4 text-gray-400">Kenya Election 2027 - Live Results</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-sm text-white font-mono">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-kura-navy-mid rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <ResultsPortalNav />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Stations"
            value={stats.totalStations.toLocaleString()}
            change={{ value: 89.2, type: 'increase' }}
            icon={<BarChart3 className="w-6 h-6" />}
          />
          <StatCard
            title="Reporting Stations"
            value={`${((stats.reportingStations / stats.totalStations) * 100).toFixed(1)}%`}
            change={{ value: 2.3, type: 'increase' }}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Total Votes Cast"
            value={stats.totalVotes.toLocaleString()}
            change={{ value: 5.7, type: 'increase' }}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            title="Voter Turnout"
            value={`${stats.voterTurnout}%`}
            change={{ value: 1.2, type: 'increase' }}
            icon={<MapPin className="w-6 h-6" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map and Search */}
          <div className="lg:col-span-1 space-y-6">
            {/* Kenya Map */}
            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Kenya Map</h2>
              <KenyaStreamingMap />
            </div>

            {/* Station Search */}
            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Station Search</h2>
              <StationSearch />
            </div>

            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Module Access</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Use the public modules to move between national tallies, geographic coverage, and polling-station lookup.</p>
                <ul className="space-y-2 text-gray-400">
                  <li>Live Results: national pulse, turnout, and leading candidates.</li>
                  <li>Tally Board: seat-level aggregation and export workflow.</li>
                  <li>Geo Monitor: county heat view and stream visibility.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Results Table */}
          <div className="lg:col-span-2">
            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">National Results</h2>
                <Badge variant="info" className="animate-pulse">
                  LIVE
                </Badge>
              </div>
              
              <NationalTallyTable />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Kenya Unified Results Architecture - Live Intelligence Platform</p>
          <p className="mt-2">Official results from IEBC Portal • Real-time monitoring by polling agents</p>
        </div>
      </main>
    </div>
  )
}
