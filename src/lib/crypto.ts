import crypto from 'crypto'
import { SignedToken } from '@/types'

const HMAC_SECRET = process.env.HMAC_SECRET || 'dev-secret-change-in-production'

export function generateSignedToken(
  surveyId: string,
  recipientId: string,
  optionId: string,
  expirationDays: number = 14
): string {
  const token: SignedToken = {
    sid: surveyId,
    rid: recipientId,
    ans: optionId,
    exp: Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60),
    nonce: crypto.randomBytes(8).toString('hex')
  }

  const payload = Buffer.from(JSON.stringify(token)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('base64url')

  return `${payload}.${signature}`
}

export function verifySignedToken(signedToken: string): SignedToken | null {
  try {
    const [payload, signature] = signedToken.split('.')
    if (!payload || !signature) return null

    const expectedSignature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(payload)
      .digest('base64url')

    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    )) {
      return null
    }

    const token = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SignedToken

    if (token.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return token
  } catch {
    return null
  }
}

export function generateRecipientId(email?: string): string {
  const source = email || crypto.randomBytes(16).toString('hex')
  return crypto.createHash('sha256').update(source + HMAC_SECRET).digest('hex').slice(0, 16)
}