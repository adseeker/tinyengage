export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  subscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise'
}

export interface Survey {
  id: string
  title: string
  description?: string
  type: 'rating' | 'emoji' | 'binary' | 'multiple_choice'
  options: SurveyOption[]
  settings: SurveySettings
  createdAt: Date
  userId: string
  archived?: boolean
}

export interface SurveyOption {
  id: string
  label: string
  emoji?: string
  value: string | number
  color?: string
}

export interface SurveySettings {
  requireRecipientId: boolean
  botDetectionEnabled: boolean
  thankYouMessage?: string
  redirectUrl?: string
  expiresAt?: Date
  // Enhanced thank you page settings
  trackingPixel?: string
  trackingScript?: string
  facebookPixelId?: string // New: Simple Facebook Pixel ID field
  upsellSection?: {
    enabled: boolean
    title: string
    description: string
    ctaText: string
    ctaUrl: string
  }
  followUpQuestion?: {
    enabled: boolean
    question: string
    placeholder?: string
  }
}

export interface Response {
  id: string
  surveyId: string
  recipientId: string
  answer: string
  metadata: ResponseMetadata
  createdAt: Date
}

export interface ResponseMetadata {
  userAgent: string
  ipAddress: string
  timestamp: Date
  isBot: boolean
  botScore: number
}

export interface SignedToken {
  sid: string // survey id
  rid: string // recipient id
  ans: string // answer/option id
  exp: number // expiration timestamp
  nonce: string // random string for uniqueness
}

export interface BotDetectionScore {
  userAgent: number
  timing: number
  ipAddress: number
  headRequest: number
  pattern: number
}

export interface UsageMetrics {
  responsesThisMonth: number
  surveysCreated: number
  webhooksCalled: number
  apiRequestsThisMonth: number
  storageUsed: number
}

export interface WebhookPayload {
  event: 'response.created' | 'survey.completed'
  survey: Survey
  response: Response
  recipient?: {
    id: string
  }
}

export interface CreateSurveyRequest {
  title: string
  description?: string
  type: Survey['type']
  options: Omit<SurveyOption, 'id'>[]
  settings?: Partial<SurveySettings>
}

export interface EmailTemplate {
  id: string
  name: string
  category: 'ecommerce' | 'saas' | 'newsletter' | 'events' | 'support'
  html: string
  variables: string[]
}