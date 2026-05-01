'use client'

import { useState, useEffect } from 'react'
import { useTallyStore } from '@/store/tallyStore'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Play, Square, Mic } from 'lucide-react'

export function TranscriptionPanel() {
  const { extractedVotes, addExtractedVote, setExtractedVotes, isLoading, setLoading } = useTallyStore()
  
  const [transcript, setTranscript] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)

  const simulateTranscript = async () => {
    setIsSimulating(true)
    setLoading(true)
    setTranscript('')
    setExtractedVotes([])
    setCurrentLineIndex(0)

    try {
      const response = await fetch('/api/simulate/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const { data, error } = await response.json()
      
      if (error) throw new Error(error)
      
      // Process transcript lines one by one with typewriter effect
      for (let i = 0; i < data.length; i++) {
        const line = data[i]
        setCurrentLineIndex(i)
        
        // Typewriter effect for the line
        let currentText = ''
        const fullText = line.text
        
        for (let j = 0; j <= fullText.length; j++) {
          currentText = fullText.substring(0, j)
          setTranscript(prev => prev + (j === 0 ? '\n' : fullText[j - 1]))
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        
        // Extract votes if present
        if (line.extracted_votes && line.extracted_votes.length > 0) {
          line.extracted_votes.forEach((vote: { candidate_name: string; votes: number }) => {
            addExtractedVote({
              candidate_name: vote.candidate_name,
              votes: vote.votes,
              confidence: 0.90
            })
          })
        }
        
        // Pause between lines
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Failed to simulate transcript:', error)
    } finally {
      setIsSimulating(false)
      setLoading(false)
    }
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    setLoading(false)
  }

  return (
    <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Mic className="w-5 h-5 mr-2 text-kura-accent" />
          Live Transcription
        </h2>
        <div className="flex items-center gap-2">
          {isSimulating && (
            <Badge variant="info" className="animate-pulse">
              Recording...
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={simulateTranscript}
            disabled={isSimulating}
            className="flex items-center px-6 py-2 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isSimulating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Simulate Announcement
              </>
            )}
          </button>

          {isSimulating && (
            <button
              onClick={stopSimulation}
              className="flex items-center px-6 py-2 bg-kura-accent2 hover:bg-kura-accent2/80 text-white rounded-lg transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </button>
          )}
        </div>

        {/* Transcript Display */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Live Transcript</h3>
          <div className="bg-kura-navy border border-kura-border rounded-lg p-4 h-64 overflow-y-auto">
            {transcript ? (
              <div className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                {transcript}
                {isSimulating && (
                  <span className="inline-block w-2 h-4 bg-kura-accent animate-pulse ml-1" />
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-20">
                {isSimulating ? 'Starting transcription...' : 'Click "Simulate Announcement" to begin'}
              </div>
            )}
          </div>
        </div>

        {/* Extracted Votes */}
        {extractedVotes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Extracted Votes</h3>
            <div className="bg-kura-navy border border-kura-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-kura-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Candidate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Party</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Votes</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedVotes.map((vote, index) => (
                    <tr key={index} className="border-b border-kura-border last:border-b-0">
                      <td className="px-4 py-3 text-white">{vote.candidate_name}</td>
                      <td className="px-4 py-3 text-gray-300">—</td>
                      <td className="px-4 py-3 text-white">
                        <div className="flex items-center">
                          <span className="font-mono">{vote.votes.toLocaleString()}</span>
                          <div className="ml-3 flex-1 bg-kura-navy-mid rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-kura-accent h-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min((vote.votes / 20000) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {vote.confidence ? `${(vote.confidence * 100).toFixed(0)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
