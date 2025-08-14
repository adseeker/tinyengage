import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ThankYouPreviewProps {
  title: string
  thankYouMessage?: string
  upsellSection?: {
    enabled: boolean
    title: string
    description: string
    ctaText: string
    ctaUrl: string
  }
  followUpQuestion?: {
    enabled: boolean
    question: string
    placeholder?: string
  }
  selectedOption?: string
  selectedEmoji?: string
}

export function ThankYouPreview({
  title,
  thankYouMessage,
  upsellSection,
  followUpQuestion,
  selectedOption = "Great!",
  selectedEmoji = "😃"
}: ThankYouPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg">
      <div className="max-w-md mx-auto space-y-4">
        {/* Main Thank You Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="text-4xl mb-4">{selectedEmoji}</div>
            <CardTitle className="text-xl">Thank You!</CardTitle>
            <CardDescription>
              {thankYouMessage || `Your response "${selectedOption}" has been recorded.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-800 font-medium text-sm">Response recorded successfully</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Question */}
        {followUpQuestion?.enabled && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">One more thing...</CardTitle>
              <CardDescription className="text-sm">
                {followUpQuestion.question}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={followUpQuestion.placeholder || "Your thoughts..."}
                rows={2}
                className="text-sm"
                disabled
              />
              <Button className="w-full" size="sm" disabled>
                Submit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upsell Section */}
        {upsellSection?.enabled && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">{upsellSection.title}</CardTitle>
              <CardDescription className="text-sm">
                {upsellSection.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="sm"
                disabled
              >
                {upsellSection.ctaText}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by TinyEngagement - One-click email surveys
          </p>
        </div>
      </div>
    </div>
  )
}