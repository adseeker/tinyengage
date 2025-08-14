'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EMAIL_TEMPLATES } from '@/lib/constants'
import { CreateSurveyRequest, SurveyOption } from '@/types'

export default function NewSurveyPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('EMOJI_SATISFACTION')
  const [customOptions, setCustomOptions] = useState<SurveyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Enhanced thank you page settings
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [trackingPixel, setTrackingPixel] = useState('')
  const [upsellEnabled, setUpsellEnabled] = useState(false)
  const [upsellTitle, setUpsellTitle] = useState('')
  const [upsellDescription, setUpsellDescription] = useState('')
  const [upsellCtaText, setUpsellCtaText] = useState('')
  const [upsellCtaUrl, setUpsellCtaUrl] = useState('')
  const [followUpEnabled, setFollowUpEnabled] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpPlaceholder, setFollowUpPlaceholder] = useState('')
  
  const router = useRouter()
  const { accessToken } = useAuth()

  const handleTemplateSelect = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    setSelectedTemplate(templateKey)
    const template = EMAIL_TEMPLATES[templateKey]
    setCustomOptions(
      template.options.map((option, index) => ({
        id: `option_${index}`,
        label: option.label,
        emoji: 'emoji' in option ? option.emoji : undefined,
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
          botDetectionEnabled: true,
          thankYouMessage: thankYouMessage.trim() || undefined,
          trackingPixel: trackingPixel.trim() || undefined,
          upsellSection: upsellEnabled ? {
            enabled: true,
            title: upsellTitle,
            description: upsellDescription,
            ctaText: upsellCtaText,
            ctaUrl: upsellCtaUrl
          } : undefined,
          followUpQuestion: followUpEnabled ? {
            enabled: true,
            question: followUpQuestion,
            placeholder: followUpPlaceholder.trim() || undefined
          } : undefined
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
                        {'emoji' in option ? option.emoji : option.label}
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

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Thank You Page</CardTitle>
            <CardDescription>Configure tracking, upsells, and follow-up questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom thank you message */}
            <div className="space-y-2">
              <label htmlFor="thankYouMessage" className="text-sm font-medium">
                Custom Thank You Message (optional)
              </label>
              <Input
                id="thankYouMessage"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="Thank you for your feedback!"
              />
            </div>

            {/* Tracking pixel */}
            <div className="space-y-2">
              <label htmlFor="trackingPixel" className="text-sm font-medium">
                Tracking Pixel URL (optional)
              </label>
              <Input
                id="trackingPixel"
                value={trackingPixel}
                onChange={(e) => setTrackingPixel(e.target.value)}
                placeholder="https://analytics.example.com/pixel.png"
              />
              <p className="text-xs text-gray-500">
                Add a 1x1 pixel for tracking conversions or retargeting
              </p>
            </div>

            {/* Upsell section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="upsell-enabled"
                  checked={upsellEnabled}
                  onCheckedChange={setUpsellEnabled}
                />
                <label htmlFor="upsell-enabled" className="text-sm font-medium">
                  Enable Upsell Section
                </label>
              </div>
              
              {upsellEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upsell Title</label>
                    <Input
                      value={upsellTitle}
                      onChange={(e) => setUpsellTitle(e.target.value)}
                      placeholder="Want more insights?"
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Call-to-Action Text</label>
                    <Input
                      value={upsellCtaText}
                      onChange={(e) => setUpsellCtaText(e.target.value)}
                      placeholder="Subscribe to Newsletter"
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={upsellDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUpsellDescription(e.target.value)}
                      placeholder="Get weekly insights delivered to your inbox"
                      rows={2}
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CTA URL</label>
                    <Input
                      value={upsellCtaUrl}
                      onChange={(e) => setUpsellCtaUrl(e.target.value)}
                      placeholder="https://example.com/subscribe"
                      type="url"
                      required={upsellEnabled}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up question */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="followup-enabled"
                  checked={followUpEnabled}
                  onCheckedChange={setFollowUpEnabled}
                />
                <label htmlFor="followup-enabled" className="text-sm font-medium">
                  Enable Follow-up Question
                </label>
              </div>
              
              {followUpEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-green-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Follow-up Question</label>
                    <Textarea
                      value={followUpQuestion}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUpQuestion(e.target.value)}
                      placeholder="Can you tell us more about your experience?"
                      rows={2}
                      required={followUpEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Placeholder Text (optional)</label>
                    <Input
                      value={followUpPlaceholder}
                      onChange={(e) => setFollowUpPlaceholder(e.target.value)}
                      placeholder="Your thoughts..."
                    />
                  </div>
                </div>
              )}
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