import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            TinyEngage
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            One-click feedback collection directly in emails. 
            No redirects, no forms - just instant responses.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
              Get Started
            </Link>
            <Link href="/auth/login" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Instant Responses</h3>
            <p className="text-gray-600">Click and done. No page redirects or forms to fill.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Track responses as they come in with detailed insights.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Higher Response Rates</h3>
            <p className="text-gray-600">Get 15%+ response rates vs 3-5% for traditional surveys.</p>
          </div>
        </div>
      </div>
    </main>
  )
}