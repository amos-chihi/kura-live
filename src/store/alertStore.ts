import { create } from 'zustand'
import { Alert } from '@/lib/types'

interface AlertStore {
  alerts: Alert[]
  unreadCount: number
  isLoading: boolean
  
  // Actions
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Alert) => void
  updateAlert: (id: string, updates: Partial<Alert>) => void
  dismissAlert: (id: string) => void
  escalateAlert: (id: string) => void
  setLoading: (loading: boolean) => void
  resetAlerts: () => void
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,

  setAlerts: (alerts) => {
    const openAlerts = alerts.filter(alert => alert.alert_status === 'open')
    set({ 
      alerts, 
      unreadCount: openAlerts.length 
    })
  },
  
  addAlert: (alert) => set((state) => {
    const newAlerts = [alert, ...state.alerts]
    const openAlerts = newAlerts.filter(a => a.alert_status === 'open')
    return {
      alerts: newAlerts,
      unreadCount: openAlerts.length
    }
  }),
  
  updateAlert: (id, updates) => set((state) => {
    const newAlerts = state.alerts.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    )
    const openAlerts = newAlerts.filter(a => a.alert_status === 'open')
    return {
      alerts: newAlerts,
      unreadCount: openAlerts.length
    }
  }),
  
  dismissAlert: (id) => get().updateAlert(id, { alert_status: 'dismissed' }),
  
  escalateAlert: (id) => get().updateAlert(id, { alert_status: 'escalated' }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  resetAlerts: () => set({
    alerts: [],
    unreadCount: 0
  })
}))
