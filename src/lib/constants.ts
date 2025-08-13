export const SURVEY_TYPES = {
  RATING: 'rating',
  EMOJI: 'emoji', 
  BINARY: 'binary',
  MULTIPLE_CHOICE: 'multiple_choice'
} as const

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  STARTER: 'starter', 
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const

export const USAGE_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    responses: 100,
    surveys: 5,
    webhooks: 0
  },
  [SUBSCRIPTION_TIERS.STARTER]: {
    responses: 2000,
    surveys: 25,
    webhooks: 3
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    responses: 10000,
    surveys: 100,
    webhooks: 10
  },
  [SUBSCRIPTION_TIERS.ENTERPRISE]: {
    responses: Infinity,
    surveys: Infinity,
    webhooks: Infinity
  }
}

export const BOT_DETECTION_THRESHOLDS = {
  USER_AGENT_SUSPICIOUS: 20,
  TIMING_TOO_FAST: 15,
  IP_ADDRESS_DATACENTER: 25,
  HEAD_REQUEST_DETECTED: 30,
  SEQUENTIAL_PATTERN: 20,
  TOTAL_BOT_THRESHOLD: 50
}

export const EMAIL_TEMPLATES = {
  NPS: {
    name: 'Net Promoter Score',
    category: 'saas',
    options: Array.from({length: 11}, (_, i) => ({
      label: i.toString(),
      value: i,
      color: i <= 6 ? '#ef4444' : i <= 8 ? '#f59e0b' : '#059669'
    }))
  },
  EMOJI_SATISFACTION: {
    name: 'Emoji Satisfaction',
    category: 'general',
    options: [
      { label: 'Very Unsatisfied', emoji: '😡', value: 1, color: '#dc2626' },
      { label: 'Unsatisfied', emoji: '😐', value: 2, color: '#ea580c' },
      { label: 'Neutral', emoji: '🙂', value: 3, color: '#ca8a04' },
      { label: 'Satisfied', emoji: '😃', value: 4, color: '#16a34a' },
      { label: 'Very Satisfied', emoji: '🥰', value: 5, color: '#059669' }
    ]
  },
  THUMBS: {
    name: 'Thumbs Up/Down',
    category: 'general',
    options: [
      { label: 'Thumbs Down', emoji: '👎', value: 0, color: '#dc2626' },
      { label: 'Thumbs Up', emoji: '👍', value: 1, color: '#059669' }
    ]
  }
} as const