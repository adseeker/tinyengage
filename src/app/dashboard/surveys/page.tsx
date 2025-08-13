'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Survey {
  id: string
  title: string
  description?: string
  type: string
  createdAt: string
  responseCount: number
  options: Array<{
    id: string
    label: string
    emoji?: string
  }>
}

export default function SurveysPage() {
  const { accessToken } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
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
        setSurveys(data.surveys || [])
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
            <p className="mt-2 text-gray-600">
              Manage your email survey campaigns
            </p>
          </div>
          <Link href="/dashboard/surveys/new">
            <Button>Create New Survey</Button>
          </Link>
        </div>
      </div>

      {surveys.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={`/dashboard/surveys/${survey.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{survey.title}</CardTitle>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {getTypeLabel(survey.type)}
                    </span>
                  </div>
                  {survey.description && (
                    <CardDescription className="line-clamp-2">
                      {survey.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Options:</span>
                      <div className="flex space-x-1">
                        {survey.options.slice(0, 4).map((option) => (
                          <span key={option.id} className="text-sm">
                            {option.emoji || '•'}
                          </span>
                        ))}
                        {survey.options.length > 4 && (
                          <span className="text-xs text-gray-500">+{survey.options.length - 4}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{survey.responseCount} responses</span>
                      <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Analytics
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            window.open(`/dashboard/surveys/${survey.id}?showTemplate=true`, '_blank')
                          }}
                        >
                          Get HTML
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}