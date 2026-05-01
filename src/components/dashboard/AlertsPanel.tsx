'use client'

import { useEffect } from 'react'
import { useAlertStore } from '@/store/alertStore'
import AlertCard from '@/components/ui/AlertCard'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { AlertTriangle, Bell, BellOff, CheckCircle } from 'lucide-react'

export function AlertsPanel() {
  const { alerts, unreadCount, isLoading, setAlerts, dismissAlert, escalateAlert, setLoading } = useAlertStore()

  useEffect(() => {
    // Load initial alerts
    const loadAlerts = async () => {
      setLoading(true)
      try {
        // In production, this would fetch from API
        // For demo, we'll use mock data
        const mockAlerts = [
          {
            id: 'alert-001',
            station_code: 'KE-047-290-0001',
            agent_id: 'agent-001',
            candidate_name: 'Mary Wambui',
            delta: 1,
            audio_votes: 12891,
            form34a_votes: 12892,
            iebc_votes: 12891,
            severity: 'warning' as const,
            alert_status: 'open' as const,
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
          },
          {
            id: 'alert-002',
            station_code: 'KE-047-290-0001',
            agent_id: 'agent-001',
            candidate_name: 'Grace Akinyi',
            delta: 1,
            audio_votes: 3210,
            form34a_votes: 3210,
            iebc_votes: 3211,
            severity: 'warning' as const,
            alert_status: 'open' as const,
            created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
          }
        ]
        setAlerts(mockAlerts)
      } catch (error) {
        console.error('Failed to load alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [setAlerts, setLoading])

  const handleEscalate = async (alertId: string) => {
    try {
      // In production, this would call the API
      // For demo, we'll just update the local state
      escalateAlert(alertId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to escalate alert:', error)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      // In production, this would call the API
      // For demo, we'll just update the local state
      dismissAlert(alertId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }

  const openAlerts = alerts.filter(alert => alert.alert_status === 'open')
  const escalatedAlerts = alerts.filter(alert => alert.alert_status === 'escalated')

  return (
    <div className="bg-kura-surface border border-kura-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-kura-accent2" />
          Real-time Alerts
          {unreadCount > 0 && (
            <Badge variant="error" className="ml-3">
              {unreadCount} Active
            </Badge>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-kura-accent" />
          <span className="text-sm text-gray-400">Live Monitoring</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open Alerts */}
          {openAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Bell className="w-4 h-4 mr-2 text-kura-accent2" />
                Open Alerts ({openAlerts.length})
              </h3>
              <div className="space-y-4">
                {openAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEscalate={() => handleEscalate(alert.id)}
                    onDismiss={() => handleDismiss(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Escalated Alerts */}
          {escalatedAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-kura-amber" />
                Escalated Alerts ({escalatedAlerts.length})
              </h3>
              <div className="space-y-4">
                {escalatedAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEscalate={() => handleEscalate(alert.id)}
                    onDismiss={() => handleDismiss(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {alerts.length === 0 && (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No alerts at this time</p>
              <p className="text-sm text-gray-500">
                Alerts will appear here when discrepancies are detected
              </p>
            </div>
          )}

          {/* No Open Alerts */}
          {alerts.length > 0 && openAlerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-kura-green mx-auto mb-3" />
              <p className="text-gray-400">
                All alerts have been resolved
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
