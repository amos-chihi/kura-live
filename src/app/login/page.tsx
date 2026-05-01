import { Suspense } from 'react'
import LoginPageClient from '@/components/auth/LoginPageClient'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kura-navy" />}>
      <LoginPageClient />
    </Suspense>
  )
}
