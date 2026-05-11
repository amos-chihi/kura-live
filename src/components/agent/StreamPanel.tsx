'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Radio, Play, Square, ExternalLink, Users, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent, LiveStream } from '@/lib/types'
import VideoPlayer from '@/components/ui/VideoPlayer'

interface StreamPanelProps {
  agent: Agent | null
  currentStream: LiveStream | null
  isStreaming: boolean
  streamTimer: number
  onStartStream: () => void
  onStopStream: () => void
  formatTime: (seconds: number) => string
}

export default function StreamPanel({ 
  agent, 
  currentStream, 
  isStreaming, 
  streamTimer, 
  onStartStream, 
  onStopStream, 
  formatTime 
}: StreamPanelProps) {
  const [streamUrls, setStreamUrls] = useState({
    tiktok: agent?.tiktok_url || '',
    youtube: agent?.youtube_url || '',
    platform: agent?.platform_url || ''
  })

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [preferredPlatform, setPreferredPlatform] = useState<'tiktok' | 'youtube' | 'platform'>('tiktok')

  const handleUrlChange = (platform: keyof typeof streamUrls, url: string) => {
    setStreamUrls(prev => ({ ...prev, [platform]: url }))
    setPreferredPlatform(platform)
  }

  const getActivePlatform = () => {
    if (preferredPlatform === 'tiktok' && streamUrls.tiktok) return 'tiktok'
    if (preferredPlatform === 'youtube' && streamUrls.youtube) return 'youtube'
    if (preferredPlatform === 'platform' && streamUrls.platform) return 'platform'
    if (streamUrls.tiktok) return 'tiktok'
    if (streamUrls.youtube) return 'youtube'
    if (streamUrls.tiktok) return 'tiktok'
    if (streamUrls.platform) return 'platform'
    return null
  }

  const activePlatform = getActivePlatform()
  const activeUrl = activePlatform ? streamUrls[activePlatform as keyof typeof streamUrls] : null

  return (
    <div className="space-y-6">
      {/* Stream Control Panel */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Live Stream Control</h2>
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <Badge variant="error" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            )}
            <Badge variant="default">
              <Eye className="w-3 h-3 mr-1" />
              {currentStream?.viewer_count || 0} viewers
            </Badge>
          </div>
        </div>

        {/* Stream URLs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Stream URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={streamUrls.youtube}
                onChange={(e) => handleUrlChange('youtube', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
              {streamUrls.youtube && (
                <button
                  onClick={() => window.open(streamUrls.youtube, '_blank')}
                  className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">TikTok Stream URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={streamUrls.tiktok}
                onChange={(e) => handleUrlChange('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@username..."
                className="flex-1 bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
              {streamUrls.tiktok && (
                <button
                  onClick={() => window.open(streamUrls.tiktok, '_blank')}
                  className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platform Stream URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={streamUrls.platform}
                onChange={(e) => handleUrlChange('platform', e.target.value)}
                placeholder="https://platform.example.com/stream..."
                className="flex-1 bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
              {streamUrls.platform && (
                <button
                  onClick={() => window.open(streamUrls.platform, '_blank')}
                  className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stream Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isStreaming ? (
              <button
                onClick={onStartStream}
                disabled={!activeUrl}
                className="flex items-center px-6 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 mr-2" />
                Go Live
              </button>
            ) : (
              <button
                onClick={onStopStream}
                className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                End Stream
              </button>
            )}

            <div className="text-sm text-gray-400">
              Stream Time: {formatTime(streamTimer)}
            </div>
          </div>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center px-4 py-2 bg-kura-navy border border-kura-border text-white rounded-lg hover:bg-kura-navy-mid transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Stream Preview */}
      {isPreviewMode && activeUrl && activePlatform && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-kura-surface border border-kura-border rounded-lg p-6"
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Stream Preview</h3>
              <p className="text-sm text-gray-400">
                Use the Transcription tab to capture live TikTok tab audio and send it into the verification pipeline.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open(activeUrl, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center justify-center rounded-lg border border-kura-border bg-kura-navy px-4 py-2 text-sm text-white transition-colors hover:bg-kura-navy-mid"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Active Feed
            </button>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              url={activeUrl}
              platform={activePlatform}
              isLive={isStreaming}
              title={`${activePlatform.toUpperCase()} station feed`}
              className="h-full w-full"
            />
          </div>
        </motion.div>
      )}

      {/* Stream Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{currentStream?.viewer_count || 0}</span>
          </div>
          <div className="text-sm text-gray-400">Current Viewers</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white">{activePlatform || 'None'}</span>
          </div>
          <div className="text-sm text-gray-400">Active Platform</div>
        </div>

        <div className="bg-kura-surface border border-kura-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Radio className="w-5 h-5 text-kura-accent" />
            <span className="text-2xl font-bold text-white capitalize">{currentStream?.status || 'offline'}</span>
          </div>
          <div className="text-sm text-gray-400">Stream Status</div>
        </div>
      </div>

      {/* Stream Settings */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stream Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-record Stream</p>
              <p className="text-sm text-gray-400">Automatically record all streams</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Stream Quality</p>
              <p className="text-sm text-gray-400">Video quality settings</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>1080p HD</option>
              <option>720p</option>
              <option>480p</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Audio Bitrate</p>
              <p className="text-sm text-gray-400">Audio quality settings</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>128 kbps</option>
              <option>96 kbps</option>
              <option>64 kbps</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
