'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Signal, 
  Clock, 
  Eye, 
  Volume2, 
  Maximize2,
  Grid,
  List
} from 'lucide-react'
import { useWebSocketStore } from '@/store/websocketStore'

export default function StreamWall() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const { streams, stations } = useWebSocketStore()

  // Get station info for each stream
  const streamsWithStationInfo = streams.map(stream => {
    const station = stations.find(s => s.station_code === stream.station_code)
    return {
      ...stream,
      station_name: station?.station_name || 'Unknown Station',
      county: station?.county || 'Unknown',
      constituency: station?.constituency || 'Unknown'
    }
  })

  const getSignalQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-kura-green'
    if (quality >= 60) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const getLatencyColor = (latency: number) => {
    if (latency <= 1000) return 'text-kura-green'
    if (latency <= 2000) return 'text-kura-amber'
    return 'text-kura-red'
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '📺'
      case 'tiktok':
        return '🎵'
      default:
        return '📹'
    }
  }

  const StreamCard = ({ stream, index }: { stream: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`command-panel cursor-pointer transition-all duration-200 ${
        selectedStream === stream.id ? 'ring-2 ring-kura-blue shadow-glow-blue' : ''
      }`}
      onClick={() => setSelectedStream(stream.id === selectedStream ? null : stream.id)}
    >
      {/* Stream Header */}
      <div className="flex items-center justify-between p-3 border-b border-kura-border">
        <div className="flex items-center space-x-2">
          <div className="relative">
            {stream.status === 'live' ? (
              <>
                <Wifi className="w-4 h-4 text-kura-green" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-kura-red rounded-full animate-pulse"></div>
              </>
            ) : (
              <WifiOff className="w-4 h-4 text-kura-muted" />
            )}
          </div>
          <span className="text-xs font-medium text-kura-text">
            {stream.status === 'live' ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-lg">{getPlatformIcon(stream.platform)}</span>
          <button className="p-1 rounded hover:bg-kura-panel2 transition-colors">
            <Maximize2 className="w-3 h-3 text-kura-muted" />
          </button>
        </div>
      </div>

      {/* Stream Content */}
      <div className="aspect-video bg-kura-panel2 relative overflow-hidden">
        {stream.status === 'live' ? (
          <div className="absolute inset-0 bg-gradient-to-br from-kura-blue/20 to-kura-purple/20 flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-8 h-8 text-kura-blue mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-kura-text">{stream.station_name}</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-kura-panel flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-kura-muted" />
          </div>
        )}
        
        {/* Viewer Count */}
        {stream.status === 'live' && (
          <div className="absolute top-2 right-2 bg-kura-bg/80 backdrop-blur-xs px-2 py-1 rounded flex items-center space-x-1">
            <Eye className="w-3 h-3 text-kura-text" />
            <span className="text-xs text-kura-text">{stream.viewers.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Stream Info */}
      <div className="p-3 space-y-2">
        <div>
          <p className="text-sm font-medium text-kura-text truncate">{stream.station_name}</p>
          <p className="text-xs text-kura-muted">{stream.constituency}, {stream.county}</p>
        </div>

        {/* Agent */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-kura-blue/20 rounded-full flex items-center justify-center">
            <span className="text-xs text-kura-blue">A</span>
          </div>
          <span className="text-xs text-kura-muted">{stream.agent_name}</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Signal className="w-3 h-3" />
            <span className={getSignalQualityColor(stream.signal_quality)}>
              {stream.signal_quality}%
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className={getLatencyColor(stream.latency)}>
              {stream.latency}ms
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Volume2 className="w-3 h-3 text-kura-muted" />
            <span className="text-kura-muted">Audio</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-t border-kura-border">
        <button className="w-full ops-button-primary text-xs">
          Open Feed
        </button>
      </div>
    </motion.div>
  )

  const StreamListItem = ({ stream, index }: { stream: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`command-panel cursor-pointer transition-all duration-200 ${
        selectedStream === stream.id ? 'ring-2 ring-kura-blue shadow-glow-blue' : ''
      }`}
      onClick={() => setSelectedStream(stream.id === selectedStream ? null : stream.id)}
    >
      <div className="flex items-center space-x-4 p-4">
        {/* Status */}
        <div className="flex items-center space-x-2">
          {stream.status === 'live' ? (
            <>
              <Wifi className="w-4 h-4 text-kura-green" />
              <div className="w-2 h-2 bg-kura-red rounded-full animate-pulse"></div>
            </>
          ) : (
            <WifiOff className="w-4 h-4 text-kura-muted" />
          )}
        </div>

        {/* Platform */}
        <span className="text-lg">{getPlatformIcon(stream.platform)}</span>

        {/* Station Info */}
        <div className="flex-1">
          <p className="text-sm font-medium text-kura-text">{stream.station_name}</p>
          <p className="text-xs text-kura-muted">{stream.constituency}, {stream.county}</p>
        </div>

        {/* Agent */}
        <div className="text-xs text-kura-muted">
          <p>{stream.agent_name}</p>
        </div>

        {/* Metrics */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{stream.viewers.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Signal className="w-3 h-3" />
            <span className={getSignalQualityColor(stream.signal_quality)}>
              {stream.signal_quality}%
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className={getLatencyColor(stream.latency)}>
              {stream.latency}ms
            </span>
          </div>
        </div>

        {/* Action */}
        <button className="ops-button-primary text-xs px-3 py-1">
          Open
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="command-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div>
          <h2 className="text-lg font-semibold text-kura-text flex items-center space-x-2">
            <Radio className="w-5 h-5 text-kura-green" />
            <span>Live Stream Monitor</span>
          </h2>
          <p className="text-xs text-kura-muted">
            {streams.filter(s => s.status === 'live').length} of {streams.length} streams active
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`ops-button text-xs ${
              viewMode === 'grid' ? 'ops-button-primary' : 'ops-button-secondary'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`ops-button text-xs ${
              viewMode === 'list' ? 'ops-button-primary' : 'ops-button-secondary'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stream Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streamsWithStationInfo.map((stream, index) => (
              <StreamCard key={stream.id} stream={stream} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {streamsWithStationInfo.map((stream, index) => (
              <StreamListItem key={stream.id} stream={stream} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Stream Statistics */}
      <div className="p-4 border-t border-kura-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-kura-green">
              {streams.filter(s => s.status === 'live').length}
            </div>
            <div className="text-xs text-kura-muted">Live</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-blue">
              {streams.reduce((sum, s) => sum + s.viewers, 0).toLocaleString()}
            </div>
            <div className="text-xs text-kura-muted">Viewers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-amber">
              {Math.round(streams.reduce((sum, s) => sum + s.signal_quality, 0) / streams.length)}%
            </div>
            <div className="text-xs text-kura-muted">Avg Signal</div>
          </div>
          <div>
            <div className="text-lg font-bold text-kura-purple">
              {Math.round(streams.reduce((sum, s) => sum + s.latency, 0) / streams.length)}ms
            </div>
            <div className="text-xs text-kura-muted">Avg Latency</div>
          </div>
        </div>
      </div>
    </div>
  )
}
