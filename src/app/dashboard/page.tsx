'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Survey {
  id: string
  title: string
  type: string
  createdAt: string
  responseCount: number
  archived: boolean
}

export default function DashboardPage() {
  const { accessToken, user } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [metrics, setMetrics] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    responseRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null)

  useEffect(() => {
    if (accessToken) {
      fetchSurveys()
    }
  }, [accessToken, showArchived])

  const fetchSurveys = async () => {
    try {
      const url = showArchived 
        ? '/api/surveys?archivedOnly=true'
        : '/api/surveys'
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const surveyData = data.surveys || []
        setSurveys(surveyData)
        
        const totalResponses = surveyData.reduce((sum: number, s: Survey) => sum + s.responseCount, 0)
        const avgResponseRate = surveyData.length > 0 ? Math.round(totalResponses / surveyData.length * 10) / 10 : 0
        
        setMetrics({
          totalSurveys: surveyData.length,
          totalResponses,
          responseRate: avgResponseRate
        })
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleArchive = async (surveyId: string, currentlyArchived: boolean) => {
    setArchiveLoading(surveyId)
    try {
      const response = await fetch(`/api/surveys/${surveyId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ archived: !currentlyArchived })
      })

      if (response.ok) {
        // Refresh surveys list
        await fetchSurveys()
      } else {
        console.error('Failed to toggle archive status')
        alert('Failed to update survey status')
      }
    } catch (error) {
      console.error('Archive toggle error:', error)
      alert('Failed to update survey status')
    } finally {
      setArchiveLoading(null)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emoji': return '😊 Emoji'
      case 'rating': return '⭐ Rating'  
      case 'binary': return '👍 Yes/No'
      default: return type
    }
  }
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="heading-xl mb-4">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>! 
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your feedback collection hub. Create, manage, and analyze beautiful surveys that people actually want to complete.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-modern group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-pink rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">{metrics.totalSurveys}</div>
              <div className="text-sm text-muted-foreground">Total Surveys</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Surveys you've created</p>
        </div>
        
        <div className="card-modern group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{metrics.totalResponses}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">All responses received</p>
        </div>
        
        <div className="card-modern group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-green rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-success">{metrics.responseRate}</div>
              <div className="text-sm text-muted-foreground">Avg Responses</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Average per survey</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-modern">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-md">Quick Actions</h2>
            <p className="text-muted-foreground">Get started with your next survey</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/surveys/new" className="group">
            <div className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all group-hover:scale-105">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-semibold mb-2">Create Survey</h3>
                <p className="text-sm text-muted-foreground">Start collecting feedback</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/analytics" className="group">
            <div className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all group-hover:scale-105">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Deep dive into insights</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/surveys" className="group">
            <div className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all group-hover:scale-105">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-yellow rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🗂️</span>
                </div>
                <h3 className="font-semibold mb-2">Manage Surveys</h3>
                <p className="text-sm text-muted-foreground">View all your surveys</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="card-modern">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="heading-md">
                {showArchived ? 'Archived Surveys' : 'Recent Surveys'}
              </h2>
              <p className="text-muted-foreground">
                {showArchived ? 'Surveys you\'ve archived' : 'Your latest feedback campaigns'}
              </p>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          </div>
          <Link href="/dashboard/surveys/new">
            <Button className="btn-primary">
              <span className="mr-2">✨</span>
              Create Survey
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your surveys...</p>
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-muted-foreground">
                {showArchived ? '📥' : '📋'}
              </span>
            </div>
            <h3 className="heading-md mb-4">
              {showArchived ? 'No archived surveys' : 'No surveys yet'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {showArchived 
                ? 'Archived surveys will appear here when you archive them'
                : 'Get started by creating your first survey and start collecting amazing feedback'
              }
            </p>
            {!showArchived && (
              <Link href="/dashboard/surveys/new">
                <Button className="btn-primary">
                  <span className="mr-2">✨</span>
                  Create Your First Survey
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.slice(0, 5).map((survey) => (
              <div key={survey.id} className="p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                      {getTypeLabel(survey.type).charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {survey.title}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {getTypeLabel(survey.type)} • Created {new Date(survey.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{survey.responseCount}</div>
                      <div className="text-xs text-muted-foreground">responses</div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/surveys/${survey.id}?showTemplate=true`}>
                        <Button size="sm" variant="outline" className="btn-secondary">
                          Get HTML
                        </Button>
                      </Link>
                      <Link href={`/dashboard/surveys/${survey.id}`}>
                        <Button size="sm" className="btn-primary">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => toggleArchive(survey.id, survey.archived)}
                        disabled={archiveLoading === survey.id}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {archiveLoading === survey.id 
                          ? <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                          : survey.archived 
                            ? '📤'
                            : '📥'
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {surveys.length > 5 && (
              <div className="text-center pt-6">
                <Link href="/dashboard/surveys">
                  <Button variant="outline" className="btn-secondary">
                    View All Surveys →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}