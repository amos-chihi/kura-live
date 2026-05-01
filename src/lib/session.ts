export type UserRole = 'agent' | 'admin'

export interface MockSessionUser {
  id: string
  email: string
  role: UserRole
}

export interface MockSession {
  user: MockSessionUser
  expires_at: number
}

export const SESSION_COOKIE_NAME = 'kuraLiveSession'
export const AGENT_TOKEN_COOKIE_NAME = 'agentToken'
export const ADMIN_TOKEN_COOKIE_NAME = 'adminToken'

const SESSION_DURATION_MS = 60 * 60 * 1000

export function createMockSession(user: MockSessionUser): MockSession {
  return {
    user,
    expires_at: Date.now() + SESSION_DURATION_MS,
  }
}

export function serializeSession(session: MockSession): string {
  return encodeURIComponent(JSON.stringify(session))
}

export function parseSession(rawValue?: string | null): MockSession | null {
  if (!rawValue) {
    return null
  }

  try {
    const session = JSON.parse(decodeURIComponent(rawValue)) as MockSession
    if (!session?.user?.role || !session?.expires_at) {
      return null
    }

    if (session.expires_at <= Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export function getRoleTokenCookie(role: UserRole): typeof AGENT_TOKEN_COOKIE_NAME | typeof ADMIN_TOKEN_COOKIE_NAME {
  return role === 'admin' ? ADMIN_TOKEN_COOKIE_NAME : AGENT_TOKEN_COOKIE_NAME
}
