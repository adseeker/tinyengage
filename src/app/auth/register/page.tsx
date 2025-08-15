'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  
  const { register, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      await register(email, name, password)
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent-green/20 to-accent-purple/20 relative overflow-hidden">
      {/* Background Illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="illustration-blob w-96 h-96 bg-accent-green -top-20 -left-20 float-animation"></div>
        <div className="illustration-blob w-64 h-64 bg-accent-purple top-40 right-10 float-animation" style={{animationDelay: '2s'}}></div>
        <div className="illustration-blob w-48 h-48 bg-accent-yellow bottom-20 left-1/4 float-animation" style={{animationDelay: '4s'}}></div>
        <div className="illustration-blob w-80 h-80 bg-accent-orange bottom-0 right-0 float-animation" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container-padding py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="font-bold text-2xl text-gradient">
            TinyEngagement
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center container-padding py-12">
        <div className="w-full max-w-md">
          <div className="card-floating bg-white">
            <div className="text-center mb-8">
              <h1 className="heading-lg mb-3">
                Create your <span className="text-gradient">free</span> account
              </h1>
              <p className="text-muted-foreground">
                Start collecting amazing feedback today. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground block">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
                />
              </div>

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
                  placeholder="At least 8 characters"
                  className="h-12 rounded-xl border-2 border-border focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
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
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account →'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="text-success">✓</span>
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-success">✓</span>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-success">✓</span>
                  <span>Secure & private</span>
                </div>
              </div>
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