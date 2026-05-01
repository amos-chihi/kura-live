import { create } from 'zustand'
import { LiveStream } from '@/lib/types'

interface StreamStore {
  currentStream: LiveStream | null
  streams: LiveStream[]
  isLive: boolean
  startTime: Date | null
  elapsedTime: string
  isLoading: boolean
  
  // Actions
  setCurrentStream: (stream: LiveStream) => void
  setStreams: (streams: LiveStream[]) => void
  setIsLive: (isLive: boolean) => void
  setStartTime: (time: Date | null) => void
  updateElapsedTime: () => void
  setLoading: (loading: boolean) => void
  resetStream: () => void
}

export const useStreamStore = create<StreamStore>((set, get) => ({
  currentStream: null,
  streams: [],
  isLive: false,
  startTime: null,
  elapsedTime: '00:00:00',
  isLoading: false,

  setCurrentStream: (stream) => set({ currentStream: stream }),
  
  setStreams: (streams) => set({ streams }),
  
  setIsLive: (isLive) => set({ isLive }),
  
  setStartTime: (time) => set({ startTime: time }),
  
  updateElapsedTime: () => {
    const { startTime } = get()
    if (!startTime) return
    
    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    set({ elapsedTime: formatted })
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  resetStream: () => set({
    currentStream: null,
    isLive: false,
    startTime: null,
    elapsedTime: '00:00:00'
  })
}))
