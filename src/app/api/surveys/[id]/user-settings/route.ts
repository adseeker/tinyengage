// app/api/surveys/[id]/user-settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db, initializeDatabase } from '@/lib/database'

initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    // /api/surveys/:id/user-settings
    const url = new URL(request.url)
    const m = url.pathname.match(/\/api\/surveys\/([^/]+)\/user-settings\/?$/)
    const surveyId = m?.[1]
    if (!surveyId) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    // Check if this is an authenticated request (for dashboard use)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader?.startsWith('Bearer ')
    
    if (isAuthenticated && authHeader) {
      // Authenticated request - verify token and user ownership
      const token = authHeader.split(' ')[1]
      const payload = verifyAccessToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Verify survey belongs to authenticated user
      const survey = await db.get(
        'SELECT user_id FROM surveys WHERE id = ? AND user_id = ?',
        [surveyId, payload.userId]
      )
      if (!survey) {
        return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
      }

      const settings = await db.get(
        `SELECT tracking_settings, notification_settings
         FROM user_settings WHERE user_id = ?`,
        [payload.userId]
      )

      if (!settings) {
        return NextResponse.json({
          trackingSettings: {},
          notificationSettings: {
            emailNotifications: true,
            webhookNotifications: false,
          },
        })
      }

      const trackingSettings = settings.tracking_settings
        ? JSON.parse(settings.tracking_settings)
        : {}
      const notificationSettings = settings.notification_settings
        ? JSON.parse(settings.notification_settings)
        : {
            emailNotifications: true,
            webhookNotifications: false,
          }

      return NextResponse.json({ trackingSettings, notificationSettings })
    } else {
      // Public request (thank-you page) - only return tracking settings
      const survey = await db.get(
        'SELECT user_id FROM surveys WHERE id = ?',
        [surveyId]
      )
      if (!survey) {
        return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
      }

      const settings = await db.get(
        `SELECT tracking_settings FROM user_settings WHERE user_id = ?`,
        [survey.user_id]
      )

      const trackingSettings = settings?.tracking_settings
        ? JSON.parse(settings.tracking_settings)
        : {}

      // Only return tracking settings for public access (no notification settings)
      return NextResponse.json({ trackingSettings })
    }
  } catch (err) {
    console.error('User settings fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}