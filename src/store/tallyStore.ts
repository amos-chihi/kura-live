import { create } from 'zustand'
import { TallyEntry, ComparisonStats } from '@/lib/types'

interface TallyStore {
  tallies: TallyEntry[]
  extractedVotes: Array<{
    candidate_name: string
    votes: number
    confidence?: number
  }>
  comparisonStats: ComparisonStats | null
  isLoading: boolean
  
  // Actions
  setTallies: (tallies: TallyEntry[]) => void
  addTally: (tally: TallyEntry) => void
  updateTally: (id: string, updates: Partial<TallyEntry>) => void
  setExtractedVotes: (votes: Array<{ candidate_name: string; votes: number; confidence?: number }>) => void
  addExtractedVote: (vote: { candidate_name: string; votes: number; confidence?: number }) => void
  setComparisonStats: (stats: ComparisonStats) => void
  setLoading: (loading: boolean) => void
  resetTallies: () => void
}

export const useTallyStore = create<TallyStore>((set, get) => ({
  tallies: [],
  extractedVotes: [],
  comparisonStats: null,
  isLoading: false,

  setTallies: (tallies) => set({ tallies }),
  
  addTally: (tally) => set((state) => ({
    tallies: [...state.tallies, tally]
  })),
  
  updateTally: (id, updates) => set((state) => ({
    tallies: state.tallies.map(tally =>
      tally.id === id ? { ...tally, ...updates } : tally
    )
  })),
  
  setExtractedVotes: (votes) => set({ extractedVotes: votes }),
  
  addExtractedVote: (vote) => set((state) => ({
    extractedVotes: [...state.extractedVotes, vote]
  })),
  
  setComparisonStats: (stats) => set({ comparisonStats: stats }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  resetTallies: () => set({
    tallies: [],
    extractedVotes: [],
    comparisonStats: null
  })
}))
