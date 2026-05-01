'use client'

import { useState, useEffect } from 'react'
import { useStreamStore } from '@/store/streamStore'
import Badge from '@/components/ui/Badge'
import StreamStatusDot from '@/components/ui/StreamStatusDot'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VideoPlayer from '@/components/ui/VideoPlayer'
import TranscriptionDisplay from '@/components/ui/TranscriptionDisplay'
import { Link, ExternalLink, Play, Square, User, Settings, RefreshCw } from 'lucide-react'

export function StreamPanel() {
  const {
    currentStream,
    isLive,
    elapsedTime,
    isLoading,
    setCurrentStream,
    setIsLive,
    setStartTime,
    updateElapsedTime,
    setLoading,
    resetStream
  } = useStreamStore()
  
  const streamStore = useStreamStore.getState()

  const [urls, setUrls] = useState({
    tiktok: '',
    youtube: '',
    platform: ''
  })

  const [showPreview, setShowPreview] = useState(false)
  const [activePlatform, setActivePlatform] = useState<'youtube' | 'tiktok' | 'platform' | null>(null)
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(true)
  const [agentProfile, setAgentProfile] = useState({
    id: 'agent-001',
    name: 'John Kamau',
    tiktokHandle: '@johnkamau_KE',
    youtubeChannel: 'UC1234567890',
    platformUrl: 'https://stream.example.com/johnkamau'
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        updateElapsedTime()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLive, updateElapsedTime])

  const handleGoLive = async () => {
    setLoading(true)
    
    try {
      // Simulate API call to start stream
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Determine which platform is active
      let platform = 'youtube' as 'youtube' | 'tiktok' | 'platform'
      if (urls.tiktok) platform = 'tiktok'
      else if (urls.platform) platform = 'platform'
      
      setActivePlatform(platform)
      
      const newStream = {
        id: `stream-${Date.now()}`,
        agent_id: agentProfile.id,
        station_code: 'KE-047-290-0001',
        tiktok_url: urls.tiktok || null,
        youtube_url: urls.youtube || null,
        platform_url: urls.platform || null,
        status: 'live' as const,
        start_time: new Date().toISOString(),
        end_time: null,
        viewer_count: 0,
        created_at: new Date().toISOString(),
        platform: platform
      }

      setCurrentStream(newStream)
      setIsLive(true)
      setStartTime(new Date())
      setShowPreview(true)
      
      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        const currentStream = streamStore.currentStream
        if (currentStream && currentStream.status === 'live') {
          setCurrentStream({
            ...currentStream,
            viewer_count: (currentStream.viewer_count || 0) + Math.floor(Math.random() * 10)
          })
        }
      }, 5000)
      
      // Store interval ID for cleanup
      ;(window as any).viewerInterval = viewerInterval
      
    } catch (error) {
      console.error('Failed to start stream:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEndStream = async () => {
    setLoading(true)
    
    try {
      // Clear viewer count interval
      if ((window as any).viewerInterval) {
        clearInterval((window as any).viewerInterval)
        delete (window as any).viewerInterval
      }
      
      // Simulate API call to end stream
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (currentStream) {
        const updatedStream = {
          ...currentStream,
          status: 'ended' as const,
          end_time: new Date().toISOString()
        }
        setCurrentStream(updatedStream)
      }
      
      setIsLive(false)
      resetStream()
      setShowPreview(false)
    } catch (error) {
      console.error('Failed to end stream:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (platform: keyof typeof urls, value: string) => {
    setUrls(prev => ({ ...prev, [platform]: value }))
    setShowPreview(false)
  }

  const handleAutoLink = () => {
    setUrls({
      tiktok: `https://www.tiktok.com/${agentProfile.tiktokHandle}/live`,
      youtube: `https://www.youtube.com/channel/${agentProfile.youtubeChannel}/live`,
      platform: agentProfile.platformUrl
    })
    setShowPreview(true)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          Stream Management
          {isLive && (
            <Badge variant="error" className="ml-3">
              <StreamStatusDot status="live" className="mr-2" />
              LIVE
            </Badge>
          )}
        </h2>
        {isLive && (
          <div className="flex items-center space-x-4">
            <div className="text-kura-accent font-mono text-lg">
              {elapsedTime}
            </div>
            {currentStream && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">
                  {(currentStream.viewer_count || 0).toLocaleString()} viewers
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* URL Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TikTok URL
              <StreamStatusDot status={currentStream?.status || 'offline'} className="ml-2" />
            </label>
            <div className="relative">
              <input
                type="url"
                value={urls.tiktok}
                onChange={(e) => handleUrlChange('tiktok', e.target.value)}
                placeholder="https://www.tiktok.com/@user/live"
                className="w-full px-3 py-2 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                disabled={isLive}
              />
              {urls.tiktok && isValidUrl(urls.tiktok) && (
                <Link className="absolute right-3 top-2.5 w-4 h-4 text-kura-accent" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
              <StreamStatusDot status={currentStream?.status || 'offline'} className="ml-2" />
            </label>
            <div className="relative">
              <input
                type="url"
                value={urls.youtube}
                onChange={(e) => handleUrlChange('youtube', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                disabled={isLive}
              />
              {urls.youtube && isValidUrl(urls.youtube) && (
                <ExternalLink className="absolute right-3 top-2.5 w-4 h-4 text-kura-accent" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform URL
              <StreamStatusDot status={currentStream?.status || 'offline'} className="ml-2" />
            </label>
            <div className="relative">
              <input
                type="url"
                value={urls.platform}
                onChange={(e) => handleUrlChange('platform', e.target.value)}
                placeholder="https://platform.example.com/stream"
                className="w-full px-3 py-2 bg-kura-navy border border-kura-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
                disabled={isLive}
              />
              {urls.platform && isValidUrl(urls.platform) && (
                <ExternalLink className="absolute right-3 top-2.5 w-4 h-4 text-kura-accent" />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoLive}
            disabled={isLive || isLoading || (!urls.tiktok && !urls.youtube && !urls.platform)}
            className="flex items-center px-6 py-2 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Go Live
              </>
            )}
          </button>

          {isLive && (
            <button
              onClick={handleEndStream}
              disabled={isLoading}
              className="flex items-center px-6 py-2 bg-kura-accent2 hover:bg-kura-accent2/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  End Stream
                </>
              )}
            </button>
          )}

          <button
            onClick={handleAutoLink}
            className="px-6 py-2 bg-kura-navy-mid hover:bg-kura-navy-mid/80 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Auto-link from Profile</span>
          </button>
          
          <button
            onClick={() => setTranscriptionEnabled(!transcriptionEnabled)}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              transcriptionEnabled 
                ? 'bg-kura-green hover:bg-kura-green/80 text-black' 
                : 'bg-kura-elevated hover:bg-kura-elevated/80 text-kura-text'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Transcription: {transcriptionEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Live Stream Display */}
        {isLive && activePlatform && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Live Stream</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-kura-green rounded-full live-pulse"></div>
                  <span>ACTIVE</span>
                </Badge>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 rounded bg-kura-elevated hover:bg-kura-elevated/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-kura-text" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Player */}
              <div>
                <VideoPlayer
                  url={activePlatform === 'tiktok' ? urls.tiktok : activePlatform === 'youtube' ? urls.youtube : urls.platform}
                  platform={activePlatform}
                  isLive={true}
                  title={`${agentProfile.name} - Live from Station KE-047-290-0001`}
                />
              </div>
              
              {/* Transcription */}
              {transcriptionEnabled && (
                <TranscriptionDisplay
                  streamId={currentStream?.id}
                  isActive={isLive}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Stream Preview (when not live) */}
        {showPreview && !isLive && (urls.tiktok || urls.youtube || urls.platform) && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Stream Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urls.tiktok && isValidUrl(urls.tiktok) && (
                <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">TikTok</h4>
                  <div className="aspect-video bg-black rounded flex items-center justify-center">
                    <span className="text-gray-500">TikTok Stream Preview</span>
                  </div>
                </div>
              )}
              {urls.youtube && isValidUrl(urls.youtube) && (
                <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">YouTube</h4>
                  <div className="aspect-video bg-black rounded flex items-center justify-center">
                    <span className="text-gray-500">YouTube Stream Preview</span>
                  </div>
                </div>
              )}
              {urls.platform && isValidUrl(urls.platform) && (
                <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Platform</h4>
                  <div className="aspect-video bg-black rounded flex items-center justify-center">
                    <span className="text-gray-500">Platform Stream Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
