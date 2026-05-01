import { NextRequest, NextResponse } from 'next/server'
import {
  AGENT_TOKEN_COOKIE_NAME,
  createMockSession,
  serializeSession,
  SESSION_COOKIE_NAME,
} from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { agentId, password } = await request.json()

    // Mock authentication
    if (agentId === 'AG-0001' && password === 'password123') {
      const response = NextResponse.json({ success: true, agentId })
      const session = createMockSession({
        id: 'agent-001',
        email: 'agent@kuralive.ke',
        role: 'agent',
      })
      
      // Set secure HTTP-only cookie
      response.cookies.set(AGENT_TOKEN_COOKIE_NAME, 'mock-agent-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/'
      })

      response.cookies.set(SESSION_COOKIE_NAME, serializeSession(session), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })
      
      response.cookies.set('agentId', agentId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
