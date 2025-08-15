// app/api/surveys/[id]/user-settings/route.ts
import { NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

initializeDatabase()

export async function GET(
  _req: Request,                                   // use the Web Request type
  { params }: { params: { id: string } }          // context with params
) {
  try {
    const surveyId = params.id

    const survey = await db.get(
      `SELECT user_id FROM surveys WHERE id = ?`,
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
        notificationSettings: { emailNotifications: true, webhookNotifications: false }
      })
    }

    const trackingSettings =
      settings.tracking_settings ? JSON.parse(settings.tracking_settings) : {}
    const notificationSettings =
      settings.notification_settings
        ? JSON.parse(settings.notification_settings)
        : { emailNotifications: true, webhookNotifications: false }

    return NextResponse.json({ trackingSettings, notificationSettings })
  } catch (err) {
    console.error('User settings fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}