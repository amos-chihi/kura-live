'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface TranscriptionPanelProps {
  agent: Agent | null
}

interface TranscriptLine {
  id: string
  text: string
  timestamp: string
  confidence: number
  extracted_votes?: {
    candidate_name: string
    votes: number
  }[]
}

export default function TranscriptionPanel({ agent }: TranscriptionPanelProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [extractedVotes, setExtractedVotes] = useState<any[]>([])

  useEffect(() => {
    // Mock transcript data
    const mockTranscript: TranscriptLine[] = [
      {
        id: '1',
        text: "Good morning everyone, we are at polling station KE-047-290-0001 and the counting process has just begun.",
        timestamp: '00:00:15',
        confidence: 0.95,
        extracted_votes: []
      },
      {
        id: '2',
        text: "The first candidate results are coming in. Mary Wambui has received 245 votes.",
        timestamp: '00:02:30',
        confidence: 0.92,
        extracted_votes: [
          { candidate_name: 'Mary Wambui', votes: 245 }
        ]
      },
      {
        id: '3',
        text: "John Kariuki is at 189 votes according to the initial count.",
        timestamp: '00:04:15',
        confidence: 0.88,
        extracted_votes: [
          { candidate_name: 'John Kariuki', votes: 189 }
        ]
      },
      {
        id: '4',
        text: "The presiding officer is now verifying the Form 34A document.",
        timestamp: '00:06:45',
        confidence: 0.91,
        extracted_votes: []
      }
    ]

    setTranscript(mockTranscript)

    const allExtractedVotes = mockTranscript
      .filter(line => line.extracted_votes && line.extracted_votes.length > 0)
      .flatMap(line => line.extracted_votes || [])
    
    setExtractedVotes(allExtractedVotes)
  }, [])

  const handleStartTranscription = () => {
    setIsTranscribing(true)
    // In real app, this would start real-time transcription
  }

  const handleStopTranscription = () => {
    setIsTranscribing(false)
  }

  const handleRefreshTranscript = () => {
    // Simulate refreshing transcript
    console.log('Refreshing transcript...')
  }

  const handleDownloadTranscript = () => {
    // Simulate downloading transcript
    const transcriptText = transcript.map(line => 
      `[${line.timestamp}] ${line.text}`
    ).join('\n')
    
    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${agent?.station_code}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Transcription Control */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Live Transcription</h2>
          <div className="flex items-center space-x-3">
            {isTranscribing && (
              <Badge variant="error" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Recording
              </Badge>
            )}
            
            <button
              onClick={handleRefreshTranscript}
              className="p-2 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            
            <button
              onClick={handleDownloadTranscript}
              className="flex items-center px-4 py-2 bg-kura-navy border border-kura-border text-white rounded-lg hover:bg-kura-navy-mid transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>

        {/* Transcription Controls */}
        <div className="flex items-center justify-center">
          {!isTranscribing ? (
            <button
              onClick={handleStartTranscription}
              className="flex items-center px-6 py-3 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Transcription
            </button>
          ) : (
            <button
              onClick={handleStopTranscription}
              className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop Transcription
            </button>
          )}
        </div>
      </div>

      {/* Extracted Votes Summary */}
      {extractedVotes.length > 0 && (
        <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Extracted Vote Summary</h3>
          <div className="space-y-3">
            {extractedVotes.map((vote, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-kura-navy rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">{vote.candidate_name}</span>
                </div>
                <span className="text-kura-accent font-semibold">{vote.votes} votes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Live Transcript</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transcript.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-kura-navy rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm text-gray-400">{line.timestamp}</span>
                <span className={`text-xs ${getConfidenceColor(line.confidence)}`}>
                  {Math.round(line.confidence * 100)}% confidence
                </span>
              </div>
              
              <p className="text-white mb-2">{line.text}</p>
              
              {line.extracted_votes && line.extracted_votes.length > 0 && (
                <div className="mt-3 p-2 bg-kura-accent/10 border border-kura-accent/30 rounded">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-kura-accent" />
                    <span className="text-xs text-kura-accent font-medium">Votes Extracted:</span>
                  </div>
                  {line.extracted_votes.map((vote, idx) => (
                    <div key={idx} className="text-xs text-white ml-5">
                      {vote.candidate_name}: {vote.votes} votes
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transcription Settings */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transcription Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-detect Speech</p>
              <p className="text-sm text-gray-400">Automatically start transcription when speech is detected</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Language</p>
              <p className="text-sm text-gray-400">Transcription language</p>
            </div>
            <select className="bg-kura-navy border border-kura-border rounded px-3 py-1 text-white">
              <option>English</option>
              <option>Swahili</option>
              <option>Auto-detect</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Vote Extraction</p>
              <p className="text-sm text-gray-400">Automatically extract vote numbers from speech</p>
            </div>
            <button className="w-12 h-6 bg-kura-accent rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
