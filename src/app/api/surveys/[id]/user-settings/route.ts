import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

// Initialize database on cold start
initializeDatabase()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id

    // Get the user ID from the survey (no auth needed for thank you pages)
    const survey = await db.get(`
      SELECT user_id FROM surveys WHERE id = ?
    `, [surveyId])

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Get user settings for the survey owner
    const settings = await db.get(`
      SELECT 
        tracking_settings,
        notification_settings
      FROM user_settings 
      WHERE user_id = ?
    `, [survey.user_id])

    if (!settings) {
      // Return default empty settings if none exist
      return NextResponse.json({
        trackingSettings: {},
        notificationSettings: {
          emailNotifications: true,
          webhookNotifications: false
        }
      })
    }

    // Parse JSON settings
    const trackingSettings = settings.tracking_settings ? JSON.parse(settings.tracking_settings) : {}
    const notificationSettings = settings.notification_settings ? JSON.parse(settings.notification_settings) : {
      emailNotifications: true,
      webhookNotifications: false
    }

    return NextResponse.json({
      trackingSettings,
      notificationSettings
    })

  } catch (error) {
    console.error('User settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}