'use client'

import * as React from 'react'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { OnboardingStatus } from '@/components/OnboardingStatus'
import { DashboardSkeletonLoader } from '@/components/SkeletonLoader'
import { SignInButton } from '@clerk/nextjs'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const {
    isComplete,
    isLoading,
    isClerkReady,
    isPuterReady,
    puterUuid,
    error,
    user,
    retry
  } = useOnboardingFlow()

  // Show sign-in if user is not authenticated
  if (!user && isClerkReady) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to PandemicNet
            </h1>
            <p className="text-gray-600">
              Please sign in to access your dashboard
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  // Show onboarding status if not complete
  if (user && !isComplete) {
    return (
      <OnboardingStatus
        isClerkReady={isClerkReady}
        isPuterReady={isPuterReady}
        puterUuid={puterUuid}
        error={error}
        retry={retry}
      />
    )
  }

  // Show loading state briefly while everything finalizes
  if (isLoading) {
    return <DashboardSkeletonLoader />
  }

  // Everything is ready - show the actual content
  return <>{children}</>
}

// Helper component for protecting authenticated routes
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You must be signed in to view this page
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    }>
      {children}
    </AuthWrapper>
  )
}
