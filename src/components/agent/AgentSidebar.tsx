'use client'

import Link from 'next/link'
import { ClipboardCheck, Eye, FileBarChart2, Map, Video } from 'lucide-react'

interface AgentSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabs: Array<{
    id: string
    name: string
    icon: any
  }>
}

export default function AgentSidebar({ activeTab, setActiveTab, tabs }: AgentSidebarProps) {
  const portalLinks = [
    { name: 'Assigned Station', href: '/agent', icon: ClipboardCheck },
    { name: 'Public Results', href: '/results', icon: FileBarChart2 },
    { name: 'National Map', href: '/map-view', icon: Map },
    { name: 'Stream Test', href: '/stream-test', icon: Video },
  ]

  return (
    <div className="w-64 bg-kura-surface border-r border-kura-border min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Agent Portal</h2>
        <p className="text-xs text-gray-400 mb-6">Field operations, form capture, live transmission, and discrepancy alerts.</p>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-kura-accent text-white'
                    : 'text-gray-300 hover:text-white hover:bg-kura-navy-mid'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-3" />
                {tab.name}
              </button>
            )
          })}
        </nav>

        <div className="mt-8 border-t border-kura-border pt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Permitted Access</p>
          <div className="space-y-2">
            {portalLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-kura-navy-mid hover:text-white"
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="mt-4 rounded-lg border border-kura-border bg-kura-navy p-3 text-xs text-gray-400">
            <p className="text-white mb-1">Restricted Rights</p>
            <p>Agents cannot access command-center operations, agent approval, or administrative communications controls.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
