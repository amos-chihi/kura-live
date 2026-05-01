import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_TOKEN_COOKIE_NAME, AGENT_TOKEN_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json()

    const response = NextResponse.json({ success: true })
    
    // Clear authentication cookies
    if (userType === 'agent') {
      response.cookies.set(AGENT_TOKEN_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      response.cookies.set('agentId', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
    } else if (userType === 'admin') {
      response.cookies.set(ADMIN_TOKEN_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      response.cookies.set('adminUser', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
    }

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
