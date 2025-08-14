import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db } from '@/lib/database'

// GET /api/surveys/[id] - Get single survey
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: surveyId } = await params

    // Get survey with user_id filtering for security
    const survey = await db.get(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.type,
        s.settings,
        s.created_at,
        s.user_id
      FROM surveys s
      WHERE s.id = $1 AND s.user_id = $2
    `, [surveyId, payload.userId])

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Get survey options
    const options = await db.query(`
      SELECT id, label, value, emoji, color, position
      FROM survey_options
      WHERE survey_id = $1
      ORDER BY position
    `, [surveyId])

    // Parse settings JSON
    const parsedSettings = typeof survey.settings === 'string' 
      ? JSON.parse(survey.settings) 
      : survey.settings

    return NextResponse.json({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      type: survey.type,
      options: options || [],
      settings: parsedSettings,
      createdAt: survey.created_at,
      userId: survey.user_id,
      archived: Boolean(survey.archived)
    })

  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/surveys/[id] - Update survey
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: surveyId } = await params
    const body = await request.json()
    const { title, description, settings } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Verify survey ownership
    const existingSurvey = await db.get(`
      SELECT id FROM surveys WHERE id = $1 AND user_id = $2
    `, [surveyId, payload.userId])

    if (!existingSurvey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Update survey
    await db.run(`
      UPDATE surveys 
      SET title = $1, description = $2, settings = $3
      WHERE id = $4 AND user_id = $5
    `, [
      title.trim(),
      description || null,
      JSON.stringify(settings || {}),
      surveyId,
      payload.userId
    ])

    // Return updated survey
    const updatedSurvey = await db.get(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.type,
        s.settings,
        s.created_at,
        s.user_id
      FROM surveys s
      WHERE s.id = $1 AND s.user_id = $2
    `, [surveyId, payload.userId])

    if (!updatedSurvey) {
      return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 })
    }

    // Get survey options
    const options = await db.query(`
      SELECT id, label, value, emoji, color, position
      FROM survey_options
      WHERE survey_id = $1
      ORDER BY position
    `, [surveyId])

    // Parse settings JSON
    const parsedSettings = typeof updatedSurvey.settings === 'string' 
      ? JSON.parse(updatedSurvey.settings) 
      : updatedSurvey.settings

    return NextResponse.json({
      id: updatedSurvey.id,
      title: updatedSurvey.title,
      description: updatedSurvey.description,
      type: updatedSurvey.type,
      options: options || [],
      settings: parsedSettings,
      createdAt: updatedSurvey.created_at,
      userId: updatedSurvey.user_id
    })

  } catch (error) {
    console.error('Survey update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}