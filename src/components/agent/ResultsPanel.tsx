'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Eye, FileText, Loader2, Upload } from 'lucide-react'

import Badge from '@/components/ui/Badge'
import { Agent, Alert, FormUpload, TallyEntry } from '@/lib/types'
import { useAlertStore } from '@/store/alertStore'
import { useTallyStore } from '@/store/tallyStore'
import { useToastStore } from '@/store/toastStore'

interface DemoFormSample {
  id: string
  label: string
  preview_path: string
}

interface ResultsPanelProps {
  agent: Agent | null
  demoFormSamples: DemoFormSample[]
}

interface FormProcessResponse {
  upload: FormUpload
}

interface IebcResponse {
  iebc: {
    station_code: string
    last_updated: string
    source: string
    results: Array<{ candidate_name: string; party: string | null; votes: number }>
  }
}

const FALLBACK_FORM_SAMPLES: DemoFormSample[] = [
  {
    id: 'form-westlands-a',
    label: 'Form 34A - Station copy A',
    preview_path: '/demo/forms/KE-047-290-0001-form34a-a.svg',
  },
  {
    id: 'form-westlands-b',
    label: 'Form 34A - Station copy B',
    preview_path: '/demo/forms/KE-047-290-0001-form34a-b.svg',
  },
  {
    id: 'form-westlands-c',
    label: 'Form 34A - Station copy C',
    preview_path: '/demo/forms/KE-047-290-0001-form34a-c.svg',
  },
]

async function fetchTallies(stationCode: string) {
  const response = await fetch(`/api/tallies?station_code=${encodeURIComponent(stationCode)}`)
  const payload = (await response.json()) as { data: TallyEntry[] | null; error: string | null }
  if (!response.ok || payload.error || !payload.data) {
    throw new Error(payload.error ?? 'Failed to refresh tally data')
  }
  return payload.data
}

async function fetchAlerts(stationCode: string) {
  const response = await fetch(`/api/alerts?station_code=${encodeURIComponent(stationCode)}`)
  const payload = (await response.json()) as { data: Alert[] | null; error: string | null }
  if (!response.ok || payload.error || !payload.data) {
    throw new Error(payload.error ?? 'Failed to refresh alert data')
  }
  return payload.data
}

