import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId, response, originalResponse } = body

    if (!surveyId || !response?.trim()) {
      return NextResponse.json(
        { error: 'Survey ID and response are required' },
        { status: 400 }
      )
    }

    // Store follow-up response
    const followUpId = crypto.randomUUID()
    
    const stmt = db.prepare(`
      INSERT INTO follow_up_responses (id, survey_id, response, original_response, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      followUpId,
      surveyId,
      response.trim(),
      originalResponse || null,
      new Date().toISOString()
    )

    return NextResponse.json({ 
      success: true,
      id: followUpId 
    })

  } catch (error) {
    console.error('Follow-up response error:', error)
    return NextResponse.json(
      { error: 'Failed to save follow-up response' },
      { status: 500 }
    )
  }
}