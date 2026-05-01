'use client'

import { useState } from 'react'
import VideoPlayer from '@/components/ui/VideoPlayer'
import TranscriptionDisplay from '@/components/ui/TranscriptionDisplay'
import Badge from '@/components/ui/Badge'
import { Play, ExternalLink, Info } from 'lucide-react'

const TEST_STREAMS = [
  {
    name: 'YouTube Live Stream Example',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Example live stream URL
    platform: 'youtube' as const,
    description: 'Test with YouTube live streaming'
  },
  {
    name: 'TikTok Live Stream Example', 
    url: 'https://www.tiktok.com/@tiktok/live',
    platform: 'tiktok' as const,
    description: 'Test with TikTok live streaming'
  },
  {
    name: 'Custom Platform Stream',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    platform: 'platform' as const,
    description: 'Test with direct video file'
  }
]

export default function StreamTestPage() {
  const [selectedStream, setSelectedStream] = useState(TEST_STREAMS[0])
  const [isTranscribing, setIsTranscribing] = useState(false)

  return (
    <div className="min-h-screen bg-kura-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Live Stream Testing</h1>
          <p className="text-kura-text-body">
            Test the streaming functionality with different platforms and URLs
          </p>
        </div>

        {/* Stream Selection */}
        <div className="data-card">
          <h2 className="section-heading mb-4">Select Test Stream</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEST_STREAMS.map((stream, index) => (
              <button
                key={index}
                onClick={() => setSelectedStream(stream)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedStream === stream
                    ? 'border-kura-green bg-kura-green/10'
                    : 'border-kura-border bg-kura-elevated hover:border-kura-text-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{stream.name}</span>
                  <Badge variant={selectedStream === stream ? 'success' : 'info'} size="sm">
                    {stream.platform}
                  </Badge>
                </div>
                <p className="text-sm text-kura-text-body mb-2">{stream.description}</p>
                <div className="flex items-center space-x-2 text-xs text-kura-text-muted">
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate">{stream.url}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Stream Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Player */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Video Player</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-kura-green rounded-full live-pulse"></div>
                  <span>TEST MODE</span>
                </Badge>
              </div>
            </div>
            
            <VideoPlayer
              url={selectedStream.url}
              platform={selectedStream.platform}
              isLive={true}
              title={selectedStream.name}
              className="w-full"
            />
            
            <div className="bg-kura-elevated rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center space-x-2">
                <Info className="w-4 h-4 text-kura-amber" />
                <span>Testing Notes</span>
              </h3>
              <ul className="text-xs text-kura-text-body space-y-1">
                <li>• YouTube: Uses iframe embedding with autoplay</li>
                <li>• TikTok: Uses iframe embedding for live streams</li>
                <li>• Platform: Direct video with custom controls</li>
                <li>• All platforms support fullscreen and volume control</li>
              </ul>
            </div>
          </div>

          {/* Transcription */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Live Transcription</h2>
              <button
                onClick={() => setIsTranscribing(!isTranscribing)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  isTranscribing 
                    ? 'bg-kura-green hover:bg-kura-green/80 text-black' 
                    : 'bg-kura-elevated hover:bg-kura-elevated/80 text-kura-text'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>{isTranscribing ? 'Stop' : 'Start'} Transcription</span>
              </button>
            </div>
            
            <TranscriptionDisplay
              streamId="test-stream-123"
              isActive={isTranscribing}
              className="h-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="data-card">
          <h2 className="section-heading mb-4">How to Test with Live URLs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-white mb-3">YouTube Live Streams</h3>
              <ol className="text-xs text-kura-text-body space-y-2">
                <li>1. Find a live stream on YouTube</li>
                <li>2. Copy the URL from the browser</li>
                <li>3. Paste it in the YouTube URL field</li>
                <li>4. Click &quot;Go Live&quot; to start streaming</li>
                <li>5. Enable transcription for real-time text</li>
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-3">TikTok Live Streams</h3>
              <ol className="text-xs text-kura-text-body space-y-2">
                <li>1. Find a live stream on TikTok</li>
                <li>2. Copy the profile URL with /live</li>
                <li>3. Paste it in the TikTok URL field</li>
                <li>4. Click &quot;Go Live&quot; to start streaming</li>
                <li>5. Monitor transcription for vote counting</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
