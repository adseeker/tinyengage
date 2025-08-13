import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db } from '@/lib/db'

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

    const survey = db.prepare(`
      SELECT * FROM surveys WHERE id = ? AND user_id = ?
    `).get(surveyId, payload.userId) as any

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const totalResponses = db.prepare(`
      SELECT COUNT(*) as count FROM responses WHERE survey_id = ?
    `).get(surveyId) as any

    const humanResponses = db.prepare(`
      SELECT COUNT(*) as count 
      FROM responses r 
      JOIN bot_scores bs ON r.id = bs.response_id 
      WHERE r.survey_id = ? AND bs.score < 50
    `).get(surveyId) as any

    const responsesByOption = db.prepare(`
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
    `).all(surveyId) as any[]

    const responsesByDay = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `).all(surveyId) as any[]

    const responsesByHour = db.prepare(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as count
      FROM responses
      WHERE survey_id = ? AND DATE(created_at) = DATE('now')
      GROUP BY strftime('%H', created_at)
      ORDER BY hour ASC
    `).all(surveyId) as any[]

    const recentResponses = db.prepare(`
      SELECT 
        r.id,
        r.created_at,
        so.label as option_label,
        so.emoji as option_emoji,
        JSON_EXTRACT(r.metadata, '$.isBot') as is_bot
      FROM responses r
      JOIN survey_options so ON r.option_id = so.id
      WHERE r.survey_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
    `).all(surveyId) as any[]

    const analytics = {
      survey: {
        id: survey.id,
        title: survey.title,
        type: survey.type,
        createdAt: survey.created_at
      },
      metrics: {
        totalResponses: totalResponses.count,
        humanResponses: humanResponses.count,
        botResponses: totalResponses.count - humanResponses.count,
        responseRate: totalResponses.count > 0 ? (humanResponses.count / totalResponses.count * 100).toFixed(1) : '0'
      },
      charts: {
        responsesByOption: responsesByOption.map(row => ({
          id: row.id,
          label: row.label,
          emoji: row.emoji,
          color: row.color,
          count: row.count,
          percentage: totalResponses.count > 0 ? (row.count / totalResponses.count * 100).toFixed(1) : '0'
        })),
        responsesByDay: responsesByDay.reverse(),
        responsesByHour
      },
      recentResponses: recentResponses.map(row => ({
        id: row.id,
        createdAt: row.created_at,
        option: {
          label: row.option_label,
          emoji: row.option_emoji
        },
        isBot: row.is_bot === 1
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