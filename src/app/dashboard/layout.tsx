'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, refreshAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      refreshAuth().catch(() => {
        router.push('/auth/login')
      })
    }
  }, [user, refreshAuth, router])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent-pink/10 to-accent-blue/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent-pink/5 to-accent-blue/5">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="font-bold text-xl text-gradient">
                TinyEngagement
              </Link>
              <div className="hidden md:flex space-x-1">
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard') && pathname === '/dashboard'
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/surveys"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard/surveys')
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Surveys
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard/analytics')
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard/settings')
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Settings
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="btn-ghost border-none"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container-padding py-2">
          <div className="flex space-x-1">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive('/dashboard') && pathname === '/dashboard'
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/surveys"
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive('/dashboard/surveys')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Surveys
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive('/dashboard/analytics')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/dashboard/settings"
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive('/dashboard/settings')
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto container-padding py-8">
        {children}
      </main>
    </div>
  )
}