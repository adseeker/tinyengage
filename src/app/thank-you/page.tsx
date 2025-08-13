'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams.get('survey')
  const selectedOption = searchParams.get('option')
  const selectedEmoji = searchParams.get('emoji')
  const isDuplicate = searchParams.get('duplicate') === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
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
              : selectedOption 
                ? `Your response "${selectedOption}" has been recorded.`
                : 'Your response has been recorded.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isDuplicate && (
            <>
              <p className="text-gray-600 mb-6">
                Your feedback helps us improve our service. We appreciate you taking the time to respond!
              </p>
              
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
            </>
          )}
          
          {isDuplicate && (
            <p className="text-gray-600">
              Each person can only respond once to maintain the integrity of our survey results.
            </p>
          )}
        </CardContent>
      </Card>
      
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