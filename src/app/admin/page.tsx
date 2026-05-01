import { Suspense } from 'react'
import AdminPageClient from '@/components/admin/AdminPageClient'

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kura-navy" />}>
      <AdminPageClient />
    </Suspense>
  )
}
