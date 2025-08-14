import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-12">
            <Image 
              src="/logo.svg" 
              alt="TinyEngagement Logo" 
              width={600} 
              height={120}
              priority
              className="h-24 w-auto"
            />
          </div>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Collect feedback directly from emails with one-click survey buttons
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Turn your newsletters into engagement engines. Embed interactive survey buttons that your subscribers can click without leaving their inbox.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-lg">
              Get Started Free
            </Link>
            <Link href="/auth/login" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block text-lg">
              Sign In
            </Link>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">One-Click Responses</h3>
            <p className="text-gray-600">Embed survey buttons directly in emails. Users click, get redirected to a clean thank-you page, and you get instant feedback.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Dashboard</h3>
            <p className="text-gray-600">View responses as they come in with detailed analytics, charts, and exportable data.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Better Engagement</h3>
            <p className="text-gray-600">Reduce friction in your feedback collection. Simple clicks mean more people actually respond to your surveys.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Create</h3>
              <p className="text-gray-600">Choose from emoji reactions, star ratings, or yes/no questions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Embed</h3>
              <p className="text-gray-600">Copy the HTML code into your email campaigns</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Collect</h3>
              <p className="text-gray-600">Watch responses flow into your dashboard in real-time</p>
            </div>
          </div>
        </div>

        {/* Perfect For */}
        <div className="mt-24 bg-white rounded-lg p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex-shrink-0 flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Newsletter creators</h3>
                <p className="text-gray-600">Seeking subscriber feedback and engagement</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex-shrink-0 flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">SaaS companies</h3>
                <p className="text-gray-600">Measuring feature satisfaction and user experience</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex-shrink-0 flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">E-commerce brands</h3>
                <p className="text-gray-600">Collecting post-purchase reviews and feedback</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-blue-100 rounded flex-shrink-0 flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Content creators</h3>
                <p className="text-gray-600">Gauging audience preferences and engagement</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to boost your email engagement?</h2>
          <p className="text-lg text-gray-600 mb-8">Start collecting feedback with one-click survey buttons today.</p>
          <Link href="/auth/register" className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-lg">
            Get Started Free
          </Link>
        </div>
      </div>
    </main>
  )
}