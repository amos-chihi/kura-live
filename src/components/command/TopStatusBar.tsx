'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

interface TickerItem {
  id: string
  text: string
  timestamp: Date
}

export default function TopStatusBar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [tickerIndex, setTickerIndex] = useState(0)
  
  const {
    connected,
    total_stations,
    stations_reporting,
    active_streams,
    total_votes,
    turnout_rate,
    critical_incidents,
    last_update
  } = useWebSocketStore()

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Generate ticker items
  useEffect(() => {
    const items: TickerItem[] = [
      { id: '1', text: 'Stream online Eldoret', timestamp: new Date() },
      { id: '2', text: 'Results uploaded Kisumu', timestamp: new Date() },
      { id: '3', text: 'Incident logged Nakuru', timestamp: new Date() },
      { id: '4', text: `${stations_reporting} agents active`, timestamp: new Date() },
      { id: '5', text: 'High turnout detected Nairobi', timestamp: new Date() },
      { id: '6', text: 'Security alert Mombasa', timestamp: new Date() },
      { id: '7', text: 'System backup completed', timestamp: new Date() },
      { id: '8', text: 'New stream added Kitui', timestamp: new Date() }
    ]
    setTickerItems(items)
  }, [stations_reporting])

  // Rotate ticker items
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [tickerItems.length])

  const reportingPercentage = total_stations > 0 ? Math.round((stations_reporting / total_stations) * 100) : 0

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-kura-bg border-b border-kura-border z-20 flex items-center justify-between px-6">
      {/* Left: Live Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-kura-red rounded-full animate-blink"></div>
          <span className="text-xs font-medium text-kura-red">LIVE</span>
        </div>
        
        <div className="text-xs text-kura-muted">
          Kura27 • Kenya General Election 2027
        </div>
      </div>

      {/* Center: Scrolling Activity Ticker */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="bg-kura-panel border border-kura-border rounded-lg px-3 py-1 overflow-hidden">
          <motion.div
            key={tickerIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="ticker-text text-center"
          >
            {tickerItems[tickerIndex]?.text || 'System operational'}
          </motion.div>
        </div>
      </div>

      {/* Right: Live Metrics Badges */}
      <div className="flex items-center space-x-4">
        {/* Stations Reporting */}
        <div className="metric-card">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-kura-green" />
            <div>
              <div className="metric-value text-lg">{reportingPercentage}%</div>
              <div className="metric-label">Stations</div>
            </div>
          </div>
        </div>

        {/* Active Streams */}
        <div className="metric-card">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-kura-blue" />
            <div>
              <div className="metric-value text-lg">{active_streams}</div>
              <div className="metric-label">Streams</div>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="metric-card">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-4 h-4 ${critical_incidents > 0 ? 'text-kura-red' : 'text-kura-amber'}`} />
            <div>
              <div className="metric-value text-lg">{critical_incidents}</div>
              <div className="metric-label">Incidents</div>
            </div>
          </div>
        </div>

        {/* Turnout */}
        <div className="metric-card">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-kura-purple" />
            <div>
              <div className="metric-value text-lg">{turnout_rate.toFixed(1)}%</div>
              <div className="metric-label">Turnout</div>
            </div>
          </div>
        </div>

        {/* Live Clock */}
        <div className="metric-card">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-kura-cyan" />
            <div>
              <div className="metric-value text-lg font-mono">
                {currentTime.toLocaleTimeString('en-KE', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
              <div className="metric-label">EAT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
