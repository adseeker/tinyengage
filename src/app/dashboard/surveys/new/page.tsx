'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-xl mb-4">
          Create your <span className="text-gradient">perfect</span> survey
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose a template and customize your survey. Create something your audience will love to interact with.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Survey Details */}
        <div className="card-modern">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent-pink rounded-2xl flex items-center justify-center mr-4">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h2 className="heading-md">Survey Details</h2>
              <p className="text-muted-foreground">Basic information about your survey</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground block">
                Survey Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How was your experience?"
                required
                className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground block">
                Description (optional)
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Help us improve by sharing your feedback"
                className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Survey Template */}
        <div className="card-modern">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent-blue rounded-2xl flex items-center justify-center mr-4">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h2 className="heading-md">Survey Template</h2>
              <p className="text-muted-foreground">Choose from pre-built templates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 group ${
                  selectedTemplate === key
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-border hover:border-border/80 hover:scale-102'
                }`}
                onClick={() => handleTemplateSelect(key as keyof typeof EMAIL_TEMPLATES)}
              >
                <div className="text-center">
                  <h3 className="font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex justify-center flex-wrap gap-2 mb-3">
                    {template.options.slice(0, 5).map((option, index) => (
                      <span
                        key={index}
                        className="text-2xl group-hover:scale-110 transition-transform"
                        title={option.label}
                      >
                        {'emoji' in option ? option.emoji : option.label}
                      </span>
                    ))}
                    {template.options.length > 5 && (
                      <span className="text-sm text-muted-foreground">
                        +{template.options.length - 5} more
                      </span>
                    )}
                  </div>
                  {selectedTemplate === key && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

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

            {/* Note about tracking */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tracking is now configured at the account level!</strong> <br/>
                Visit your <Link href="/dashboard/settings" className="underline font-medium">Settings page</Link> to configure tracking for all your surveys.
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="btn-secondary w-full sm:w-auto"
          >
            ← Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !title.trim()}
            className="btn-primary w-full sm:w-auto px-8 py-3"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Create Survey
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}