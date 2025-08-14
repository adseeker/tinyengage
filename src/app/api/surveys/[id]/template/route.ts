import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db, initializeDatabase } from '@/lib/database'
import { generateEmailPreview } from '@/lib/email-templates'
import { generateRecipientId } from '@/lib/crypto'

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
    const survey = await getSurveyWithOptions(surveyId, payload.userId)
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const recipientEmail = searchParams.get('email') || 'recipient@example.com'
    const baseUrl = searchParams.get('baseUrl') || `${request.nextUrl.protocol}//${request.nextUrl.host}`

    const recipientId = generateRecipientId(recipientEmail)
    const preview = generateEmailPreview(survey, recipientId, baseUrl)

    return NextResponse.json(preview)

  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSurveyWithOptions(surveyId: string, userId: string) {
  const survey = await db.get(`
    SELECT * FROM surveys WHERE id = ? AND user_id = ?
  `, [surveyId, userId])
  
  if (!survey) return null

  const options = await db.query(`
    SELECT * FROM survey_options 
    WHERE survey_id = ? 
    ORDER BY position ASC
  `, [surveyId])

  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    type: survey.type,
    settings: JSON.parse(survey.settings),
    createdAt: new Date(survey.created_at),
    userId: survey.user_id,
    options: options.map((option: any) => ({
      id: option.id,
      label: option.label,
      emoji: option.emoji,
      value: option.value,
      color: option.color
    }))
  }
}