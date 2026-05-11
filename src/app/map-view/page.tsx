'use client'

import Link from 'next/link'
import { ChevronLeft, MapIcon } from 'lucide-react'
import LiveMapPanel from '@/components/command/LiveMapPanel'

export default function MapViewPage() {
  return (
    <div className="min-h-screen bg-kura-bg p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-kura-border bg-kura-panel px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <MapIcon className="h-6 w-6 text-kura-cyan" />
              <h1 className="text-2xl font-bold text-white">National Map View</h1>
            </div>
            <p className="text-sm text-kura-muted">
              Full-screen geospatial monitoring for streams, reporting stations, and verification discrepancies.
            </p>
          </div>
          <Link href="/dashboard" className="ops-button-secondary inline-flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Command Centre
          </Link>
        </div>

        <LiveMapPanel fullPage />
      </div>
    </div>
  )
}
