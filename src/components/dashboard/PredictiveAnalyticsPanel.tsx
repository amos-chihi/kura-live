'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Activity,
  BarChart3,
  Target,
  Shield
} from 'lucide-react'

interface AnalyticsData {
  forecast: {
    winner: string
    confidence: number
    turnout: number
    totalVotes: number
  }
  risk: {
    high: number
    medium: number
    low: number
    swingCounties: string[]
  }
  trends: {
    regionalShifts: number
    strongholdChanges: number
    turnoutProjection: number
  }
}

export function PredictiveAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    forecast: {
      winner: 'UDA',
      confidence: 67,
      turnout: 78.5,
      totalVotes: 14567890
    },
    risk: {
      high: 12,
      medium: 34,
      low: 28,
      swingCounties: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru']
    },
    trends: {
      regionalShifts: 8.2,
      strongholdChanges: 3,
      turnoutProjection: 76.8
    }
  })

  const [activeTab, setActiveTab] = useState<'forecast' | 'risk' | 'trends'>('forecast')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-kura-purple/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-kura-purple" />
        </div>
        <div>
          <h1 className="page-title">Predictive Analytics</h1>
          <p className="faint-text">AI-powered election forecasting and risk analysis</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('forecast')}
          className={`data-card text-left p-4 transition-all ${
            activeTab === 'forecast' ? 'ring-2 ring-kura-purple' : ''
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-kura-green/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-kura-green" />
            </div>
            <span className="section-heading">Election Forecast</span>
          </div>
          <p className="ai-text">LLM Bayesian model predictions with confidence intervals</p>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`data-card text-left p-4 transition-all ${
            activeTab === 'risk' ? 'ring-2 ring-kura-purple' : ''
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-kura-amber/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-kura-purple" />
            </div>
            <span className="section-heading">Risk Analysis</span>
          </div>
          <p className="ai-text">Station risk ranking and incident probability assessment</p>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`data-card text-left p-4 transition-all ${
            activeTab === 'trends' ? 'ring-2 ring-kura-purple' : ''
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-kura-blue/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-kura-blue" />
            </div>
            <span className="section-heading">Historical Trends</span>
          </div>
          <p className="ai-text">2022/2017/2013 comparison and pattern analysis</p>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Main Forecast Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Projected Winner"
              value={analytics.forecast.winner}
              icon={<Trophy className="w-4 h-4" />}
            />
            <StatCard
              title="Win Probability"
              value={`${analytics.forecast.confidence}%`}
              icon={<Target className="w-4 h-4" />}
            />
            <StatCard
              title="Turnout Projection"
              value={`${analytics.forecast.turnout}%`}
              icon={<Activity className="w-4 h-4" />}
            />
          </div>

          {/* Detailed Forecast */}
          <div className="data-card">
            <h3 className="section-heading mb-4">Forecast Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-kura-bg rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="faint-text">Confidence Score</span>
                    <Badge variant="success" size="sm">High</Badge>
                  </div>
                  <div className="text-2xl font-bold text-kura-purple mb-1">
                    {analytics.forecast.confidence}%
                  </div>
                  <div className="ai-text">Based on 87% of polling stations reporting</div>
                </div>
                <div className="bg-kura-bg rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="faint-text">Total Votes Projected</span>
                    <Badge variant="info" size="sm">Estimate</Badge>
                  </div>
                  <div className="text-2xl font-bold text-kura-green mb-1">
                    {analytics.forecast.totalVotes.toLocaleString()}
                  </div>
                  <div className="ai-text">±2.3% margin of error</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="High Risk Stations"
              value={analytics.risk.high}
              change={{ value: 2.1, type: 'increase' }}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <StatCard
              title="Medium Risk"
              value={analytics.risk.medium}
              icon={<Shield className="w-4 h-4" />}
            />
            <StatCard
              title="Low Risk"
              value={analytics.risk.low}
              icon={<Shield className="w-4 h-4" />}
            />
          </div>

          {/* Swing Counties */}
          <div className="data-card">
            <h3 className="section-heading mb-4">Swing Counties Analysis</h3>
            <div className="space-y-3">
              {analytics.risk.swingCounties.map((county, index) => (
                <div key={county} className="flex items-center justify-between p-3 bg-kura-bg rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-kura-amber" />
                    <span className="item-title">{county}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="warning" size="sm">Swing</Badge>
                    <span className="faint-text">Margin: {4.2 + index * 0.8}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Trend Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Regional Shifts"
              value={`${analytics.trends.regionalShifts}%`}
              change={{ value: analytics.trends.regionalShifts, type: 'increase' }}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              title="Stronghold Changes"
              value={analytics.trends.strongholdChanges}
              icon={<Target className="w-4 h-4" />}
            />
            <StatCard
              title="Turnout vs 2022"
              value={`${analytics.trends.turnoutProjection}%`}
              change={{ value: -2.3, type: 'decrease' }}
              icon={<Activity className="w-4 h-4" />}
            />
          </div>

          {/* Historical Comparison */}
          <div className="data-card">
            <h3 className="section-heading mb-4">Historical Comparison</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-kura-bg rounded-lg p-4">
                  <h4 className="item-title mb-3">Key Trends</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-kura-blue" />
                      <span className="body-text">Urban turnout increased 3.2%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-kura-blue" />
                      <span className="body-text">Youth participation up 5.7%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-kura-blue" />
                      <span className="body-text">Women voters steady at 52%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-kura-bg rounded-lg p-4">
                  <h4 className="item-title mb-3">Anomalies Detected</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-kura-amber" />
                      <span className="body-text">Coast region turnout variance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-kura-amber" />
                      <span className="body-text">North Eastern reporting delay</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-kura-amber" />
                      <span className="body-text">Urban-rural split shift 4.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
