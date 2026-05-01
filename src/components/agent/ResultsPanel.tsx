'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Camera, Scan, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Agent } from '@/lib/types'

interface ResultsPanelProps {
  agent: Agent | null
}

interface FormUpload {
  id: string
  formType: string
  fileName: string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  extractedData?: any
  uploadedAt: string
}

export default function ResultsPanel({ agent }: ResultsPanelProps) {
  const [uploads, setUploads] = useState<FormUpload[]>([
    {
      id: '1',
      formType: 'Form 34A',
      fileName: 'KE-047-290-0001_Form34A.jpg',
      status: 'complete',
      extractedData: {
        mary_wambui: 245,
        john_kariuki: 189,
        total_votes: 434
      },
      uploadedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      formType: 'Form 34B',
      fileName: 'KE-047-290-0001_Form34B.pdf',
      status: 'processing',
      uploadedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ])
  
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    // Simulate upload and processing
    const newUpload: FormUpload = {
      id: Date.now().toString(),
      formType: file.name.includes('34A') ? 'Form 34A' : file.name.includes('34B') ? 'Form 34B' : 'Unknown',
      fileName: file.name,
      status: 'processing',
      uploadedAt: new Date().toISOString()
    }
    
    setUploads(prev => [newUpload, ...prev])
    
    // Simulate processing time
    setTimeout(() => {
      setUploads(prev => prev.map(upload => 
        upload.id === newUpload.id 
          ? { 
              ...upload, 
              status: 'complete',
              extractedData: {
                mary_wambui: Math.floor(Math.random() * 300) + 100,
                john_kariuki: Math.floor(Math.random() * 200) + 50,
                total_votes: Math.floor(Math.random() * 500) + 200
              }
            }
          : upload
      ))
      setIsUploading(false)
    }, 3000)
  }

  const getStatusColor = (status: FormUpload['status']) => {
    switch (status) {
      case 'complete': return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'processing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: FormUpload['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Scan className="w-4 h-4 animate-spin" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Form 34A/B Upload</h2>
        
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-kura-accent bg-kura-accent/5' 
              : 'border-kura-border hover:border-kura-border/70'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <Scan className="w-12 h-12 text-kura-accent animate-spin" />
                <div>
                  <p className="text-white font-medium">Processing document...</p>
                  <p className="text-sm text-gray-400 mt-1">Scanning and extracting data</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Drop Form 34A/B here or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, PDF formats</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors"
                >
                  Select File
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Camera Capture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center p-4 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors">
            <Camera className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-white">Open Camera</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-kura-navy border border-kura-border rounded-lg hover:bg-kura-navy-mid transition-colors">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-white">Scan Document</span>
          </button>
        </div>
      </div>

      {/* Uploaded Forms */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Uploaded Forms</h3>
          <button className="flex items-center px-3 py-1 bg-kura-navy border border-kura-border text-white rounded hover:bg-kura-navy-mid transition-colors">
            <Download className="w-3 h-3 mr-1" />
            Export All
          </button>
        </div>
        
        <div className="space-y-4">
          {uploads.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-kura-navy rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{upload.fileName}</p>
                    <p className="text-sm text-gray-400">{upload.formType}</p>
                  </div>
                </div>
                
                <Badge variant="default" className={getStatusColor(upload.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(upload.status)}
                    <span className="text-xs capitalize">{upload.status}</span>
                  </div>
                </Badge>
              </div>

              {upload.extractedData && (
                <div className="mt-4 p-3 bg-kura-accent/10 border border-kura-accent/30 rounded">
                  <p className="text-xs text-kura-accent font-medium mb-2">Extracted Data:</p>
                  <div className="space-y-1">
                    {Object.entries(upload.extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-white font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-400">
                Uploaded {new Date(upload.uploadedAt).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Manual Entry */}
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manual Vote Entry</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Candidate Name</label>
              <input
                type="text"
                placeholder="Enter candidate name"
                className="w-full bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vote Count</label>
              <input
                type="number"
                placeholder="Enter vote count"
                className="w-full bg-kura-navy border border-kura-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-kura-accent"
              />
            </div>
          </div>
          
          <button className="px-4 py-2 bg-kura-accent hover:bg-kura-accent/80 text-white rounded-lg transition-colors">
            Add Vote Entry
          </button>
        </div>
      </div>
    </div>
  )
}
