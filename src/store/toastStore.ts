import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastState {
  isVisible: boolean
  message: string
  type: ToastType
  showToast: (type: ToastType, message: string) => void
  hideToast: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  type: 'info',
  showToast: (type, message) => {
    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    set({ isVisible: true, type, message })

    toastTimer = setTimeout(() => {
      set({ isVisible: false })
    }, 4000)
  },
  hideToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
    set({ isVisible: false })
  },
}))
