'use client'

import { useState, useRef } from 'react'
import { useTallyStore } from '@/store/tallyStore'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Upload, FileText, Download, Eye } from 'lucide-react'

export function ResultsPanel() {
  const { tallies, addTally, setLoading } = useTallyStore()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState<string>('')
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle')
  const [extractedData, setExtractedData] = useState<any>(null)
  const [iebcData, setIebcData] = useState<any>(null)
  const [isFetchingIebc, setIsFetchingIebc] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calculateFileHash = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setScanStatus('idle')
    setExtractedData(null)

    const hash = await calculateFileHash(file)
    setFileHash(hash)
  }

  const simulateScan = async () => {
    if (!selectedFile) return

    setScanStatus('scanning')
    setLoading(true)

    try {
      // Simulate scanning process with progress updates
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Simulate data extraction
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock extracted data (in production this would come from OCR)
      const mockData = {
        station_code: 'KE-047-290-0001',
        station_name: 'Westlands Primary School Stream 1',
        constituency: 'Westlands',
        county: 'Nairobi',
        results: [
          { candidate_name: 'John Kariuki', party: 'UDA', votes: 14523 },
          { candidate_name: 'Mary Wambui', party: 'ODM', votes: 12892 },
          { candidate_name: 'Peter Omondi', party: 'ANC', votes: 9044 },
          { candidate_name: 'Grace Akinyi', party: 'WDM-K', votes: 3210 }
        ],
        total_valid_votes: 39669,
        total_rejected_votes: 412,
        presiding_officer: 'Jane M. Njoroge',
        timestamp: new Date().toISOString()
      }

      setExtractedData(mockData)
      setScanStatus('complete')

      // Add to tallies store
      mockData.results.forEach((result: any) => {
        addTally({
          id: `tally-${Date.now()}-${result.candidate_name}`,
          station_code: mockData.station_code,
          agent_id: 'agent-001',
          candidate_name: result.candidate_name,
          party: result.party,
          audio_votes: null,
          form34a_votes: result.votes,
          iebc_votes: null,
          max_delta: 0,
          status: 'pending',
          confidence: 0.95,
          source: 'form_ocr',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

    } catch (error) {
      console.error('Scan failed:', error)
      setScanStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const fetchIebcData = async () => {
    setIsFetchingIebc(true)
    
    try {
      const response = await fetch('/api/iebc/KE-047-290-0001')
      const { data, error } = await response.json()
      
      if (error) throw new Error(error)
      
      setIebcData(data)
      
      // Update tallies with IEBC data
      data.results.forEach((result: any) => {
        const existingTally = tallies.find(t => t.candidate_name === result.candidate_name)
        if (existingTally) {
          // In production, this would update the existing tally
          addTally({
            ...existingTally,
            iebc_votes: result.votes,
            updated_at: new Date().toISOString()
          })
        }
      })
      
    } catch (error) {
      console.error('Failed to fetch IEBC data:', error)
    } finally {
      setIsFetchingIebc(false)
    }
  }

  return (
    <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-kura-accent" />
          Form 34A Processing
        </h2>
        {scanStatus === 'scanning' && (
          <Badge variant="info" className="animate-pulse">
            Scanning...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: File Upload */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Upload Form 34A</h3>
            
            <div className="border-2 border-dashed border-kura-border rounded-lg p-8 text-center hover:border-kura-accent/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Upload className="w-12 h-12 text-kura-accent mx-auto mb-4" />
              
              {selectedFile ? (
                <div>
                  <p className="text-white font-medium mb-2">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {fileHash && (
                    <p className="text-gray-500 text-xs font-mono mb-4">
                      SHA-256: {fileHash.substring(0, 16)}...
                    </p>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-kura-accent hover:text-kura-accent/80 text-sm"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-4">
                    Drop your Form 34A image or PDF here, or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors"
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <button
                onClick={simulateScan}
                disabled={scanStatus === 'scanning'}
                className="w-full flex items-center justify-center px-6 py-3 bg-kura-accent hover:bg-kura-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {scanStatus === 'scanning' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Scanning with AI...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Scan with AI
                  </>
                )}
              </button>

              {scanStatus === 'scanning' && (
                <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Analyzing document...</span>
                      <span className="text-kura-accent">33%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Extracting text...</span>
                      <span className="text-kura-accent">66%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing results...</span>
                      <span className="text-kura-accent">99%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IEBC Portal Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">IEBC Portal</h3>
            <button
              onClick={fetchIebcData}
              disabled={isFetchingIebc}
              className="w-full flex items-center justify-center px-6 py-3 bg-kura-navy-mid hover:bg-kura-navy-mid/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isFetchingIebc ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Fetch from IEBC Portal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Extracted Results</h3>
          
          {extractedData ? (
            <div className="bg-kura-navy border border-kura-border rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    {extractedData.station_name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {extractedData.constituency}, {extractedData.county}
                  </p>
                </div>

                <div className="space-y-2">
                  {extractedData.results.map((result: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-kura-border last:border-b-0">
                      <div>
                        <p className="text-white font-medium">{result.candidate_name}</p>
                        <p className="text-xs text-gray-400">{result.party}</p>
                      </div>
                      <p className="text-white font-mono">{result.votes.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-kura-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valid Votes:</span>
                    <span className="text-white">{extractedData.total_valid_votes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rejected Votes:</span>
                    <span className="text-white">{extractedData.total_rejected_votes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-kura-navy border border-kura-border rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Upload and scan a Form 34A to see extracted results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
