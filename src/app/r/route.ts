import { NextRequest, NextResponse } from 'next/server'
import { verifySignedToken } from '@/lib/crypto'
import { calculateBotScore, getTotalBotScore, isLikelyBot } from '@/lib/bot-detection'
import { db } from '@/lib/db'
import crypto from 'crypto'

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

  const existingResponse = checkExistingResponse(
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
    db.transaction(() => {
      const insertResponse = db.prepare(`
        INSERT INTO responses (id, survey_id, recipient_id, option_id, metadata)
        VALUES (?, ?, ?, ?, ?)
      `)

      const metadata = {
        userAgent,
        ipAddress: ip,
        timestamp: new Date().toISOString(),
        isBot: botLikely,
        botScore: totalScore
      }

      insertResponse.run(
        responseId,
        signedToken.sid,
        signedToken.rid,
        signedToken.ans,
        JSON.stringify(metadata)
      )

      const insertEvent = db.prepare(`
        INSERT INTO response_events (id, response_id, event_type, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `)

      insertEvent.run(
        crypto.randomUUID(),
        responseId,
        'response_submitted',
        ip,
        userAgent
      )

      const insertBotScore = db.prepare(`
        INSERT INTO bot_scores (response_id, score, factors)
        VALUES (?, ?, ?)
      `)

      insertBotScore.run(
        responseId,
        totalScore,
        JSON.stringify(botScore)
      )
    })()

    const survey = getSurveyById(signedToken.sid)
    const option = getOptionById(signedToken.ans)

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

function checkExistingResponse(surveyId: string, recipientId: string) {
  const stmt = db.prepare(`
    SELECT id FROM responses 
    WHERE survey_id = ? AND recipient_id = ?
    LIMIT 1
  `)
  
  return stmt.get(surveyId, recipientId)
}

function getSurveyById(surveyId: string) {
  const stmt = db.prepare(`
    SELECT * FROM surveys WHERE id = ?
  `)
  
  return stmt.get(surveyId)
}

function getOptionById(optionId: string) {
  const stmt = db.prepare(`
    SELECT * FROM survey_options WHERE id = ?
  `)
  
  return stmt.get(optionId) as any
}