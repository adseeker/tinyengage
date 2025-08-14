import { NextRequest, NextResponse } from 'next/server'
import { verifySignedToken } from '@/lib/crypto'
import { calculateBotScore, getTotalBotScore, isLikelyBot } from '@/lib/bot-detection'
import { db, initializeDatabase } from '@/lib/database'
import crypto from 'crypto'

// Initialize database on cold start
initializeDatabase()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('tok')
  
  if (!token) {
    return new NextResponse('Missing token', { status: 400 })
  }

  const signedToken = verifySignedToken(token)
  if (!signedToken) {
    return new NextResponse('Invalid or expired token', { status: 400 })
  }

  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIP(request)
  const responseTime = Date.now()

  const existingResponse = await checkExistingResponse(
    signedToken.sid,
    signedToken.rid
  )

  if (existingResponse) {
    return NextResponse.redirect(
      new URL(`/thank-you?survey=${signedToken.sid}&duplicate=true`, request.url)
    )
  }

  const botScore = calculateBotScore(
    userAgent,
    ip,
    responseTime - (signedToken.exp * 1000 - 14 * 24 * 60 * 60 * 1000), // Estimate send time
    false,
    false
  )

  const totalScore = getTotalBotScore(botScore)
  const botLikely = isLikelyBot(botScore)

  const responseId = crypto.randomUUID()

  try {
    const metadata = {
      userAgent,
      ipAddress: ip,
      timestamp: new Date().toISOString(),
      isBot: botLikely,
      botScore: totalScore
    }

    // Insert response record
    await db.run(`
      INSERT INTO responses (id, survey_id, recipient_id, option_id, metadata)
      VALUES (?, ?, ?, ?, ?)
    `, [
      responseId,
      signedToken.sid,
      signedToken.rid,
      signedToken.ans,
      JSON.stringify(metadata)
    ])

    // Insert response event
    await db.run(`
      INSERT INTO response_events (id, response_id, event_type, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [
      crypto.randomUUID(),
      responseId,
      'response_submitted',
      ip,
      userAgent
    ])

    // Insert bot score
    await db.run(`
      INSERT INTO bot_scores (response_id, score, factors)
      VALUES (?, ?, ?)
    `, [
      responseId,
      totalScore,
      JSON.stringify(botScore)
    ])

    const survey = await getSurveyById(signedToken.sid)
    const option = await getOptionById(signedToken.ans)

    return NextResponse.redirect(
      new URL(
        `/thank-you?survey=${signedToken.sid}&option=${encodeURIComponent(option?.label || '')}&emoji=${encodeURIComponent(option?.emoji || '')}`,
        request.url
      )
    )

  } catch (error) {
    console.error('Response recording error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }

  return '127.0.0.1'
}

async function checkExistingResponse(surveyId: string, recipientId: string) {
  return await db.get(`
    SELECT id FROM responses 
    WHERE survey_id = ? AND recipient_id = ?
    LIMIT 1
  `, [surveyId, recipientId])
}

async function getSurveyById(surveyId: string) {
  return await db.get(`
    SELECT * FROM surveys WHERE id = ?
  `, [surveyId])
}

async function getOptionById(optionId: string) {
  return await db.get(`
    SELECT * FROM survey_options WHERE id = ?
  `, [optionId])
}