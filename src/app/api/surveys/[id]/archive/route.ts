import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { db } from '@/lib/database'

// PATCH /api/surveys/[id]/archive - Archive/unarchive survey
export async function PATCH(
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
    const { archived } = body

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'archived field must be a boolean' },
        { status: 400 }
      )
    }

    // Verify survey ownership and update archived status
    const result = await db.run(`
      UPDATE surveys 
      SET archived = ?
      WHERE id = ? AND user_id = ?
    `, [archived ? 1 : 0, surveyId, payload.userId])

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Return updated survey status
    return NextResponse.json({
      id: surveyId,
      archived,
      message: archived ? 'Survey archived successfully' : 'Survey unarchived successfully'
    })

  } catch (error) {
    console.error('Survey archive error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}