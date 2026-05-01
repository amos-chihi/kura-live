'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Download, Search, Clock, CheckCircle } from 'lucide-react'

interface TranscriptionSegment {
  id: string
  timestamp: string
  text: string
  confidence: number
  speaker?: string
  isFinal: boolean
}

interface TranscriptionDisplayProps {
  streamId?: string
  isActive?: boolean
  className?: string
}

export default function TranscriptionDisplay({ 
  streamId, 
  isActive = false, 
  className = '' 
}: TranscriptionDisplayProps) {
  const [segments, setSegments] = useState<TranscriptionSegment[]>([])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate real-time transcription
  useEffect(() => {
    if (!isActive || !streamId) return

    setIsTranscribing(true)
    
    const mockTranscriptions = [
      { text: "Welcome to the polling station at KICC Nairobi", confidence: 0.95 },
      { text: "We're beginning the vote counting process now", confidence: 0.92 },
      { text: "The presiding officer is verifying the ballot boxes", confidence: 0.88 },
      { text: "Agents from all major parties are present", confidence: 0.94 },
      { text: "The first batch of ballots is being sorted", confidence: 0.91 },
      { text: "UDA agent is observing the process closely", confidence: 0.89 },
      { text: "ODM representative has signed off on the count", confidence: 0.93 },
      { text: "Total votes for this station: 347", confidence: 0.96 },
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < mockTranscriptions.length) {
        const newSegment: TranscriptionSegment = {
          id: `segment-${Date.now()}-${index}`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          text: mockTranscriptions[index].text,
          confidence: mockTranscriptions[index].confidence,
          speaker: index % 3 === 0 ? 'Agent' : 'Officer',
          isFinal: true
        }
        
        setSegments(prev => [...prev, newSegment])
        index++
      } else {
        clearInterval(interval)
        setIsTranscribing(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive, streamId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [segments, autoScroll])

  const filteredSegments = segments.filter(segment =>
    segment.text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportTranscription = () => {
    const content = segments.map(segment => 
      `[${segment.timestamp}] ${segment.speaker || 'Unknown'}: ${segment.text} (Confidence: ${segment.confidence})`
    ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${streamId}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearTranscription = () => {
    setSegments([])
  }

  return (
    <div className={`bg-kura-panel border border-kura-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kura-border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isTranscribing ? (
              <div className="flex items-center space-x-1">
                <Mic className="w-4 h-4 text-kura-green animate-pulse" />
                <span className="text-xs text-kura-green">Transcribing</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <MicOff className="w-4 h-4 text-kura-text-muted" />
                <span className="text-xs text-kura-text-muted">Inactive</span>
              </div>
            )}
          </div>
          <div className="text-xs text-kura-text-muted">
            {segments.length} segments
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded text-xs transition-colors ${
              autoScroll 
                ? 'bg-kura-green/20 text-kura-green' 
                : 'bg-kura-panel2 text-kura-muted hover:text-kura-text'
            }`}
          >
            Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={exportTranscription}
            disabled={segments.length === 0}
            className="p-1.5 rounded bg-kura-panel2 text-kura-muted hover:text-kura-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-kura-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-kura-muted" />
          <input
            type="text"
            placeholder="Search transcription..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-kura-bg border border-kura-border rounded-lg text-kura-text placeholder-kura-muted focus:outline-none focus:border-kura-green text-sm"
          />
        </div>
      </div>

      {/* Transcription Content */}
      <div 
        ref={containerRef}
        className="h-96 overflow-y-auto p-4 space-y-3"
      >
        {filteredSegments.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <div>
                <div className="text-kura-muted text-sm mb-2">No results found</div>
                <div className="text-kura-text-faint text-xs">Try adjusting your search terms</div>
              </div>
            ) : (
              <div>
                <div className="text-kura-muted text-sm mb-2">
                  {isActive ? 'Waiting for transcription...' : 'Start streaming to begin transcription'}
                </div>
                <div className="text-kura-text-faint text-xs">
                  {isActive ? 'Audio is being processed' : 'Transcription will begin automatically'}
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredSegments.map((segment) => (
            <div 
              key={segment.id}
              className={`p-3 rounded-lg border transition-all ${
                segment.isFinal 
                  ? 'bg-kura-bg border-kura-border' 
                  : 'bg-kura-elevated border-kura-green/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-kura-text-faint" />
                  <span className="text-xs text-kura-text-faint">{segment.timestamp}</span>
                  {segment.speaker && (
                    <span className="text-xs text-kura-green bg-kura-green/20 px-2 py-0.5 rounded">
                      {segment.speaker}
                    </span>
                  )}
                  {segment.isFinal && (
                    <CheckCircle className="w-3 h-3 text-kura-green" />
                  )}
                </div>
                <div className="text-xs text-kura-text-faint">
                  {Math.round(segment.confidence * 100)}% confidence
                </div>
              </div>
              <div className="text-sm text-kura-text leading-relaxed">
                {segment.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-kura-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-kura-text-faint">
            Real-time transcription powered by AI
          </div>
          <button
            onClick={clearTranscription}
            disabled={segments.length === 0}
            className="text-xs text-kura-red hover:text-kura-red/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
