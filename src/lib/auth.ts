import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './database'
import { User } from '@/types'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateTokens(user: { id: string; email: string }) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(email: string, name: string, password: string): Promise<string> {
  const id = crypto.randomUUID()
  const passwordHash = hashPassword(password)

  await db.run(`
    INSERT INTO users (id, email, name, password_hash)
    VALUES (?, ?, ?, ?)
  `, [id, email, name, passwordHash])
  
  return id
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await db.get(`
    SELECT id, email, name, subscription_tier, created_at
    FROM users
    WHERE email = ?
  `, [email])

  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    subscriptionTier: row.subscription_tier,
    createdAt: new Date(row.created_at)
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await db.get(`
    SELECT id, email, name, subscription_tier, created_at
    FROM users
    WHERE id = ?
  `, [id])

  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    subscriptionTier: row.subscription_tier,
    createdAt: new Date(row.created_at)
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const row = await db.get(`
    SELECT id, email, name, password_hash, subscription_tier, created_at
    FROM users
    WHERE email = ?
  `, [email])

  if (!row || !verifyPassword(password, row.password_hash)) {
    return null
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    subscriptionTier: row.subscription_tier,
    createdAt: new Date(row.created_at)
  }
}