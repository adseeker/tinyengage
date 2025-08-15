'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Survey {
  id: string
  title: string
  type: string
  createdAt: string
  responseCount: number
}

interface OverallMetrics {
  totalSurveys: number
  totalResponses: number
  averageResponseRate: number
  thisMonthResponses: number
}

export default function AnalyticsPage() {
  const { accessToken } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [metrics, setMetrics] = useState<OverallMetrics>({
    totalSurveys: 0,
    totalResponses: 0,
    averageResponseRate: 0,
    thisMonthResponses: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (accessToken) {
      fetchSurveys()
    }
  }, [accessToken])

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const surveyData = data.surveys || []
        setSurveys(surveyData)
        
        // Calculate overall metrics
        const totalResponses = surveyData.reduce((sum: number, s: Survey) => sum + s.responseCount, 0)
        setMetrics({
          totalSurveys: surveyData.length,
          totalResponses,
          averageResponseRate: surveyData.length > 0 ? Math.round(totalResponses / surveyData.length * 10) / 10 : 0,
          thisMonthResponses: totalResponses // Simplified for MVP
        })
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-xl mb-4">
          <span className="text-gradient">Analytics</span> Overview
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Deep dive into your survey performance. Track engagement, measure success, and discover insights that matter.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent-pink rounded-full" style={{width: `${Math.min(metrics.totalSurveys * 20, 100)}%`}}></div>
          </div>
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
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent-blue rounded-full" style={{width: `${Math.min(metrics.totalResponses * 2, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="card-modern group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-green rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-success">{metrics.averageResponseRate}</div>
              <div className="text-sm text-muted-foreground">Avg per Survey</div>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent-green rounded-full" style={{width: `${Math.min(metrics.averageResponseRate * 10, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="card-modern group hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-purple rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{metrics.thisMonthResponses}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent-purple rounded-full" style={{width: `${Math.min(metrics.thisMonthResponses * 5, 100)}%`}}></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Survey Performance Chart */}
        <div className="card-modern">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent-orange rounded-2xl flex items-center justify-center mr-4">
              <span className="text-lg">📈</span>
            </div>
            <div>
              <h2 className="heading-md">Survey Performance</h2>
              <p className="text-muted-foreground">Response count by survey</p>
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={surveys.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px hsl(var(--muted-foreground) / 0.1)'
                  }} 
                />
                <Bar dataKey="responseCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Survey Types Distribution */}
        <div className="card-modern">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent-yellow rounded-2xl flex items-center justify-center mr-4">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h2 className="heading-md">Survey Types</h2>
              <p className="text-muted-foreground">Distribution of survey types</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {['emoji', 'rating', 'binary'].map((type) => {
              const count = surveys.filter(s => s.type === type).length
              const percentage = surveys.length > 0 ? Math.round(count / surveys.length * 100) : 0
              const colors = { emoji: 'bg-accent-pink', rating: 'bg-accent-blue', binary: 'bg-accent-green' }
              
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{getTypeLabel(type)}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-foreground w-12 text-right">{count}</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${colors[type as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="card-modern">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="heading-md">Recent Surveys</h2>
            <p className="text-muted-foreground">Your latest survey campaigns</p>
          </div>
          <Link href="/dashboard/surveys">
            <Button variant="outline" size="sm" className="btn-secondary">
              View All →
            </Button>
          </Link>
        </div>
        
        {surveys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-muted-foreground">📋</span>
            </div>
            <h3 className="heading-md mb-4">No surveys yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get started by creating your first survey and start collecting amazing feedback
            </p>
            <Link href="/dashboard/surveys/new">
              <Button className="btn-primary">
                <span className="mr-2">✨</span>
                Create Your First Survey
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.slice(0, 5).map((survey) => (
              <div key={survey.id} className="p-4 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                      {getTypeLabel(survey.type).charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {survey.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-muted rounded-lg text-xs font-medium">
                          {getTypeLabel(survey.type)}
                        </span>
                        <span>•</span>
                        <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{survey.responseCount}</div>
                      <div className="text-xs text-muted-foreground">responses</div>
                    </div>
                    <Link href={`/dashboard/surveys/${survey.id}`}>
                      <Button size="sm" className="btn-primary">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}