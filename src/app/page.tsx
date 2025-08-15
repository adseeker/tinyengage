import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent-pink/20 to-accent-blue/20 relative overflow-hidden">
      {/* Background Illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="illustration-blob w-96 h-96 bg-accent-pink -top-20 -left-20 float-animation"></div>
        <div className="illustration-blob w-64 h-64 bg-accent-blue top-40 right-10 float-animation" style={{animationDelay: '2s'}}></div>
        <div className="illustration-blob w-48 h-48 bg-accent-purple bottom-20 left-1/4 float-animation" style={{animationDelay: '4s'}}></div>
        <div className="illustration-blob w-80 h-80 bg-accent-yellow bottom-0 right-0 float-animation" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container-padding py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="font-bold text-2xl text-gradient">
            TinyEngagement
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link href="/auth/login" className="btn-ghost">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container-padding section-padding">
        <div className="text-center max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto mb-16">
            <h1 className="heading-xl text-foreground mb-8 leading-tight">
              The <span className="text-gradient">simplest way</span> to collect feedback directly from emails
            </h1>
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              Say goodbye to boring surveys. Meet TinyEngagement — the free, intuitive feedback collector you've been looking for.
            </p>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Turn your newsletters into engagement engines. Embed interactive survey buttons that your subscribers can click without leaving their inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                Create a free survey →
              </Link>
              <p className="text-sm text-muted-foreground">100% free of charge</p>
            </div>
          </div>

          {/* Playful Survey Preview */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="card-floating bg-white p-8 mx-4">
              <h3 className="text-lg font-semibold mb-6">How was your experience today?</h3>
              <div className="flex justify-center space-x-4 mb-6">
                <button className="w-16 h-16 bg-accent-pink rounded-full text-2xl hover:scale-110 transition-transform cursor-pointer bounce-subtle">😡</button>
                <button className="w-16 h-16 bg-accent-yellow rounded-full text-2xl hover:scale-110 transition-transform cursor-pointer bounce-subtle" style={{animationDelay: '0.5s'}}>😐</button>
                <button className="w-16 h-16 bg-accent-green rounded-full text-2xl hover:scale-110 transition-transform cursor-pointer bounce-subtle" style={{animationDelay: '1s'}}>🙂</button>
                <button className="w-16 h-16 bg-accent-blue rounded-full text-2xl hover:scale-110 transition-transform cursor-pointer bounce-subtle" style={{animationDelay: '1.5s'}}>😃</button>
                <button className="w-16 h-16 bg-accent-purple rounded-full text-2xl hover:scale-110 transition-transform cursor-pointer bounce-subtle" style={{animationDelay: '2s'}}>🥰</button>
              </div>
              <p className="text-sm text-muted-foreground">One click. No redirects. Instant feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <section id="features" className="relative z-10 section-padding bg-white/50">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">
              Unlimited surveys and submissions for <span className="text-gradient">free</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Paywalls getting in the way? Not anymore. TinyEngagement gives you unlimited surveys and submissions, completely free, as long as you stay within our fair usage guidelines.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-modern group">
              <div className="w-14 h-14 bg-accent-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="heading-md mb-4">Template-based surveys</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from pre-built survey templates and customize them to match your brand. Create emoji reactions, star ratings, or custom feedback forms in minutes.
              </p>
            </div>
            
            <div className="card-modern group">
              <div className="w-14 h-14 bg-accent-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="heading-md mb-4">Flexible surveys</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deploy your surveys anywhere your Email Service Provider supports HTML blocks. Works with Mailchimp, ConvertKit, Klaviyo, and more.
              </p>
            </div>
            
            <div className="card-modern group">
              <div className="w-14 h-14 bg-accent-green rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="heading-md mb-4">Real-time analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Watch responses flow into your dashboard in real-time with beautiful charts, detailed analytics, and exportable data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 section-padding">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Designed for you</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start from scratch or explore templates created by our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-500 text-white rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                1
              </div>
              <h3 className="heading-md mb-4">Create</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from emoji reactions, star ratings, or yes/no questions with our intuitive builder
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-pink to-accent-purple text-white rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                2
              </div>
              <h3 className="heading-md mb-4">Embed</h3>
              <p className="text-muted-foreground leading-relaxed">
                Copy the beautiful HTML code into your email campaigns with one click
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-green text-white rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                3
              </div>
              <h3 className="heading-md mb-4">Collect</h3>
              <p className="text-muted-foreground leading-relaxed">
                Watch responses flow into your dashboard in real-time with detailed insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 section-padding bg-white/50">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="heading-lg mb-8">Perfect for every creator</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Newsletter creators</h3>
                    <p className="text-muted-foreground">Seeking subscriber feedback and engagement without the friction</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">SaaS companies</h3>
                    <p className="text-muted-foreground">Measuring feature satisfaction and user experience in real-time</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🛍️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">E-commerce brands</h3>
                    <p className="text-muted-foreground">Collecting post-purchase reviews and customer satisfaction</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Content creators</h3>
                    <p className="text-muted-foreground">Gauging audience preferences and content engagement</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-floating">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6">Rate this article</h3>
                <div className="flex justify-center space-x-3 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="w-12 h-12 bg-accent-yellow rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform">
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-handwriting text-lg">
                  "TinyEngagement is doing to surveys what Notion did to docs & sheets."
                </p>
                <div className="flex items-center justify-center mt-4 space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full"></div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Head of Growth, Acme Inc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 section-padding">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-6">
            Ready to <span className="text-gradient">revolutionize</span> your email engagement?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Join thousands of creators who are already collecting better feedback with beautiful, accessible surveys.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register" className="btn-primary text-lg px-12 py-4">
              Create your first survey
            </Link>
            <p className="text-sm text-muted-foreground">100% free to use. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container-padding py-12 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="font-bold text-xl text-gradient mb-4">TinyEngagement</div>
            <p className="text-muted-foreground text-sm">
              The simplest way to collect feedback directly from emails.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}