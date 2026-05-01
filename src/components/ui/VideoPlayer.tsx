'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  platform: 'youtube' | 'tiktok' | 'platform'
  isLive?: boolean
  title?: string
  className?: string
}

export default function VideoPlayer({ 
  url, 
  platform, 
  isLive = false, 
  title = 'Live Stream',
  className = '' 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getEmbedUrl = (originalUrl: string, platform: string) => {
    try {
      const url = new URL(originalUrl)
      
      if (platform === 'youtube') {
        // Handle YouTube URLs (both regular and live)
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
          let videoId = ''
          if (url.hostname.includes('youtu.be')) {
            videoId = url.pathname.slice(1)
          } else {
            videoId = url.searchParams.get('v') || ''
          }
          
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`
          }
        }
      } else if (platform === 'tiktok') {
        // Handle TikTok URLs
        if (url.hostname.includes('tiktok.com')) {
          const username = url.pathname.split('/')[1]
          if (username) {
            return `https://www.tiktok.com/@${username}/live`
          }
        }
      }
      
      // For custom platform URLs, return as-is for iframe embedding
      return originalUrl
    } catch (error) {
      console.error('Invalid URL:', error)
      return originalUrl
    }
  }

  const embedUrl = getEmbedUrl(url, platform)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen()
    }
  }

  const renderVideoPlayer = () => {
    if (platform === 'youtube') {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      )
    } else if (platform === 'tiktok') {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      )
    } else {
      // For custom platforms or direct video files
      return (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full rounded-lg"
            onLoadedData={() => setIsLoading(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
          />
          
          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-sm">Loading stream...</div>
        </div>
      )}
      
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        </div>
      )}
      
      {/* Platform Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/50 px-2 py-1 rounded">
          <span className="text-white text-xs capitalize">{platform}</span>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="aspect-video">
        {renderVideoPlayer()}
      </div>
      
      {/* Stream Info */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 text-xs hover:text-white flex items-center space-x-1"
            >
              <span>Open in {platform}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
