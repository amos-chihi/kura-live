import { Suspense } from 'react'
import AgentDashboardClient from '@/components/agent/AgentDashboardClient'

export default function AgentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kura-navy" />}>
      <AgentDashboardClient />
    </Suspense>
  )
}
