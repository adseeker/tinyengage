// app/api/surveys/[id]/user-settings/route.ts
import { NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

initializeDatabase()

export async function GET(request: Request) {
  try {
    // /api/surveys/:id/user-settings
    const url = new URL(request.url)
    const m = url.pathname.match(/\/api\/surveys\/([^/]+)\/user-settings\/?$/)
    const surveyId = m?.[1]
    if (!surveyId) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    const survey = await db.get(
      'SELECT user_id FROM surveys WHERE id = ?',
      [surveyId]
    )
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const settings = await db.get(
      `SELECT tracking_settings, notification_settings
       FROM user_settings WHERE user_id = ?`,
      [survey.user_id]
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
  } catch (err) {
    console.error('User settings fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}