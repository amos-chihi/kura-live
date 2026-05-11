'use client'

import { useState, useEffect } from 'react'
import ElectionSidebar from '@/components/command/ElectionSidebar'
import TopStatusBar from '@/components/command/TopStatusBar'
import LiveMapPanel from '@/components/command/LiveMapPanel'
import ResultsTallyPanel from '@/components/command/ResultsTallyPanel'
import StreamWall from '@/components/command/StreamWall'
import PredictiveAnalytics from '@/components/command/PredictiveAnalytics'
import IncidentOpsPanel from '@/components/command/IncidentOpsPanel'
import AgentOpsPanel from '@/components/command/AgentOpsPanel'
import CommunicationsHub from '@/components/command/CommunicationsHub'
import AIMonitorPanel from '@/components/command/AIMonitorPanel'
import OpsRightRail from '@/components/command/OpsRightRail'
import { useWebSocketStore } from '@/store/websocketStore'

export default function Kura27CommandCenter() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [commandMode, setCommandMode] = useState<'election' | 'security' | 'tally' | 'broadcast' | 'crisis'>('election')
  const [rightRailOpen, setRightRailOpen] = useState(true)
  const { connect, disconnect, updateData, streams, incidents } = useWebSocketStore()

  useEffect(() => {
    connect()
    
    // Set up real-time data updates
    const interval = setInterval(() => {
      updateData()
    }, 3000)
    
    return () => {
      clearInterval(interval)
      disconnect()
    }
  }, [connect, disconnect, updateData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'm':
            e.preventDefault()
            setCommandMode('broadcast')
            break
          case 't':
            e.preventDefault()
            setCommandMode('tally')
            break
          case 's':
            e.preventDefault()
            setCommandMode('security')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)

    if (sectionId === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-kura-bg text-kura-text overflow-hidden">
      {/* Left Sidebar */}
      <ElectionSidebar
        activeSection={activeSection}
        onSelectSection={scrollToSection}
        liveStreamCount={streams.filter((stream) => stream.status === 'live').length}
        incidentCount={incidents.filter((incident) => incident.status !== 'resolved').length}
      />
      
      {/* Top Status Bar */}
      <TopStatusBar />
      
      {/* Main Command Center Grid */}
      <div className="flex h-screen pt-14 pl-[300px]">
        <div className={`flex-1 intelligence-grid transition-all duration-300 ${rightRailOpen ? 'mr-80' : ''}`}>
          
          {/* ROW 1 */}
          <div id="dashboard" className="grid grid-cols-12 gap-4">
            {/* Live Map Panel - 8 cols */}
            <div className="col-span-8">
              <LiveMapPanel />
            </div>
            
            {/* Results Tally Panel - 4 cols */}
            <div id="tally" className="col-span-4">
              <ResultsTallyPanel />
            </div>
          </div>

          {/* ROW 2 */}
          <div id="streams" className="grid grid-cols-12 gap-4">
            {/* Stream Monitor - 6 cols */}
            <div className="col-span-6">
              <StreamWall />
            </div>
            
            {/* Predictive Analytics - 6 cols */}
            <div id="analytics" className="col-span-6">
              <PredictiveAnalytics />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-12 gap-4">
            {/* Incident Operations - 4 cols */}
            <div id="incidents" className="col-span-4">
              <IncidentOpsPanel />
            </div>
            
            {/* Agent Operations - 4 cols */}
            <div id="agents" className="col-span-4">
              <AgentOpsPanel />
            </div>
            
            {/* Communications Hub - 4 cols */}
            <div id="communications" className="col-span-4">
              <CommunicationsHub />
            </div>
          </div>

          {/* ROW 4 */}
          <div id="ai" className="grid grid-cols-12 gap-4">
            {/* AI Monitor - Full width */}
            <div className="col-span-12">
              <AIMonitorPanel />
            </div>
          </div>
        </div>

        {/* Right Collapsible Ops Rail */}
        <div className={`fixed right-0 top-14 h-full w-80 bg-kura-panel border-l border-kura-border transform transition-transform duration-300 z-40 ${
          rightRailOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <OpsRightRail />
          
          {/* Toggle Button */}
          <button
            onClick={() => setRightRailOpen(!rightRailOpen)}
            className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-kura-panel border border-kura-border rounded-l-lg px-2 py-4"
          >
            <span className="text-kura-muted">
              {rightRailOpen ? '›' : '‹'}
            </span>
          </button>
        </div>
      </div>

      {/* Command Mode Overlays */}
      {commandMode === 'broadcast' && (
        <div className="fixed inset-0 bg-kura-bg/95 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="h-full w-full p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-kura-green mb-2">BROADCAST MODE</h2>
                <p className="text-kura-muted">Full screen national operations map</p>
              </div>
              <button
                onClick={() => setCommandMode('election')}
                className="ops-button-primary"
              >
                Exit Broadcast Mode (M)
              </button>
            </div>
            <LiveMapPanel fullPage />
          </div>
        </div>
      )}
      
      {commandMode === 'security' && (
        <div className="fixed inset-0 bg-kura-bg/95 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-kura-red mb-4">SECURITY MODE</h2>
            <p className="text-kura-muted">Security response monitoring activated</p>
            <button
              onClick={() => setCommandMode('election')}
              className="mt-8 ops-button-primary"
            >
              Exit Security Mode (S)
            </button>
          </div>
        </div>
      )}
      
      {commandMode === 'tally' && (
        <div className="fixed inset-0 bg-kura-bg/95 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-kura-blue mb-4">TALLY MODE</h2>
            <p className="text-kura-muted">National tally monitoring activated</p>
            <button
              onClick={() => setCommandMode('election')}
              className="mt-8 ops-button-primary"
            >
              Exit Tally Mode (T)
            </button>
          </div>
        </div>
      )}
      
      {commandMode === 'crisis' && (
        <div className="fixed inset-0 bg-kura-red/95 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">CRISIS MODE</h2>
            <p className="text-white">Emergency protocols activated</p>
            <button
              onClick={() => setCommandMode('election')}
              className="mt-8 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
            >
              Exit Crisis Mode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
