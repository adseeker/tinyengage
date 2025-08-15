'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent-pink/20 to-accent-blue/20 relative overflow-hidden">
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
          <Link href="/" className="font-bold text-2xl text-gradient">
            TinyEngagement
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center container-padding py-16">
        <div className="w-full max-w-md">
          <div className="card-floating bg-white">
            <div className="text-center mb-8">
              <h1 className="heading-lg mb-3">Welcome back!</h1>
              <p className="text-muted-foreground">
                Sign in to continue collecting amazing feedback
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground block">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground block">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Protected by industry-standard encryption
              </p>
            </div>
          </div>

          {/* Back to home link */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}