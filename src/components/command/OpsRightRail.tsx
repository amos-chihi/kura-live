'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Map, 
  AlertTriangle, 
  Shield, 
  Activity, 
  Wifi, 
  Clock,
  Users,
  Gauge,
  Zap
} from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function OpsRightRail() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
  const { 
    total_stations, 
    stations_reporting, 
    active_streams, 
    total_votes, 
    turnout_rate, 
    critical_incidents,
    connected,
    last_update
  } = useWebSocketStore()

  // Simulate real-time updates for widgets
  const [widgetData, setWidgetData] = useState({
    nationalTurnout: turnout_rate,
    countiesReporting: Math.round((stations_reporting / 47) * 100),
    topAlerts: critical_incidents,
    securityThreat: 'medium' as 'low' | 'medium' | 'high',
    systemHealth: 96,
    streamUptime: 98.5,
    apiLatency: 45
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setWidgetData(prev => ({
        ...prev,
        nationalTurnout: Math.max(0, Math.min(100, prev.nationalTurnout + (Math.random() - 0.5) * 1)),
        countiesReporting: Math.max(0, Math.min(100, prev.countiesReporting + (Math.random() - 0.5) * 2)),
        systemHealth: Math.max(85, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
        streamUptime: Math.max(90, Math.min(100, prev.streamUptime + (Math.random() - 0.5) * 1)),
        apiLatency: Math.max(20, Math.min(200, prev.apiLatency + (Math.random() - 0.5) * 20))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-kura-red'
      case 'medium': return 'text-kura-amber'
      default: return 'text-kura-green'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-kura-green'
    if (health >= 85) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const Widget = ({ 
    id, 
    title, 
    icon: Icon, 
    children, 
    expanded = false 
  }: { 
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode
    expanded?: boolean 
  }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-kura-panel border border-kura-border rounded-lg p-3 mb-3 cursor-pointer hover:bg-kura-panel2 transition-colors"
      onClick={() => setExpandedWidget(expandedWidget === id ? null : id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-kura-blue" />
          <span className="text-xs font-medium text-kura-text">{title}</span>
        </div>
        <span className="text-[10px] text-kura-muted">
          {expandedWidget === id ? '−' : '+'}
        </span>
      </div>
      
      {(expandedWidget === id || expanded) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )

  const NationalTurnoutWidget = () => (
    <Widget id="turnout" title="National Turnout" icon={TrendingUp}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-kura-green">
          {widgetData.nationalTurnout.toFixed(1)}%
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widgetData.nationalTurnout}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-kura-green"
          />
        </div>
        <div className="text-[10px] text-kura-muted">
          {total_votes.toLocaleString()} votes counted
        </div>
      </div>
    </Widget>
  )

  const CountiesReportingWidget = () => (
    <Widget id="counties" title="Counties Reporting" icon={Map}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-kura-blue">
          {widgetData.countiesReporting}%
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widgetData.countiesReporting}%` }}
            transition={{ duration: 1.2 }}
            className="h-full bg-kura-blue"
          />
        </div>
        <div className="text-[10px] text-kura-muted">
          {stations_reporting} of 47 counties
        </div>
      </div>
    </Widget>
  )

  const TopAlertsWidget = () => (
    <Widget id="alerts" title="Top Alerts" icon={AlertTriangle}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-kura-red">
          {widgetData.topAlerts}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-text">Critical</span>
            <span className="text-kura-red">{Math.max(0, widgetData.topAlerts - 1)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-text">High</span>
            <span className="text-kura-amber">{Math.min(3, widgetData.topAlerts)}</span>
          </div>
        </div>
        <div className="text-[10px] text-kura-muted">
          Last updated: {new Date().toLocaleTimeString('en-KE', { hour12: false })}
        </div>
      </div>
    </Widget>
  )

  const SecurityThreatWidget = () => (
    <Widget id="security" title="Security Threat" icon={Shield}>
      <div className="space-y-2">
        <div className={`text-lg font-bold ${getThreatColor(widgetData.securityThreat)}`}>
          {widgetData.securityThreat.toUpperCase()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-muted">Threat Level</span>
            <span className={getThreatColor(widgetData.securityThreat)}>
              {widgetData.securityThreat}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-muted">Active Incidents</span>
            <span className="text-kura-amber">{widgetData.topAlerts}</span>
          </div>
        </div>
        <div className="text-[10px] text-kura-muted">
          Monitoring 47 counties
        </div>
      </div>
    </Widget>
  )

  const SystemHealthWidget = () => (
    <Widget id="health" title="System Health" icon={Activity}>
      <div className="space-y-2">
        <div className={`text-2xl font-bold ${getHealthColor(widgetData.systemHealth)}`}>
          {widgetData.systemHealth}%
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widgetData.systemHealth}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-kura-amber to-kura-green"
          />
        </div>
        <div className="text-[10px] text-kura-muted">
          All systems operational
        </div>
      </div>
    </Widget>
  )

  const StreamUptimeWidget = () => (
    <Widget id="stream" title="Stream Uptime" icon={Wifi}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-kura-green">
          {widgetData.streamUptime.toFixed(1)}%
        </div>
        <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widgetData.streamUptime}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-kura-green"
          />
        </div>
        <div className="text-[10px] text-kura-muted">
          {active_streams} active streams
        </div>
      </div>
    </Widget>
  )

  const APILatencyWidget = () => (
    <Widget id="api" title="API Latency" icon={Zap}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-kura-blue">
          {widgetData.apiLatency}ms
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-muted">Average</span>
            <span className="text-kura-green">{widgetData.apiLatency}ms</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-kura-muted">Peak</span>
            <span className="text-kura-amber">{widgetData.apiLatency + 20}ms</span>
          </div>
        </div>
        <div className="text-[10px] text-kura-muted">
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </Widget>
  )

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <NationalTurnoutWidget />
      <CountiesReportingWidget />
      <TopAlertsWidget />
      <SecurityThreatWidget />
      <SystemHealthWidget />
      <StreamUptimeWidget />
      <APILatencyWidget />
      
      {/* Last Update */}
      <div className="text-center pt-4 border-t border-kura-border">
        <div className="text-[10px] text-kura-muted">
          Last Updated: {new Date(last_update).toLocaleTimeString('en-KE', { hour12: false })}
        </div>
      </div>
    </div>
  )
}
