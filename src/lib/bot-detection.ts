import { BotDetectionScore } from '@/types'
import { BOT_DETECTION_THRESHOLDS } from './constants'

const KNOWN_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /crawler/i,
  /spider/i,
  /scraper/i
]

const DATACENTER_IP_RANGES = [
  /^52\./,
  /^54\./,
  /^18\./,
  /^3\./,
  /^13\./,
  /^23\./,
  /^104\.16\./,
  /^104\.17\./,
  /^162\.158\./,
  /^172\.64\./
]

export function calculateBotScore(
  userAgent: string,
  ipAddress: string,
  responseTimeMs: number,
  hasHeadRequest: boolean = false,
  isSequentialPattern: boolean = false
): BotDetectionScore {
  const score: BotDetectionScore = {
    userAgent: 0,
    timing: 0,
    ipAddress: 0,
    headRequest: 0,
    pattern: 0
  }

  if (KNOWN_BOT_PATTERNS.some(pattern => pattern.test(userAgent))) {
    score.userAgent = BOT_DETECTION_THRESHOLDS.USER_AGENT_SUSPICIOUS
  }

  if (responseTimeMs < 30000) {
    score.timing = BOT_DETECTION_THRESHOLDS.TIMING_TOO_FAST
  }

  if (DATACENTER_IP_RANGES.some(range => range.test(ipAddress))) {
    score.ipAddress = BOT_DETECTION_THRESHOLDS.IP_ADDRESS_DATACENTER
  }

  if (hasHeadRequest) {
    score.headRequest = BOT_DETECTION_THRESHOLDS.HEAD_REQUEST_DETECTED
  }

  if (isSequentialPattern) {
    score.pattern = BOT_DETECTION_THRESHOLDS.SEQUENTIAL_PATTERN
  }

  return score
}

export function getTotalBotScore(score: BotDetectionScore): number {
  return score.userAgent + score.timing + score.ipAddress + score.headRequest + score.pattern
}

export function isLikelyBot(score: BotDetectionScore): boolean {
  return getTotalBotScore(score) >= BOT_DETECTION_THRESHOLDS.TOTAL_BOT_THRESHOLD
}