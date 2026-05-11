'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, ExternalLink, FileAudio, Loader2, Mic, Radio, Square, Upload } from 'lucide-react'

import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Agent, Alert, TallyEntry } from '@/lib/types'
import { useAlertStore } from '@/store/alertStore'
import { useTallyStore } from '@/store/tallyStore'
import { useToastStore } from '@/store/toastStore'

interface DemoAudioSample {
  id: string
  label: string
  description: string
}

interface TranscriptionPanelProps {
  agent: Agent | null
  demoAudioSamples: DemoAudioSample[]
}

interface TranscriptionResponse {
  transcript_text: string
  extracted_votes: Array<{ candidate_name: string; votes: number; confidence?: number }>
  tally_entries: TallyEntry[]
}

interface LiveTranscriptionResponse {
  transcript_text: string
  merged_transcript: string
  extracted_votes: Array<{ candidate_name: string; votes: number; confidence?: number }>
}

interface RegisteredStream {
  id: string
  agent_id: string
  station_code: string | null
  status: 'scheduled' | 'live' | 'paused' | 'ended' | 'offline'
  viewer_count: number
}

const FALLBACK_AUDIO_SAMPLES: DemoAudioSample[] = [
  {
    id: 'audio-westlands-official',
    label: 'Westlands RO final announcement',
    description: 'Clean recorded announcement with a one-vote discrepancy across sources.',
  },
  {
    id: 'audio-westlands-ward-recap',
    label: 'Ward verification recap',
    description: 'Short ward-level recap with a larger Mary Wambui variance for demo alerting.',
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

export function TranscriptionPanel({ agent, demoAudioSamples }: TranscriptionPanelProps) {
  const stationCode = agent?.station_code ?? 'KE-047-290-0001'
  const agentId = agent?.id ?? 'agent-001'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const liveCaptureStreamRef = useRef<MediaStream | null>(null)
  const liveChunkCounterRef = useRef(0)
  const liveChunkStartRef = useRef(0)
  const [availableSamples, setAvailableSamples] = useState<DemoAudioSample[]>(
    demoAudioSamples.length > 0 ? demoAudioSamples : FALLBACK_AUDIO_SAMPLES
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeSampleId, setActiveSampleId] = useState<string>(demoAudioSamples[0]?.id ?? '')
  const [liveStreamUrl, setLiveStreamUrl] = useState(agent?.tiktok_url ?? agent?.youtube_url ?? '')
  const [transcriptText, setTranscriptText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCapturingLiveAudio, setIsCapturingLiveAudio] = useState(false)
  const [liveCaptureLabel, setLiveCaptureLabel] = useState('No live capture in progress')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [liveChunksProcessed, setLiveChunksProcessed] = useState(0)

  const setTallies = useTallyStore((state) => state.setTallies)
  const setExtractedVotes = useTallyStore((state) => state.setExtractedVotes)
  const extractedVotes = useTallyStore((state) => state.extractedVotes)
  const setAlerts = useAlertStore((state) => state.setAlerts)
  const showToast = useToastStore((state) => state.showToast)

  const selectedSample = useMemo(
    () => availableSamples.find((sample) => sample.id === activeSampleId) ?? availableSamples[0],
    [activeSampleId, availableSamples]
  )

  useEffect(() => {
    if (demoAudioSamples.length > 0) {
      setAvailableSamples(demoAudioSamples)
    }
  }, [demoAudioSamples])

  useEffect(() => {
    setLiveStreamUrl(agent?.tiktok_url ?? agent?.youtube_url ?? '')
  }, [agent?.tiktok_url, agent?.youtube_url])

  useEffect(() => {
    if (!activeSampleId && availableSamples[0]) {
      setActiveSampleId(availableSamples[0].id)
    }
  }, [activeSampleId, availableSamples])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      liveCaptureStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const syncStores = async () => {
    const [tallies, alerts] = await Promise.all([
      fetchTallies(stationCode),
      fetchAlerts(stationCode),
    ])

    setTallies(tallies)
    setAlerts(alerts)
  }

  const handleAudioFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const openTikTokFeed = () => {
    if (!liveStreamUrl) {
      showToast('error', 'Enter a TikTok or YouTube live URL first.')
      return
    }

    window.open(liveStreamUrl, '_blank', 'noopener,noreferrer')
  }

  const stopLiveCaptureTracks = () => {
    liveCaptureStreamRef.current?.getTracks().forEach((track) => track.stop())
    liveCaptureStreamRef.current = null
  }

  const syncLiveStreamStatus = async (sessionId: string, status: RegisteredStream['status']) => {
    await fetch('/api/streams', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        status,
      }),
    }).catch(() => undefined)
  }

  const uploadLiveChunk = async (audioBlob: Blob, startedAt: number, endedAt: number) => {
    const sessionId = activeSessionId
    if (!sessionId) {
      return
    }

    const chunkIndex = liveChunkCounterRef.current
    liveChunkCounterRef.current += 1

    const formData = new FormData()
    formData.append('station_code', stationCode)
    formData.append('agent_id', agentId)
    formData.append('session_id', sessionId)
    formData.append('chunk_index', chunkIndex.toString())
    formData.append('started_at', startedAt.toString())
    formData.append('ended_at', endedAt.toString())
    formData.append('sample_id', activeSampleId || availableSamples[0]?.id || FALLBACK_AUDIO_SAMPLES[0].id)
    formData.append('audio', new File([audioBlob], `live-chunk-${chunkIndex}.webm`, { type: audioBlob.type || 'audio/webm' }))

    const response = await fetch('/api/transcription/live', {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as { data: LiveTranscriptionResponse | null; error: string | null }
    if (!response.ok || payload.error || !payload.data) {
      throw new Error(payload.error ?? 'Unable to transcribe the live audio chunk')
    }

    setTranscriptText(payload.data.merged_transcript)
    setExtractedVotes(payload.data.extracted_votes)
    setLiveChunksProcessed((current) => current + 1)
    await syncStores()
  }

  const startLiveCapture = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      showToast('error', 'This browser does not support tab audio capture for the live TikTok demo.')
      return
    }

    try {
      const streamResponse = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          station_code: stationCode,
          source_url: liveStreamUrl,
        }),
      })
      const streamPayload = (await streamResponse.json()) as { data: RegisteredStream | null; error: string | null }
      if (!streamResponse.ok || streamPayload.error || !streamPayload.data) {
        throw new Error(streamPayload.error ?? 'Unable to register the live stream session')
      }

      const sessionId = streamPayload.data.id
      setActiveSessionId(sessionId)
      liveChunkCounterRef.current = 0
      const liveStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      const hasAudioTrack = liveStream.getAudioTracks().length > 0

      if (!hasAudioTrack) {
        liveStream.getTracks().forEach((track) => track.stop())
        throw new Error('Share the TikTok tab with audio enabled so the system can capture the announcement.')
      }

      liveCaptureStreamRef.current = liveStream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(liveStream, { mimeType })
      mediaRecorderRef.current = recorder
      liveChunkStartRef.current = Date.now()

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          const chunkEndedAt = Date.now()
          const chunkStartedAt = liveChunkStartRef.current
          liveChunkStartRef.current = chunkEndedAt
          void uploadLiveChunk(event.data, chunkStartedAt, chunkEndedAt).catch((error) => {
            showToast('error', error instanceof Error ? error.message : 'Live transcription chunk failed.')
          })
        }
      })

      recorder.addEventListener('stop', async () => {
        stopLiveCaptureTracks()
        setIsCapturingLiveAudio(false)
        setLiveCaptureLabel('Live monitoring stopped')
        await syncLiveStreamStatus(sessionId, 'ended')
        setActiveSessionId(null)
      })

      liveStream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (recorder.state !== 'inactive') {
            recorder.stop()
          }
        })
      })

      recorder.start(8000)
      setIsCapturingLiveAudio(true)
      setLiveChunksProcessed(0)
      setLiveCaptureLabel('Live monitoring active: chunks are being sent every 8 seconds')
      showToast('success', 'Tab capture started. Keep the live stream tab open while KURA LIVE processes live transcript updates.')
    } catch (error) {
      stopLiveCaptureTracks()
      setIsCapturingLiveAudio(false)
      setActiveSessionId(null)
      showToast(
        'error',
        error instanceof Error ? error.message : 'Unable to start the live TikTok audio capture.'
      )
    }
  }

  const stopLiveCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setLiveCaptureLabel('Finalizing live audio capture...')
      mediaRecorderRef.current.stop()
      return
    }

    stopLiveCaptureTracks()
    setIsCapturingLiveAudio(false)
  }

  const submitForTranscription = async (sampleId: string, file: File | null) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('station_code', stationCode)
      formData.append('agent_id', agentId)
      formData.append('sample_id', sampleId)

      if (file) {
        formData.append('audio', file, file.name)
      }

      const response = await fetch('/api/transcription', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as { data: TranscriptionResponse | null; error: string | null }

      if (!response.ok || payload.error || !payload.data) {
        throw new Error(payload.error ?? 'The audio transcription request failed')
      }

      setTranscriptText(payload.data.transcript_text)
      setExtractedVotes(payload.data.extracted_votes)
      await syncStores()
      showToast('success', 'Audio transcription completed and vote tallies were updated.')
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to process the audio sample.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Mic className="w-5 h-5 mr-2 text-kura-accent" />
              Live Stream Transcription
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Upload a recorded TikTok or YouTube audio clip for demo verification, or use the bundled sample announcements below.
            </p>
          </div>
          <Badge variant="info">{process.env.NEXT_PUBLIC_APP_URL ? 'Demo-ready pipeline' : 'Demo mode'}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Live TikTok / YouTube Demo</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Open a TikTok or YouTube live, share that tab with audio, and send the recorded announcement into the verification flow.
                  </p>
                </div>
                <Badge variant="info">Live capture</Badge>
              </div>
              <div className="space-y-3">
                <input
                  type="url"
                  value={liveStreamUrl}
                  onChange={(event) => setLiveStreamUrl(event.target.value)}
                  placeholder="https://www.tiktok.com/@username/live or https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-kura-border bg-kura-surface px-3 py-2 text-white placeholder-gray-500 focus:border-kura-accent focus:outline-none"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {agent?.tiktok_url ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLiveStreamUrl(agent.tiktok_url ?? '')
                        window.open(agent.tiktok_url ?? '', '_blank', 'noopener,noreferrer')
                      }}
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-kura-border bg-kura-surface px-4 py-3 text-white transition-colors hover:bg-kura-navy-mid"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open agent TikTok
                    </button>
                  ) : null}
                  {agent?.youtube_url ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLiveStreamUrl(agent.youtube_url ?? '')
                        window.open(agent.youtube_url ?? '', '_blank', 'noopener,noreferrer')
                      }}
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-kura-border bg-kura-surface px-4 py-3 text-white transition-colors hover:bg-kura-navy-mid"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open agent YouTube
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={openTikTokFeed}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-kura-border bg-kura-surface px-4 py-3 text-white transition-colors hover:bg-kura-navy-mid"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open typed live URL
                  </button>
                  {!isCapturingLiveAudio ? (
                    <button
                      type="button"
                      onClick={() => void startLiveCapture()}
                      disabled={isSubmitting}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-kura-accent px-4 py-3 text-white transition-colors hover:bg-kura-accent/80 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      <Radio className="mr-2 h-4 w-4" />
                      Start live capture
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopLiveCapture}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-500"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop and transcribe
                    </button>
                  )}
                </div>
                <div className="rounded-lg border border-dashed border-kura-border px-4 py-3 text-sm text-gray-400">
                  {liveCaptureLabel}
                  {isCapturingLiveAudio ? ` · ${liveChunksProcessed} chunk(s) processed` : ''}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Bundled Demo Audio</h3>
                <span className="text-xs text-kura-accent">Whisper-ready demo samples</span>
              </div>
              <div className="space-y-3">
                {availableSamples.map((sample) => (
                  <button
                    key={sample.id}
                      onClick={() => {
                        setActiveSampleId(sample.id)
                        setSelectedFile(null)
                      }}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      activeSampleId === sample.id
                        ? 'border-kura-accent bg-kura-accent/10'
                        : 'border-kura-border bg-kura-surface hover:bg-kura-navy-mid'
                    }`}
                  >
                    <div className="text-white font-medium">{sample.label}</div>
                    <div className="mt-1 text-sm text-gray-400">{sample.description}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => void submitForTranscription(selectedSample?.id ?? demoAudioSamples[0]?.id ?? '', null)}
                disabled={isSubmitting || !selectedSample}
                className="mt-4 w-full flex items-center justify-center rounded-lg bg-kura-accent px-4 py-3 text-white transition-colors hover:bg-kura-accent/80 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {isSubmitting && !selectedFile ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing sample...</span>
                  </>
                ) : (
                  <>
                    <AudioLines className="w-4 h-4 mr-2" />
                    Run bundled sample
                  </>
                )}
              </button>
            </div>

            <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Upload Recorded Audio</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-kura-accent hover:text-kura-accent/80"
                >
                  Choose file
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleAudioFileSelect}
                className="hidden"
              />
              <div className="rounded-lg border border-dashed border-kura-border p-6 text-center">
                <FileAudio className="mx-auto mb-3 h-10 w-10 text-kura-accent" />
                {selectedFile ? (
                  <>
                    <div className="text-white font-medium">{selectedFile.name}</div>
                    <div className="mt-1 text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-medium">Upload a prerecorded audio or screen recording file</div>
                    <div className="mt-1 text-sm text-gray-400">If `OPENAI_API_KEY` is configured, Whisper will transcribe it. Otherwise the panel falls back to the matching demo script.</div>
                  </>
                )}
              </div>
              <button
                onClick={() => void submitForTranscription(activeSampleId, selectedFile)}
                disabled={isSubmitting || !selectedFile}
                className="mt-4 w-full flex items-center justify-center rounded-lg bg-kura-navy-mid px-4 py-3 text-white transition-colors hover:bg-kura-navy-mid/80 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                {isSubmitting && selectedFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2">Uploading audio...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Transcribe uploaded file
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-kura-border bg-kura-navy p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Transcribed Output</h3>
            {transcriptText ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-kura-surface p-4 text-sm leading-7 text-gray-300 whitespace-pre-wrap">
                  {transcriptText}
                </div>
                <div className="rounded-lg border border-kura-border bg-kura-surface p-4">
                  <div className="text-sm font-medium text-white mb-3">Extracted Vote Counts</div>
                  {extractedVotes.length > 0 ? (
                    <div className="space-y-2">
                      {extractedVotes.map((vote) => (
                        <div key={vote.candidate_name} className="flex items-center justify-between rounded-md bg-kura-navy px-3 py-2">
                          <span className="text-white">{vote.candidate_name}</span>
                          <span className="font-mono text-kura-accent">{vote.votes.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No candidate totals were extracted from this transcript.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[18rem] items-center justify-center rounded-lg border border-dashed border-kura-border text-center text-gray-400">
                Run a demo sample or upload a recording to see the transcript and extracted tallies here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranscriptionPanel
