import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/surveys/[id]/public - Get public survey data for thank you page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    // Get survey settings only (no user_id filtering needed for public data)
    const survey = await db.get(`
      SELECT 
        s.id,
        s.title,
        s.settings
      FROM surveys s
      WHERE s.id = ?
    `, [surveyId])

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Parse settings JSON
    const parsedSettings = typeof survey.settings === 'string' 
      ? JSON.parse(survey.settings) 
      : survey.settings

    // Only return data needed for thank you page
    return NextResponse.json({
      id: survey.id,
      title: survey.title,
      settings: {
        thankYouMessage: parsedSettings?.thankYouMessage,
        trackingPixel: parsedSettings?.trackingPixel,
        trackingScript: parsedSettings?.trackingScript,
        facebookPixelId: parsedSettings?.facebookPixelId,
        upsellSection: parsedSettings?.upsellSection,
        followUpQuestion: parsedSettings?.followUpQuestion
      }
    })

  } catch (error) {
    console.error('Public survey fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}