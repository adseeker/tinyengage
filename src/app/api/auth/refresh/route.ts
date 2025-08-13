import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, getUserById, generateTokens } from '@/lib/auth'
import { initializeDatabase } from '@/lib/db'

// Initialize database on cold start
initializeDatabase()

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    const user = getUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier
      },
      accessToken
    })

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}