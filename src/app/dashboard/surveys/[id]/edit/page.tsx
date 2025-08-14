'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Survey } from '@/types'

export default function EditSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const { accessToken } = useAuth()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

  const surveyId = params.id as string

  useEffect(() => {
    if (accessToken && surveyId) {
      fetchSurvey()
    }
  }, [accessToken, surveyId])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const surveyData = await response.json()
        setSurvey(surveyData)
        
        // Populate form fields
        setTitle(surveyData.title)
        setDescription(surveyData.description || '')
        setThankYouMessage(surveyData.settings.thankYouMessage || '')
        setTrackingPixel(surveyData.settings.trackingPixel || '')
        
        // Upsell section
        if (surveyData.settings.upsellSection) {
          setUpsellEnabled(true)
          setUpsellTitle(surveyData.settings.upsellSection.title || '')
          setUpsellDescription(surveyData.settings.upsellSection.description || '')
          setUpsellCtaText(surveyData.settings.upsellSection.ctaText || '')
          setUpsellCtaUrl(surveyData.settings.upsellSection.ctaUrl || '')
        }
        
        // Follow-up question
        if (surveyData.settings.followUpQuestion) {
          setFollowUpEnabled(true)
          setFollowUpQuestion(surveyData.settings.followUpQuestion.question || '')
          setFollowUpPlaceholder(surveyData.settings.followUpQuestion.placeholder || '')
        }
        
      } else {
        console.error('Failed to fetch survey')
      }
    } catch (error) {
      console.error('Error fetching survey:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const updatedSettings = {
        ...survey?.settings,
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

      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          settings: updatedSettings
        })
      })

      if (response.ok) {
        router.push(`/dashboard/surveys/${surveyId}`)
      } else {
        throw new Error('Failed to update survey')
      }
    } catch (error) {
      console.error('Failed to save survey:', error)
      alert('Failed to save survey. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          Loading...
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="p-8">Survey not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Survey</h1>
        <p className="mt-2 text-gray-600">
          Update your survey settings
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Survey title and description</CardDescription>
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

            {/* Tracking pixel */}
            <div className="space-y-2">
              <label htmlFor="trackingPixel" className="text-sm font-medium">
                Track conversions
              </label>
              <Input
                id="trackingPixel"
                value={trackingPixel}
                onChange={(e) => setTrackingPixel(e.target.value)}
                placeholder="https://your-analytics.com/pixel"
              />
              <p className="text-xs text-gray-500">
                Add your tracking pixel URL to measure conversions
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

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}