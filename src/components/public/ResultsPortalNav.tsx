'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Map, Search, ShieldCheck, Waves } from 'lucide-react'

const navItems = [
  { name: 'Live Results', href: '/results', icon: Waves, description: 'National public dashboard' },
  { name: 'Tally Board', href: '/results-tally', icon: BarChart3, description: 'Seat-by-seat aggregated tallies' },
  { name: 'Geo Monitor', href: '/map-view', icon: Map, description: 'County and station coverage view' },
]

export function ResultsPortalNav() {
  const pathname = usePathname()

  return (
    <div className="rounded-2xl border border-kura-border bg-kura-surface/80 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-kura-accent">Public Intelligence Portal</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Results, coverage, and verification modules</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center rounded-full border border-kura-border bg-kura-navy px-3 py-2 text-xs text-gray-300">
            <Search className="mr-2 h-3.5 w-3.5" />
            Station lookup
          </div>
          <div className="inline-flex items-center rounded-full border border-kura-border bg-kura-navy px-3 py-2 text-xs text-gray-300">
            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
            Verification pulse
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl border p-4 transition-colors ${
                isActive
                  ? 'border-kura-accent bg-kura-accent/10'
                  : 'border-kura-border bg-kura-navy hover:border-kura-accent/50 hover:bg-kura-navy-mid'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${isActive ? 'text-kura-accent' : 'text-gray-300'}`} />
                <span className={`text-[10px] uppercase tracking-[0.2em] ${isActive ? 'text-kura-accent' : 'text-gray-500'}`}>
                  Module
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs text-gray-400">{item.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
