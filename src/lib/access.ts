import { UserRole } from './session'

const AGENT_PATHS = ['/agent']
const ADMIN_PATHS = ['/admin', '/dashboard', '/agent-registration']
const SHARED_PATHS = ['/', '/dashboard', '/results', '/results-tally', '/map-view', '/stream-test']

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`)
}

export function getDefaultRouteForRole(role: UserRole): string {
  return role === 'admin' ? '/admin' : '/agent'
}

export function canRoleAccessPath(role: UserRole, pathname: string): boolean {
  const rolePaths = role === 'admin' ? ADMIN_PATHS : AGENT_PATHS
  return rolePaths.some((route) => matchesRoute(pathname, route)) || SHARED_PATHS.some((route) => matchesRoute(pathname, route))
}

export function resolveAuthorizedRoute(role: UserRole, requestedPath?: string | null): string {
  if (!requestedPath) {
    return getDefaultRouteForRole(role)
  }

  return canRoleAccessPath(role, requestedPath) ? requestedPath : getDefaultRouteForRole(role)
}
