import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_TOKEN_COOKIE_NAME,
  createMockSession,
  serializeSession,
  SESSION_COOKIE_NAME,
} from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
      const response = NextResponse.json({ success: true, username })
      const session = createMockSession({
        id: 'admin-001',
        email: 'admin@kuralive.ke',
        role: 'admin',
      })
      
      // Set secure HTTP-only cookie
      response.cookies.set(ADMIN_TOKEN_COOKIE_NAME, 'mock-admin-token', {
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
      
      response.cookies.set('adminUser', username, {
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
