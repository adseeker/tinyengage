'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="mt-2 text-gray-600">
          Performance metrics across all your surveys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalSurveys}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.totalResponses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Avg Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{metrics.averageResponseRate}</div>
            <div className="text-xs text-gray-500">per survey</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.thisMonthResponses}</div>
            <div className="text-xs text-gray-500">responses</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Survey Performance</CardTitle>
            <CardDescription>Response count by survey</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={surveys.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responseCount" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Survey Types</CardTitle>
            <CardDescription>Distribution of survey types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['emoji', 'rating', 'binary'].map((type) => {
                const count = surveys.filter(s => s.type === type).length
                const percentage = surveys.length > 0 ? Math.round(count / surveys.length * 100) : 0
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Surveys</CardTitle>
              <CardDescription>Your latest survey campaigns</CardDescription>
            </div>
            <Link href="/dashboard/surveys">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys.slice(0, 5).map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">{survey.title}</div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {getTypeLabel(survey.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{survey.responseCount} responses</span>
                  <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                  <Link href={`/dashboard/surveys/${survey.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            ))}
            {surveys.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No surveys created yet. <Link href="/dashboard/surveys/new" className="text-primary hover:underline">Create your first survey</Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}