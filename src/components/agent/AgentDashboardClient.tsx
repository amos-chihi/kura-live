'use client'

import { useState, useEffect } from 'react'
import { Video, FileText, AlertTriangle, Users, Settings, Mic } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import StreamPanel from '@/components/agent/StreamPanel'
import TranscriptionPanel from '@/components/agent/TranscriptionPanel'
import ResultsPanel from '@/components/agent/ResultsPanel'
import ComparisonPanel from '@/components/agent/ComparisonPanel'
import AlertsPanel from '@/components/agent/AlertsPanel'
import AgentSidebar from '@/components/agent/AgentSidebar'
import AgentTopBar from '@/components/agent/AgentTopBar'
import { Agent, LiveStream } from '@/lib/types'

export default function AgentDashboardClient() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('stream')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null)
  const [streamTimer, setStreamTimer] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const mockAgent: Agent = {
      id: 'agent-001',
      user_id: 'user-001',
      agent_id: 'AG-0001',
      full_name: 'James Mwangi',
      station_code: 'KE-047-290-0001',
      tiktok_url: 'https://www.tiktok.com/@agent001',
      youtube_url: 'https://www.youtube.com/channel/agent001',
      platform_url: 'https://platform.example.com/agent001',
      status: 'active',
      phone: '+254712345678',
      email: 'james.mwangi@agent.com',
      verification_status: 'fully_verified',
      created_at: new Date().toISOString()
    }
    setAgent(mockAgent)

    const mockStream: LiveStream = {
      id: 'stream-001',
      agent_id: mockAgent.id,
      station_code: mockAgent.station_code,
      tiktok_url: mockAgent.tiktok_url,
      youtube_url: mockAgent.youtube_url,
      platform_url: mockAgent.platform_url,
      platform: 'youtube',
      status: 'offline',
      start_time: null,
      end_time: null,
      viewer_count: 0,
      created_at: new Date().toISOString()
    }
    setCurrentStream(mockStream)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStreaming && streamTimer >= 0) {
      interval = setInterval(() => {
        setStreamTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStreaming, streamTimer])

  const tabs = [
    { id: 'stream', name: 'Live Stream', icon: Video },
    { id: 'transcription', name: 'Transcription', icon: Mic },
    { id: 'results', name: 'Form 34A', icon: FileText },
    { id: 'comparison', name: 'Comparison', icon: Users },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartStream = () => {
    setIsStreaming(true)
    setStreamTimer(0)
    if (currentStream) {
      setCurrentStream({
        ...currentStream,
        status: 'live',
        start_time: new Date().toISOString(),
        viewer_count: Math.floor(Math.random() * 100) + 50
      })
    }
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    if (currentStream) {
      setCurrentStream({
        ...currentStream,
        status: 'ended',
        end_time: new Date().toISOString(),
        viewer_count: 0
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'stream':
        return (
          <StreamPanel
            agent={agent}
            currentStream={currentStream}
            isStreaming={isStreaming}
            streamTimer={streamTimer}
            onStartStream={handleStartStream}
            onStopStream={handleStopStream}
            formatTime={formatTime}
          />
        )
      case 'transcription':
        return <TranscriptionPanel agent={agent} />
      case 'results':
        return <ResultsPanel agent={agent} />
      case 'comparison':
        return <ComparisonPanel agent={agent} />
      case 'alerts':
        return <AlertsPanel agent={agent} />
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Agent Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto-start Stream</p>
                    <p className="text-sm text-gray-400">Automatically start streaming when available</p>
                  </div>
                  <button className="w-12 h-6 bg-kura-navy rounded-full relative">
                    <div className="w-5 h-5 bg-gray-400 rounded-full absolute left-0.5 top-0.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Recording Quality</p>
                    <p className="text-sm text-gray-400">Video and audio quality settings</p>
                  </div>
                  <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
                    <option>High (1080p)</option>
                    <option>Medium (720p)</option>
                    <option>Low (480p)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-kura-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kura-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading agent dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-kura-navy">
      <AgentTopBar agent={agent} isStreaming={isStreaming} streamTimer={streamTimer} formatTime={formatTime} />
      <div className="flex">
        <AgentSidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}
