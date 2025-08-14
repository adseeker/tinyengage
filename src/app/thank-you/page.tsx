'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Survey } from '@/types'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('survey')
  const selectedOption = searchParams.get('option')
  const selectedEmoji = searchParams.get('emoji')
  const isDuplicate = searchParams.get('duplicate') === 'true'
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [followUpResponse, setFollowUpResponse] = useState('')
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false)
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false)

  // Fetch survey data to get enhanced settings
  useEffect(() => {
    if (surveyId) {
      fetch(`/api/surveys/${surveyId}/public`)
        .then(res => res.json())
        .then(data => {
          console.log('Survey data loaded:', data)
          setSurvey(data)
          
          // Inject tracking script if provided
          if (data.settings?.trackingScript) {
            console.log('Found tracking script:', data.settings.trackingScript)
            // Extract JavaScript code from script tags if present
            let scriptContent = data.settings.trackingScript.trim()
            
            // Remove script tags if they exist (handle both cases: with and without tags)
            const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
            const match = scriptTagRegex.exec(scriptContent)
            if (match) {
              scriptContent = match[1] // Extract content between script tags
              console.log('Extracted script content:', scriptContent)
            } else {
              console.log('Using script as-is:', scriptContent)
            }
            
            // Create and execute the script
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.text = scriptContent
            document.head.appendChild(script)
            console.log('Script injected to head')
            
            // Also check if pixel is present
            if (data.settings?.trackingPixel) {
              console.log('Tracking pixel URL:', data.settings.trackingPixel)
            }
          } else {
            console.log('No tracking script found in settings')
          }
        })
        .catch(err => console.error('Failed to fetch survey:', err))
    }
  }, [surveyId])

  const handleFollowUpSubmit = async () => {
    if (!followUpResponse.trim() || !surveyId) return
    
    setIsSubmittingFollowUp(true)
    try {
      await fetch('/api/follow-up-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          response: followUpResponse,
          originalResponse: selectedOption
        })
      })
      setFollowUpSubmitted(true)
    } catch (error) {
      console.error('Failed to submit follow-up:', error)
    } finally {
      setIsSubmittingFollowUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Tracking Pixel */}
      {survey?.settings?.trackingPixel && (
        <Image 
          src={survey.settings.trackingPixel} 
          alt="" 
          width={1}
          height={1}
          style={{ position: 'absolute', top: 0, left: 0 }} 
        />
      )}
      
      <div className="w-full max-w-md space-y-6">
        {/* Main Thank You Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="text-6xl mb-4">
              {isDuplicate ? '🔒' : selectedEmoji || '✅'}
            </div>
            <CardTitle className="text-2xl">
              {isDuplicate ? 'Already Responded' : 'Thank You!'}
            </CardTitle>
            <CardDescription>
              {isDuplicate 
                ? 'You have already responded to this survey.'
                : survey?.settings?.thankYouMessage ||
                  (selectedOption 
                    ? `Your response "${selectedOption}" has been recorded.`
                    : 'Your response has been recorded.'
                  )
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isDuplicate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-800 font-medium">Response recorded successfully</span>
                </div>
              </div>
            )}
            
            {isDuplicate && (
              <p className="text-gray-600">
                Each person can only respond once to maintain the integrity of our survey results.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Question */}
        {!isDuplicate && survey?.settings?.followUpQuestion?.enabled && !followUpSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">One more thing...</CardTitle>
              <CardDescription>
                {survey?.settings?.followUpQuestion?.question}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={survey?.settings?.followUpQuestion?.placeholder || "Your thoughts..."}
                value={followUpResponse}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUpResponse(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleFollowUpSubmit}
                disabled={!followUpResponse.trim() || isSubmittingFollowUp}
                className="w-full"
              >
                {isSubmittingFollowUp ? 'Submitting...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Follow-up submitted confirmation */}
        {followUpSubmitted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🙏</div>
                <p className="text-green-800 font-medium">Thanks for the additional feedback!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upsell Section */}
        {!isDuplicate && survey?.settings?.upsellSection?.enabled && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">{survey?.settings?.upsellSection?.title}</CardTitle>
              <CardDescription>
                {survey?.settings?.upsellSection?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <a 
                  href={survey?.settings?.upsellSection?.ctaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {survey?.settings?.upsellSection?.ctaText}
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-sm text-gray-500">
          Powered by TinyEngagement - One-click email surveys
        </p>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-6xl mb-4">⏳</div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}