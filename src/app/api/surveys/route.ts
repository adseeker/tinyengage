import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db, initializeDatabase } from '@/lib/database'
import { CreateSurveyRequest, Survey } from '@/types'
import { z } from 'zod'
import crypto from 'crypto'

// Initialize database on cold start
initializeDatabase()

const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['rating', 'emoji', 'binary', 'multiple_choice']),
  options: z.array(z.object({
    label: z.string().min(1),
    emoji: z.string().optional(),
    value: z.union([z.string(), z.number()]),
    color: z.string().optional()
  })),
  settings: z.object({
    requireRecipientId: z.boolean().default(false),
    botDetectionEnabled: z.boolean().default(true),
    thankYouMessage: z.string().optional(),
    redirectUrl: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
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
    const surveyData = createSurveySchema.parse(body)

    const surveyId = crypto.randomUUID()
    const settings = surveyData.settings || {}

    await db.transaction(async () => {
      await db.run(`
        INSERT INTO surveys (id, user_id, title, description, type, settings)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        surveyId,
        payload.userId,
        surveyData.title,
        surveyData.description || null,
        surveyData.type,
        JSON.stringify(settings)
      ])

      for (let i = 0; i < surveyData.options.length; i++) {
        const option = surveyData.options[i]
        const optionId = crypto.randomUUID()
        
        await db.run(`
          INSERT INTO survey_options (id, survey_id, label, value, emoji, color, position)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          optionId,
          surveyId,
          option.label,
          typeof option.value === 'string' ? option.value : option.value.toString(),
          option.emoji || null,
          option.color || null,
          i
        ])
      }
    })

    const survey = await getSurveyById(surveyId)
    return NextResponse.json(survey)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create survey error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check for archived filter parameter
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const archivedOnly = searchParams.get('archivedOnly') === 'true'

    // Build WHERE clause based on archive filter
    let whereClause = 'WHERE s.user_id = ?'
    if (archivedOnly) {
      whereClause += ' AND s.archived = 1'
    } else {
      // TEMPORARILY SHOW ALL SURVEYS TO FIX THE ISSUE
      // TODO: Add proper archive filtering back
    }

    const rows = await db.query(`
      SELECT s.*, COUNT(r.id) as response_count
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.survey_id
      ${whereClause}
      GROUP BY s.id, s.title, s.description, s.type, s.settings, s.created_at, s.user_id, s.archived
      ORDER BY s.created_at DESC
    `, [payload.userId])
    
    const surveys = await Promise.all(rows.map(async (row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      settings: JSON.parse(row.settings),
      createdAt: new Date(row.created_at),
      userId: row.user_id,
      archived: Boolean(row.archived),
      responseCount: parseInt(row.response_count) || 0,
      options: await getSurveyOptions(row.id)
    })))

    return NextResponse.json({ surveys })

  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSurveyById(surveyId: string, userId?: string) {
  const survey = await db.get(`
    SELECT * FROM surveys WHERE id = ?${userId ? ' AND user_id = ?' : ''}
  `, userId ? [surveyId, userId] : [surveyId])
  
  if (!survey) return null

  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    type: survey.type,
    settings: JSON.parse(survey.settings),
    createdAt: new Date(survey.created_at),
    userId: survey.user_id,
    options: await getSurveyOptions(surveyId)
  }
}

async function getSurveyOptions(surveyId: string) {
  const rows = await db.query(`
    SELECT * FROM survey_options 
    WHERE survey_id = ? 
    ORDER BY position ASC
  `, [surveyId])
  
  return rows.map((row: any) => ({
    id: row.id,
    label: row.label,
    emoji: row.emoji,
    value: row.value,
    color: row.color
  }))
}