'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EMAIL_TEMPLATES } from '@/lib/constants'
import { CreateSurveyRequest, SurveyOption } from '@/types'

export default function NewSurveyPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('EMOJI_SATISFACTION')
  const [customOptions, setCustomOptions] = useState<SurveyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { accessToken } = useAuth()

  const handleTemplateSelect = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    setSelectedTemplate(templateKey)
    const template = EMAIL_TEMPLATES[templateKey]
    setCustomOptions(
      template.options.map((option, index) => ({
        id: `option_${index}`,
        label: option.label,
        emoji: option.emoji || undefined,
        value: option.value,
        color: option.color
      }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const template = EMAIL_TEMPLATES[selectedTemplate]
      const surveyType = selectedTemplate === 'NPS' ? 'rating' : 
                        selectedTemplate === 'THUMBS' ? 'binary' : 'emoji'

      const surveyData: CreateSurveyRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: surveyType,
        options: customOptions.map(({ id, ...option }) => option),
        settings: {
          requireRecipientId: false,
          botDetectionEnabled: true
        }
      }

      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(surveyData)
      })

      if (!response.ok) {
        throw new Error('Failed to create survey')
      }

      const survey = await response.json()
      router.push(`/dashboard/surveys/${survey.id}?showTemplate=true`)
    } catch (error) {
      console.error('Failed to create survey:', error)
      alert('Failed to create survey. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Survey</h1>
        <p className="mt-2 text-gray-600">
          Choose a template and customize your survey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>Basic information about your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Survey Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How was your experience?"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Help us improve by sharing your feedback"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Survey Template</CardTitle>
            <CardDescription>Choose from pre-built templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate === key
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(key as keyof typeof EMAIL_TEMPLATES)}
                >
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.options.slice(0, 5).map((option, index) => (
                      <span
                        key={index}
                        className="text-lg"
                        title={option.label}
                      >
                        {option.emoji || option.label}
                      </span>
                    ))}
                    {template.options.length > 5 && (
                      <span className="text-sm text-gray-500">
                        +{template.options.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your survey will look in emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border rounded-lg p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">{title || 'Survey Title'}</h2>
                {description && (
                  <p className="text-gray-600 mb-4">{description}</p>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                  {customOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                      {option.emoji && (
                        <span className="mr-2 text-lg">{option.emoji}</span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading ? 'Creating...' : 'Create Survey'}
          </Button>
        </div>
      </form>
    </div>
  )
}