export function ResultsPanel({ agent, demoFormSamples }: ResultsPanelProps) {
  const stationCode = agent?.station_code ?? 'KE-047-290-0001'
  const agentId = agent?.id ?? 'agent-001'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [availableSamples, setAvailableSamples] = useState<DemoFormSample[]>(
    demoFormSamples.length > 0 ? demoFormSamples : FALLBACK_FORM_SAMPLES
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSampleId, setSelectedSampleId] = useState<string>(demoFormSamples[0]?.id ?? '')
  const [processedUpload, setProcessedUpload] = useState<FormUpload | null>(null)
  const [iebcPayload, setIebcPayload] = useState<IebcResponse['iebc'] | null>(null)
  const [isProcessingForm, setIsProcessingForm] = useState(false)
  const [isFetchingIebc, setIsFetchingIebc] = useState(false)

  const setTallies = useTallyStore((state) => state.setTallies)
  const setAlerts = useAlertStore((state) => state.setAlerts)
  const showToast = useToastStore((state) => state.showToast)

  const selectedSample = useMemo(
    () => availableSamples.find((sample) => sample.id === selectedSampleId) ?? availableSamples[0],
    [availableSamples, selectedSampleId]
  )

  useEffect(() => {
    if (demoFormSamples.length > 0) {
      setAvailableSamples(demoFormSamples)
    }
  }, [demoFormSamples])

  useEffect(() => {
    if (!selectedSampleId && availableSamples[0]) {
      setSelectedSampleId(availableSamples[0].id)
    }
  }, [availableSamples, selectedSampleId])

  const syncStores = async () => {
    const [tallies, alerts] = await Promise.all([
      fetchTallies(stationCode),
      fetchAlerts(stationCode),
    ])
    setTallies(tallies)
    setAlerts(alerts)
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const processForm = async (sampleId: string, file: File | null) => {
    setIsProcessingForm(true)

    try {
      const formData = new FormData()
      formData.append('station_code', stationCode)
      formData.append('agent_id', agentId)
      formData.append('sample_id', sampleId)
      if (file) {
        formData.append('file', file, file.name)
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as { data: FormProcessResponse | null; error: string | null }
      if (!response.ok || payload.error || !payload.data) {
        throw new Error(payload.error ?? 'Form processing failed')
      }

      setProcessedUpload(payload.data.upload)
      await syncStores()
      showToast('success', 'Form 34A OCR demo extraction completed.')
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to process the selected form.')
    } finally {
      setIsProcessingForm(false)
    }
  }

  const fetchIebcData = async () => {
    setIsFetchingIebc(true)

    try {
      const response = await fetch(`/api/iebc/${encodeURIComponent(stationCode)}?persist=true`)
      const payload = (await response.json()) as { data: IebcResponse | null; error: string | null }
      if (!response.ok || payload.error || !payload.data) {
        throw new Error(payload.error ?? 'IEBC sync failed')
      }

      setIebcPayload(payload.data.iebc)
      await syncStores()
      showToast('success', 'Official IEBC demo tallies synced for comparison.')
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to fetch IEBC demo tallies.')
    } finally {
      setIsFetchingIebc(false)
    }
  }

  const extractedResults = (processedUpload?.extracted_data as
    | {
        results?: Array<{ candidate_name: string; party?: string | null; votes: number }>
        total_valid_votes?: number
        total_rejected_votes?: number
      }
    | null) ?? null

  return (
    <div className="space-y-6">
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-kura-accent" />
              Form 34A OCR + IEBC Sync
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Upload a signed Form 34A sample, extract candidate tallies, then pull the official IEBC feed for side-by-side verification.
            </p>
          </div>
          <Badge variant="info">Station {stationCode}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <h3 className="text-white font-medium mb-3">Bundled Form 34A Samples</h3>
              <div className="space-y-3">
                {availableSamples.map((sample) => (
                  <div
                    key={sample.id}
                    className={`rounded-lg border p-4 ${
                      selectedSampleId === sample.id ? 'border-kura-accent bg-kura-accent/10' : 'border-kura-border bg-kura-surface'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-medium text-white">{sample.label}</div>
                        <Link
                          href={sample.preview_path}
                          target="_blank"
                          className="mt-2 inline-flex items-center text-sm text-kura-accent hover:text-kura-accent/80"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Open bundled preview
                        </Link>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSampleId(sample.id)
                          setSelectedFile(null)
                        }}
                        className="rounded-lg border border-kura-border px-4 py-2 text-sm text-white hover:bg-kura-navy-mid"
                      >
                        Select sample
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => void processForm(selectedSample?.id ?? demoFormSamples[0]?.id ?? '', null)}
                disabled={isProcessingForm || !selectedSample}
                className="mt-4 w-full rounded-lg bg-kura-accent px-4 py-3 text-white transition-colors hover:bg-kura-accent/80 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isProcessingForm && !selectedFile ? 'Running OCR demo...' : 'Process selected sample'}
              </button>
            </div>

            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <h3 className="text-white font-medium mb-3">Upload a Form File</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="rounded-lg border border-dashed border-kura-border p-6 text-center">
                <Upload className="mx-auto mb-3 h-10 w-10 text-kura-accent" />
                {selectedFile ? (
                  <>
                    <div className="text-white font-medium">{selectedFile.name}</div>
                    <div className="mt-1 text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-medium">Choose a JPG, PNG, or PDF form file</div>
                    <div className="mt-1 text-sm text-gray-400">For the MVP demo, the OCR route maps the file to the closest bundled extraction profile.</div>
                  </>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-lg border border-kura-border px-4 py-3 text-white hover:bg-kura-navy-mid"
                >
                  Choose file
                </button>
                <button
                  onClick={() => void processForm(selectedSampleId, selectedFile)}
                  disabled={isProcessingForm || !selectedFile}
                  className="flex-1 rounded-lg bg-kura-navy-mid px-4 py-3 text-white transition-colors hover:bg-kura-navy-mid/80 disabled:cursor-not-allowed disabled:bg-gray-700"
                >
                  {isProcessingForm && selectedFile ? (
                    <span className="inline-flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload + extract'
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Official IEBC Source</h3>
                <button
                  onClick={fetchIebcData}
                  disabled={isFetchingIebc}
                  className="rounded-lg bg-kura-navy-mid px-4 py-2 text-sm text-white hover:bg-kura-navy-mid/80 disabled:cursor-not-allowed disabled:bg-gray-700"
                >
                  {isFetchingIebc ? (
                    <span className="inline-flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Fetch IEBC tallies
                    </span>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Pull the official mock results feed for this polling station and inject it into the comparison matrix.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <h3 className="text-lg font-semibold text-white mb-4">OCR Extraction Result</h3>
              {processedUpload && extractedResults?.results ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-kura-surface p-4 text-sm text-gray-300">
                    <div className="text-white font-medium mb-1">{processedUpload.file_path}</div>
                    <div>Scan status: <span className="text-kura-accent">{processedUpload.scan_status}</span></div>
                  </div>
                  <div className="space-y-2">
                    {extractedResults.results.map((result) => (
                      <div key={result.candidate_name} className="flex items-center justify-between rounded-lg bg-kura-surface px-4 py-3">
                        <div>
                          <div className="text-white font-medium">{result.candidate_name}</div>
                          <div className="text-xs text-gray-400">{result.party ?? 'Independent / unspecified'}</div>
                        </div>
                        <div className="font-mono text-kura-accent">{result.votes.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-kura-surface p-4 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Total valid votes</span>
                      <span className="text-white">{extractedResults.total_valid_votes?.toLocaleString() ?? '—'}</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span>Total rejected votes</span>
                      <span className="text-white">{extractedResults.total_rejected_votes?.toLocaleString() ?? '—'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[15rem] items-center justify-center rounded-lg border border-dashed border-kura-border text-center text-gray-400">
                  Process a form sample to view the extracted results here.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Latest IEBC Feed</h3>
              {iebcPayload ? (
                <div className="space-y-2">
                  {iebcPayload.results.map((result) => (
                    <div key={result.candidate_name} className="flex items-center justify-between rounded-lg bg-kura-surface px-4 py-3">
                      <span className="text-white">{result.candidate_name}</span>
                      <span className="font-mono text-kura-accent">{result.votes.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-gray-400">
                    Source: {iebcPayload.source} · Updated {new Date(iebcPayload.last_updated).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Fetch the IEBC demo tallies to populate the official source column.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPanel
