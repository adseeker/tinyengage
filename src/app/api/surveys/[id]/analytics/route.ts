import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db, initializeDatabase } from '@/lib/database'

// Initialize database on cold start
initializeDatabase()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: surveyId } = await params

    const survey = await db.get(`
      SELECT * FROM surveys WHERE id = ? AND user_id = ?
    `, [surveyId, payload.userId])

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const totalResponses = await db.get(`
      SELECT COUNT(*) as count FROM responses WHERE survey_id = ?
    `, [surveyId])

    const humanResponses = await db.get(`
      SELECT COUNT(*) as count 
      FROM responses r 
      JOIN bot_scores bs ON r.id = bs.response_id 
      WHERE r.survey_id = ? AND bs.score < 50
    `, [surveyId])

    const responsesByOption = await db.query(`
      SELECT 
        so.id,
        so.label,
        so.emoji,
        so.color,
        COUNT(r.id) as count
      FROM survey_options so
      LEFT JOIN responses r ON so.id = r.option_id
      WHERE so.survey_id = ?
      GROUP BY so.id, so.label, so.emoji, so.color
      ORDER BY so.position ASC
    `, [surveyId])

    const responsesByDay = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [surveyId])

    const responsesByHour = await db.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ? AND DATE(created_at) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `, [surveyId])

    const recentResponses = await db.query(`
      SELECT 
        r.id,
        r.created_at,
        so.label as option_label,
        so.emoji as option_emoji,
        (r.metadata::json->>'isBot')::boolean as is_bot
      FROM responses r
      JOIN survey_options so ON r.option_id = so.id
      WHERE r.survey_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [surveyId])

    const analytics = {
      survey: {
        id: survey.id,
        title: survey.title,
        type: survey.type,
        createdAt: survey.created_at
      },
      metrics: {
        totalResponses: parseInt(totalResponses.count) || 0,
        humanResponses: parseInt(humanResponses.count) || 0,
        botResponses: (parseInt(totalResponses.count) || 0) - (parseInt(humanResponses.count) || 0),
        responseRate: (parseInt(totalResponses.count) || 0) > 0 ? ((parseInt(humanResponses.count) || 0) / (parseInt(totalResponses.count) || 0) * 100).toFixed(1) : '0'
      },
      charts: {
        responsesByOption: responsesByOption.map((row: any) => ({
          id: row.id,
          label: row.label,
          emoji: row.emoji,
          color: row.color,
          count: parseInt(row.count) || 0,
          percentage: (parseInt(totalResponses.count) || 0) > 0 ? ((parseInt(row.count) || 0) / (parseInt(totalResponses.count) || 0) * 100).toFixed(1) : '0'
        })),
        responsesByDay: responsesByDay.reverse(),
        responsesByHour
      },
      recentResponses: recentResponses.map((row: any) => ({
        id: row.id,
        createdAt: row.created_at,
        option: {
          label: row.option_label,
          emoji: row.option_emoji
        },
        isBot: row.is_bot === true
      }))
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}