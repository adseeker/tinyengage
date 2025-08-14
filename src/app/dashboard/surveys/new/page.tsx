'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThankYouPreview } from '@/components/ThankYouPreview'
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
  const [trackingScript, setTrackingScript] = useState('')
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
          trackingScript: trackingScript.trim() || undefined,
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
            <CardTitle>Set up thank you page</CardTitle>
            <CardDescription>What happens after someone responds to your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom thank you message */}
            <div className="space-y-2">
              <label htmlFor="thankYouMessage" className="text-sm font-medium">
                Custom message
              </label>
              <Input
                id="thankYouMessage"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="Thanks for your feedback! 🙏"
              />
              <p className="text-xs text-gray-500">
                Leave blank to use the default message
              </p>
            </div>

            {/* Tracking */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Track conversions</h4>
              
              {/* Pixel URL */}
              <div className="space-y-2">
                <label htmlFor="trackingPixel" className="text-sm font-medium">
                  Tracking pixel URL
                </label>
                <Input
                  id="trackingPixel"
                  value={trackingPixel}
                  onChange={(e) => setTrackingPixel(e.target.value)}
                  placeholder="https://your-analytics.com/pixel.png"
                />
                <p className="text-xs text-gray-500">
                  1x1 pixel image for basic conversion tracking
                </p>
              </div>

              {/* JavaScript code */}
              <div className="space-y-2">
                <label htmlFor="trackingScript" className="text-sm font-medium">
                  Tracking script (goes in &lt;head&gt;)
                </label>
                <Textarea
                  id="trackingScript"
                  value={trackingScript}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTrackingScript(e.target.value)}
                  placeholder="<script>
// Your tracking code here
gtag('event', 'conversion', {'send_to': 'AW-123456/abc'});
</script>"
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500">
                  JavaScript code for advanced analytics (Google Analytics, Facebook Pixel, etc.)
                </p>
              </div>
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
                  Show a call-to-action
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Promote your newsletter, product, or service after they respond
              </p>
              
              {upsellEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline</label>
                    <Input
                      value={upsellTitle}
                      onChange={(e) => setUpsellTitle(e.target.value)}
                      placeholder="Stay in the loop"
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Button text</label>
                    <Input
                      value={upsellCtaText}
                      onChange={(e) => setUpsellCtaText(e.target.value)}
                      placeholder="Subscribe"
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={upsellDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUpsellDescription(e.target.value)}
                      placeholder="Get weekly insights in your inbox"
                      rows={2}
                      required={upsellEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Link URL</label>
                    <Input
                      value={upsellCtaUrl}
                      onChange={(e) => setUpsellCtaUrl(e.target.value)}
                      placeholder="https://your-site.com/subscribe"
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
                  Ask a follow-up question
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Get more detailed feedback with an optional text box
              </p>
              
              {followUpEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-green-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question</label>
                    <Textarea
                      value={followUpQuestion}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUpQuestion(e.target.value)}
                      placeholder="What could we improve?"
                      rows={2}
                      required={followUpEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Placeholder text</label>
                    <Input
                      value={followUpPlaceholder}
                      onChange={(e) => setFollowUpPlaceholder(e.target.value)}
                      placeholder="Tell us more..."
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview thank you page</CardTitle>
            <CardDescription>How your thank you page will look to users</CardDescription>
          </CardHeader>
          <CardContent>
            <ThankYouPreview
              title={title}
              thankYouMessage={thankYouMessage}
              selectedOption={customOptions[0]?.label || "Great!"}
              selectedEmoji={customOptions[0]?.emoji || "😃"}
              upsellSection={upsellEnabled ? {
                enabled: true,
                title: upsellTitle || "Stay in the loop",
                description: upsellDescription || "Get weekly insights in your inbox",
                ctaText: upsellCtaText || "Subscribe",
                ctaUrl: upsellCtaUrl || "#"
              } : undefined}
              followUpQuestion={followUpEnabled ? {
                enabled: true,
                question: followUpQuestion || "What could we improve?",
                placeholder: followUpPlaceholder || "Tell us more..."
              } : undefined}
            />
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