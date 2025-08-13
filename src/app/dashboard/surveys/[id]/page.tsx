'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SurveyAnalytics {
  survey: {
    id: string
    title: string
    type: string
    createdAt: string
  }
  metrics: {
    totalResponses: number
    humanResponses: number
    botResponses: number
    responseRate: string
  }
  charts: {
    responsesByOption: Array<{
      id: string
      label: string
      emoji?: string
      color?: string
      count: number
      percentage: string
    }>
    responsesByDay: Array<{ date: string; count: number }>
    responsesByHour: Array<{ hour: string; count: number }>
  }
  recentResponses: Array<{
    id: string
    createdAt: string
    option: { label: string; emoji?: string }
    isBot: boolean
  }>
}

export default function SurveyDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { accessToken } = useAuth()
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null)
  const [emailPreview, setEmailPreview] = useState<string>('')
  const [emailHtml, setEmailHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview')

  const surveyId = params.id as string

  useEffect(() => {
    if (accessToken && surveyId) {
      fetchAnalytics()
      
      // Auto-show template if coming from survey creation
      if (searchParams.get('showTemplate') === 'true') {
        generateEmailPreview()
        setActiveTab('html') // Show HTML code tab by default
      }
    }
  }, [accessToken, surveyId, searchParams])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateEmailPreview = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/template`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEmailPreview(data.html)
        setEmailHtml(data.html)
        setShowEmailModal(true)
      }
    } catch (error) {
      console.error('Failed to generate email preview:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('HTML copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (!analytics) {
    return <div className="p-8">Survey not found</div>
  }

  const COLORS = ['#2563eb', '#059669', '#dc2626', '#ea580c', '#ca8a04', '#7c3aed']

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{analytics.survey.title}</h1>
            <p className="mt-2 text-gray-600">
              Created {new Date(analytics.survey.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={generateEmailPreview}>
              Get Email Template
            </Button>
            <Link href={`/dashboard/surveys/${surveyId}/edit`}>
              <Button variant="outline">Edit Survey</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.metrics.totalResponses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Human Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{analytics.metrics.humanResponses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bot Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{analytics.metrics.botResponses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.metrics.responseRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Responses by Option</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.charts.responsesByOption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.charts.responsesByOption.filter(item => item.count > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ label, percentage }) => `${label}: ${percentage}%`}
                >
                  {analytics.charts.responsesByOption.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Responses Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.charts.responsesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
          <CardDescription>Latest responses to this survey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentResponses.length > 0 ? (
              analytics.recentResponses.map((response) => (
                <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {response.option.emoji || '📝'}
                    </div>
                    <div>
                      <div className="font-medium">{response.option.label}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {response.isBot && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                      Bot
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No responses yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Email Template</h2>
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-sm ${
                      activeTab === 'preview' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    } rounded-l-lg`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 text-sm ${
                      activeTab === 'html' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    } rounded-r-lg`}
                  >
                    HTML Code
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                {activeTab === 'html' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(emailHtml)}
                  >
                    Copy HTML
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowEmailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              {activeTab === 'preview' ? (
                <div className="p-4">
                  <div 
                    className="border rounded bg-gray-50" 
                    dangerouslySetInnerHTML={{ __html: emailPreview }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>📋 Instructions:</strong> Copy the HTML code below and paste it into your email campaign software
                    </p>
                  </div>
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto">
                    <pre className="whitespace-pre-wrap break-all">
                      {emailHtml}
                    </pre>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📧 How to use this template:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. <strong>Copy the HTML code above</strong> using the "Copy HTML" button</li>
                      <li>2. <strong>Paste it into your email platform:</strong>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          <li>• Mailchimp: Use "Code" block in email builder</li>
                          <li>• ConvertKit: Use "Raw HTML" block</li>
                          <li>• Klaviyo: Use "Text" block with HTML enabled</li>
                        </ul>
                      </li>
                      <li>3. <strong>Replace merge tags:</strong> Change "REPLACE_WITH_SUBSCRIBER_EMAIL" to:
                        <ul className="ml-4 mt-1 space-y-0.5">
                          <li>• Mailchimp: *|EMAIL|*</li>
                          <li>• ConvertKit: {`{{ subscriber.email_address }}`}</li>
                          <li>• Klaviyo: {`{{ person.email }}`}</li>
                          <li>• ActiveCampaign: %EMAIL%</li>
                        </ul>
                      </li>
                      <li>4. <strong>Test & Send</strong> your email campaign</li>
                      <li>5. <strong>Monitor responses</strong> in this analytics dashboard</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}