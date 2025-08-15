export interface SEOConfig {
  title: string
  description: string
  keywords?: string
  openGraph?: {
    title?: string
    description?: string
    image?: string
    url?: string
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
}

export const defaultSEO: SEOConfig = {
  title: "TinyEngagement - One-tap surveys",
  description: "Collect feedback directly in emails with clickable survey buttons. Increase engagement, get higher response rates, collect instant feedback.",
  keywords: "email surveys, feedback collection, email marketing, customer satisfaction, NPS",
  openGraph: {
    title: "TinyEngagement - One-tap Surveys", 
    description: "Collect feedback directly in emails with clickable survey buttons. Increase engagement, get higher response rates, collect instant feedback.",
    image: "/og-image.png",
    url: "https://tinyengagement.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "TinyEngagement - One-tap Surveys",
    description: "Collect feedback directly in emails with clickable survey buttons. Increase engagement, get higher response rates, collect instant feedback.",
    image: "/twitter-image.png"
  }
}

export const seoPages: Record<string, SEOConfig> = {
  home: {
    ...defaultSEO,
  },
  dashboard: {
    title: "Dashboard - TinyEngagement",
    description: "Manage your surveys and view analytics in your dashboard.",
    keywords: "survey dashboard, analytics, email survey management"
  },
  surveys: {
    title: "Surveys - TinyEngagement", 
    description: "Create and manage email surveys with clickable buttons. View response analytics in real-time.",
    keywords: "create surveys, email surveys, survey builder"
  },
  analytics: {
    title: "Analytics - TinyEngagement",
    description: "View detailed analytics for your email survey campaigns including response rates and engagement metrics.",
    keywords: "survey analytics, email campaign metrics, response tracking"
  },
  settings: {
    title: "Settings - TinyEngagement",
    description: "Configure your tracking settings, integrations, and account preferences.",
    keywords: "account settings, tracking configuration, integrations"
  }
}

export function getSEOConfig(page: string): SEOConfig {
  return seoPages[page] || defaultSEO
}