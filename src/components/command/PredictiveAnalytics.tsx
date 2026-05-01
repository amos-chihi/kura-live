'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, AlertTriangle, Activity, Target, MapPin } from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function PredictiveAnalytics() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'risk' | 'trends'>('forecast')
  const { predictive, stations, incidents } = useWebSocketStore()

  // Simulate real-time updates
  const [liveMetrics, setLiveMetrics] = useState({
    turnoutProjection: predictive.turnout_projection,
    winnerConfidence: predictive.winner_confidence,
    anomalyCount: predictive.anomaly_count,
    riskLevel: 'medium' as 'low' | 'medium' | 'high'
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        turnoutProjection: Math.max(0, Math.min(100, prev.turnoutProjection + (Math.random() - 0.5) * 2)),
        winnerConfidence: Math.max(0, Math.min(100, prev.winnerConfidence + (Math.random() - 0.5) * 3)),
        anomalyCount: Math.max(0, prev.anomalyCount + Math.floor(Math.random() * 3) - 1)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-kura-red'
      case 'medium': return 'text-kura-amber'
      default: return 'text-kura-green'
    }
  }

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'high': return 'bg-kura-red/20 border-kura-red/30'
      case 'medium': return 'bg-kura-amber/20 border-kura-amber/30'
      default: return 'bg-kura-green/20 border-kura-green/30'
    }
  }

  const ForecastTab = () => (
    <div className="space-y-4">
      {/* Turnout Projection */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Turnout Projection</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-kura-green">
            {liveMetrics.turnoutProjection.toFixed(1)}%
          </span>
          <span className="text-xs text-kura-muted">National Average</span>
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${liveMetrics.turnoutProjection}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-kura-blue to-kura-green"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-kura-muted">0%</span>
          <span className="text-[9px] text-kura-muted">100%</span>
        </div>
      </div>

      {/* Winner Confidence */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Winner Confidence</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-kura-purple">
            {liveMetrics.winnerConfidence.toFixed(1)}%
          </span>
          <Target className="w-5 h-5 text-kura-purple" />
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${liveMetrics.winnerConfidence}%` }}
            transition={{ duration: 1.2 }}
            className="h-full bg-gradient-to-r from-kura-purple to-kura-pink"
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3 flex items-center space-x-2">
          <Brain className="w-4 h-4 text-kura-blue" />
          <span>AI Insights</span>
        </h3>
        <div className="space-y-2">
          <div className="bg-kura-panel2 rounded-lg p-3 border-l-2 border-kura-amber">
            <p className="text-xs text-kura-text">Possible delay risk in Western region</p>
            <p className="text-[10px] text-kura-muted mt-1">Confidence: 78%</p>
          </div>
          <div className="bg-kura-panel2 rounded-lg p-3 border-l-2 border-kura-green">
            <p className="text-xs text-kura-text">Turnout surge detected Nairobi</p>
            <p className="text-[10px] text-kura-muted mt-1">+15% from projections</p>
          </div>
          <div className="bg-kura-panel2 rounded-lg p-3 border-l-2 border-kura-blue">
            <p className="text-xs text-kura-text">Swing voter behavior changing</p>
            <p className="text-[10px] text-kura-muted mt-1">Monitoring 3 key counties</p>
          </div>
        </div>
      </div>
    </div>
  )

  const RiskTab = () => (
    <div className="space-y-4">
      {/* Risk Level */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Overall Risk Level</h3>
        <div className={`status-badge ${getRiskBg(liveMetrics.riskLevel)} ${getRiskColor(liveMetrics.riskLevel)}`}>
          {liveMetrics.riskLevel.toUpperCase()} RISK
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-kura-muted">Security Incidents</span>
            <span className="text-kura-text">{incidents.filter(i => i.type === 'security').length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-kura-muted">Technical Issues</span>
            <span className="text-kura-text">{incidents.filter(i => i.type === 'technical').length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-kura-muted">Anomalies Detected</span>
            <span className={`font-medium ${getRiskColor(liveMetrics.riskLevel)}`}>
              {liveMetrics.anomalyCount}
            </span>
          </div>
        </div>
      </div>

      {/* Swing Counties */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Swing Counties Analysis</h3>
        <div className="space-y-2">
          {predictive.swing_counties.map((county, index) => (
            <div key={county} className="flex items-center justify-between p-2 bg-kura-panel2 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-kura-amber" />
                <span className="text-xs text-kura-text">{county}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-kura-muted">Margin:</span>
                <span className="text-xs font-medium text-kura-amber">
                  {(4.2 + index * 0.8).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Areas */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-kura-red" />
          <span>Risk Areas</span>
        </h3>
        <div className="space-y-2">
          {predictive.risk_areas.map((area) => (
            <div key={area} className="flex items-center justify-between p-2 bg-kura-panel2 rounded-lg border-l-2 border-kura-red">
              <span className="text-xs text-kura-text">{area}</span>
              <span className="text-xs text-kura-red">High Risk</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const TrendsTab = () => (
    <div className="space-y-4">
      {/* Historical Comparison */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Historical Comparison</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-kura-muted">2022 Turnout</span>
            <span className="text-xs text-kura-text">64.6%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-kura-muted">2017 Turnout</span>
            <span className="text-xs text-kura-text">79.5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-kura-muted">2013 Turnout</span>
            <span className="text-xs text-kura-text">85.1%</span>
          </div>
          <div className="flex items-center justify-between font-medium border-t border-kura-border pt-2">
            <span className="text-xs text-kura-text">2027 Projection</span>
            <span className="text-xs text-kura-green">{liveMetrics.turnoutProjection.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Key Trends */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Key Trends</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-kura-green" />
            <span className="text-xs text-kura-text">Urban turnout increased 3.2%</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-kura-green" />
            <span className="text-xs text-kura-text">Youth participation up 5.7%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-kura-amber" />
            <span className="text-xs text-kura-text">Women voters steady at 52%</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3 h-3 text-kura-red" />
            <span className="text-xs text-kura-text">Coast region variance detected</span>
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="command-panel p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-kura-purple" />
          <span>Anomaly Detection</span>
        </h3>
        <div className="space-y-2">
          <div className="bg-kura-panel2 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-kura-text">Voting Pattern Anomaly</span>
              <span className="text-xs text-kura-red">High</span>
            </div>
            <p className="text-[10px] text-kura-muted">Unusual surge in Kitui County</p>
          </div>
          <div className="bg-kura-panel2 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-kura-text">Reporting Delay</span>
              <span className="text-xs text-kura-amber">Medium</span>
            </div>
            <p className="text-[10px] text-kura-muted">North Eastern region lagging</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <Brain className="w-5 h-5 text-kura-purple" />
            <span>Predictive Analytics</span>
          </h2>
          <p className="text-xs text-kura-muted">AI-powered election forecasting</p>
        </div>
        
        {/* Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-kura-green rounded-full animate-pulse"></div>
          <span className="text-xs text-kura-green">AI Active</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-4 border-b border-kura-border">
        {[
          { id: 'forecast', label: 'Forecast', icon: TrendingUp },
          { id: 'risk', label: 'Risk', icon: AlertTriangle },
          { id: 'trends', label: 'Trends', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-kura-purple/20 text-kura-purple border border-kura-purple/30'
                  : 'text-kura-muted hover:text-kura-text hover:bg-kura-panel2'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'forecast' && <ForecastTab />}
          {activeTab === 'risk' && <RiskTab />}
          {activeTab === 'trends' && <TrendsTab />}
        </motion.div>
      </div>

      {/* Last Updated */}
      <div className="p-4 border-t border-kura-border">
        <div className="flex items-center justify-between text-xs text-kura-muted">
          <span>Last Updated</span>
          <span>{new Date().toLocaleTimeString('en-KE', { hour12: false })}</span>
        </div>
      </div>
    </div>
  )
}
