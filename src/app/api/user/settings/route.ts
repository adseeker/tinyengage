import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db, initializeDatabase } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { UserSettings } from '@/types'

// Initialize database on cold start
initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user settings
    const settings = await db.get(`
      SELECT 
        id,
        user_id,
        tracking_settings,
        notification_settings,
        created_at,
        updated_at
      FROM user_settings 
      WHERE user_id = ?
    `, [payload.userId])

    if (!settings) {
      // Return default settings if none exist
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
      id: settings.id,
      userId: settings.user_id,
      trackingSettings,
      notificationSettings,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { trackingSettings, notificationSettings } = body

    // Check if settings exist
    const existingSettings = await db.get(`
      SELECT id FROM user_settings WHERE user_id = ?
    `, [payload.userId])

    const now = new Date().toISOString()

    if (existingSettings) {
      // Update existing settings
      await db.run(`
        UPDATE user_settings 
        SET 
          tracking_settings = ?,
          notification_settings = ?,
          updated_at = ?
        WHERE user_id = ?
      `, [
        trackingSettings ? JSON.stringify(trackingSettings) : null,
        notificationSettings ? JSON.stringify(notificationSettings) : null,
        now,
        payload.userId
      ])
    } else {
      // Create new settings
      const settingsId = uuidv4()
      await db.run(`
        INSERT INTO user_settings (
          id, user_id, tracking_settings, notification_settings, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        settingsId,
        payload.userId,
        trackingSettings ? JSON.stringify(trackingSettings) : null,
        notificationSettings ? JSON.stringify(notificationSettings) : null,
        now,
        now
      ])
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}