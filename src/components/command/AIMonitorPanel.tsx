'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Shield, 
  Eye, 
  TrendingUp,
  Zap,
  Target
} from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

interface AIDetection {
  id: string
  type: 'fraud' | 'anomaly' | 'pattern' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  location: string
  timestamp: Date
  status: 'detected' | 'investigating' | 'resolved'
}

export default function AIMonitorPanel() {
  const [detections, setDetections] = useState<AIDetection[]>([
    {
      id: '1',
      type: 'fraud',
      severity: 'high',
      title: 'Unusual Voting Pattern',
      description: 'Statistical anomaly detected in vote distribution',
      confidence: 87,
      location: 'Nairobi County',
      timestamp: new Date(Date.now() - 300000),
      status: 'investigating'
    },
    {
      id: '2',
      type: 'anomaly',
      severity: 'medium',
      title: 'Reporting Delay',
      description: 'Significant delay in result reporting from multiple stations',
      confidence: 72,
      location: 'Coast Region',
      timestamp: new Date(Date.now() - 600000),
      status: 'detected'
    },
    {
      id: '3',
      type: 'pattern',
      severity: 'low',
      title: 'Turnout Spike',
      description: 'Unusual increase in voter turnout detected',
      confidence: 65,
      location: 'Western Kenya',
      timestamp: new Date(Date.now() - 900000),
      status: 'resolved'
    }
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    fraudRiskScore: 23,
    anomalyCount: 12,
    patternMatches: 8,
    systemHealth: 94,
    processingSpeed: 987,
    accuracy: 96.5
  })

  const { predictive, incidents } = useWebSocketStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        fraudRiskScore: Math.max(0, Math.min(100, prev.fraudRiskScore + (Math.random() - 0.5) * 5)),
        anomalyCount: Math.max(0, prev.anomalyCount + Math.floor(Math.random() * 3) - 1),
        patternMatches: Math.max(0, prev.patternMatches + Math.floor(Math.random() * 2) - 1),
        systemHealth: Math.max(85, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 3)),
        processingSpeed: Math.max(800, Math.min(1200, prev.processingSpeed + (Math.random() - 0.5) * 100)),
        accuracy: Math.max(90, Math.min(99, prev.accuracy + (Math.random() - 0.5) * 2))
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const getDetectionIcon = (type: string) => {
    switch (type) {
      case 'fraud': return <Shield className="w-4 h-4 text-kura-red" />
      case 'anomaly': return <AlertTriangle className="w-4 h-4 text-kura-amber" />
      case 'pattern': return <TrendingUp className="w-4 h-4 text-kura-blue" />
      case 'warning': return <Eye className="w-4 h-4 text-kura-purple" />
      default: return <Brain className="w-4 h-4 text-kura-muted" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-kura-red bg-kura-red/10'
      case 'high': return 'border-l-4 border-kura-amber bg-kura-amber/10'
      case 'medium': return 'border-l-4 border-kura-blue bg-kura-blue/10'
      default: return 'border-l-4 border-kura-green bg-kura-green/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <Activity className="w-4 h-4 text-kura-amber animate-pulse" />
      case 'investigating': return <Eye className="w-4 h-4 text-kura-blue" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-kura-green" />
      default: return <Activity className="w-4 h-4 text-kura-muted" />
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'text-kura-red' }
    if (score >= 40) return { level: 'Medium', color: 'text-kura-amber' }
    return { level: 'Low', color: 'text-kura-green' }
  }

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <Brain className="w-5 h-5 text-kura-purple" />
            <span>AI Monitor</span>
          </h2>
          <p className="text-xs text-kura-muted">Election integrity engine</p>
        </div>
        
        {/* AI Status */}
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-kura-green animate-pulse" />
          <span className="text-xs text-kura-green">AI Active</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-kura-border">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getRiskLevel(systemMetrics.fraudRiskScore).color}`}>
            {systemMetrics.fraudRiskScore}
          </div>
          <div className="text-xs text-kura-muted">Fraud Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-kura-amber">
            {systemMetrics.anomalyCount}
          </div>
          <div className="text-xs text-kura-muted">Anomalies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-kura-green">
            {systemMetrics.systemHealth}%
          </div>
          <div className="text-xs text-kura-muted">System Health</div>
        </div>
      </div>

      {/* AI Detections */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-kura-text mb-3">Recent Detections</h3>
        <div className="space-y-3">
          {detections.map((detection, index) => (
            <motion.div
              key={detection.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`command-panel ${getSeverityColor(detection.severity)}`}
            >
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getDetectionIcon(detection.type)}
                    <span className="text-sm font-medium text-kura-text">{detection.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(detection.status)}
                    <span className="text-xs text-kura-muted">
                      {detection.timestamp.toLocaleTimeString('en-KE', { hour12: false })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-kura-text mb-2">{detection.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-kura-muted" />
                      <span className="text-kura-muted">{detection.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-kura-muted">Confidence:</span>
                      <span className={`font-medium ${
                        detection.confidence >= 80 ? 'text-kura-green' :
                        detection.confidence >= 60 ? 'text-kura-amber' : 'text-kura-red'
                      }`}>
                        {detection.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Performance */}
      <div className="p-4 border-t border-kura-border">
        <h3 className="text-sm font-semibold text-kura-text mb-3">System Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-kura-muted">Processing Speed</span>
              <span className="text-xs text-kura-text">{systemMetrics.processingSpeed} ops/s</span>
            </div>
            <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(systemMetrics.processingSpeed / 1200) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-kura-green"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-kura-muted">Accuracy</span>
              <span className="text-xs text-kura-text">{systemMetrics.accuracy}%</span>
            </div>
            <div className="w-full bg-kura-panel2 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${systemMetrics.accuracy}%` }}
                transition={{ duration: 1.2 }}
                className="h-full bg-kura-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Generated Warnings */}
      <div className="p-4 border-t border-kura-border">
        <h3 className="text-sm font-semibold text-kura-text mb-3 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-kura-amber" />
          <span>AI Insights</span>
        </h3>
        <div className="space-y-2">
          <div className="bg-kura-panel2 rounded-lg p-3 border-l-2 border-kura-amber">
            <p className="text-xs text-kura-text">
              Elevated fraud risk detected in Nairobi County - recommend manual verification
            </p>
            <p className="text-[10px] text-kura-muted mt-1">Confidence: 87%</p>
          </div>
          <div className="bg-kura-panel2 rounded-lg p-3 border-l-2 border-kura-blue">
            <p className="text-xs text-kura-text">
              Pattern matching suggests coordinated reporting delays in coastal region
            </p>
            <p className="text-[10px] text-kura-muted mt-1">Confidence: 72%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
