import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_TOKEN_COOKIE_NAME,
  AGENT_TOKEN_COOKIE_NAME,
  parseSession,
  SESSION_COOKIE_NAME,
} from '@/lib/session'
import { canRoleAccessPath, getDefaultRouteForRole } from '@/lib/access'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  const matchesRouteGroup = (path: string, route: string) =>
    path === route || path.startsWith(`${route}/`)

  // Protected routes
  const agentRoutes = ['/agent']
  const adminRoutes = ['/admin']
  const dashboardRoutes = ['/dashboard']

  const isAgentRoute = agentRoutes.some(route =>
    matchesRouteGroup(pathname, route)
  )
  const isAdminRoute = adminRoutes.some(route =>
    matchesRouteGroup(pathname, route)
  )
  const isDashboardRoute = dashboardRoutes.some(route =>
    matchesRouteGroup(pathname, route)
  )

  // Check authentication tokens
  const agentToken = req.cookies.get(AGENT_TOKEN_COOKIE_NAME)
  const adminToken = req.cookies.get(ADMIN_TOKEN_COOKIE_NAME)
  const session = parseSession(req.cookies.get(SESSION_COOKIE_NAME)?.value)
  const sessionRole = session?.user.role
  const hasAgentAccess = Boolean(agentToken) || sessionRole === 'agent'
  const hasAdminAccess = Boolean(adminToken) || sessionRole === 'admin'
  const hasDashboardAccess = hasAgentAccess || hasAdminAccess

  if (sessionRole && !canRoleAccessPath(sessionRole, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(sessionRole), req.url))
  }

  // Protect agent routes
  if (isAgentRoute && !hasAgentAccess) {
    const loginUrl = new URL('/agent-login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes
  if (isAdminRoute && !hasAdminAccess) {
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login pages
  if (hasAgentAccess && req.nextUrl.pathname === '/agent-login') {
    return NextResponse.redirect(new URL('/agent', req.url))
  }
  
  if (hasAdminAccess && req.nextUrl.pathname === '/admin-login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // For dashboard routes, check either agent or admin token
  if (isDashboardRoute && !hasDashboardAccess) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionRole && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(sessionRole), req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next|favicon.ico|public).*)',
  ],
}
