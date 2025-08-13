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
}

export default function DashboardPage() {
  const { accessToken } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [metrics, setMetrics] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    responseRate: 0
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emoji': return '😊 Emoji'
      case 'rating': return '⭐ Rating'  
      case 'binary': return '👍 Yes/No'
      default: return type
    }
  }
  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your surveys and view response analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Surveys</CardTitle>
            <CardDescription>Surveys you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalSurveys}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
            <CardDescription>All responses received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.totalResponses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg Responses</CardTitle>
            <CardDescription>Average per survey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{metrics.responseRate}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Surveys</h2>
          <Link href="/dashboard/surveys/new">
            <Button>Create Survey</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first survey</p>
            <Link href="/dashboard/surveys/new">
              <Button>Create Your First Survey</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.slice(0, 5).map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-gray-900">{survey.title}</div>
                    <div className="text-sm text-gray-500">
                      {getTypeLabel(survey.type)} • Created {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{survey.responseCount}</div>
                    <div className="text-sm text-gray-500">responses</div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/surveys/${survey.id}?showTemplate=true`}>
                      <Button size="sm" variant="outline">Get HTML</Button>
                    </Link>
                    <Link href={`/dashboard/surveys/${survey.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {surveys.length > 5 && (
              <div className="text-center pt-4">
                <Link href="/dashboard/surveys">
                  <Button variant="outline">View All Surveys</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}