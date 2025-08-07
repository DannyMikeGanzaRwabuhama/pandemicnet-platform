'use client'

import * as React from 'react'

interface OnboardingStatusProps {
  isClerkReady: boolean
  isPuterReady: boolean
  puterUuid: string | null
  error: string | null
  retry?: () => void
}

export function OnboardingStatus({
  isClerkReady,
  isPuterReady,
  puterUuid,
  error,
  retry
}: OnboardingStatusProps) {
  const getStatusIcon = (isComplete: boolean, isLoading: boolean) => {
    if (isComplete) {
      return <CheckIcon className="w-5 h-5 text-green-500" />
    }
    if (isLoading) {
      return <SpinnerIcon className="w-5 h-5 text-blue-500" />
    }
    return <PendingIcon className="w-5 h-5 text-gray-400" />
  }

  const steps = [
    {
      label: 'Authenticating with Clerk',
      isComplete: isClerkReady,
      isLoading: !isClerkReady && !error,
    },
    {
      label: 'Waiting for Puter UUID',
      isComplete: !!puterUuid,
      isLoading: isClerkReady && !puterUuid && !error,
    },
    {
      label: 'Initializing Puter',
      isComplete: isPuterReady,
      isLoading: !!puterUuid && !isPuterReady && !error,
    }
  ]

  const completedSteps = steps.filter(step => step.isComplete).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setting up your account
          </h1>
          <p className="text-gray-600">
            Please wait while we prepare your dashboard...
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ErrorIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Setup Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {retry && (
                  <button
                    onClick={retry}
                    className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border flex items-center space-x-3"
            >
              {getStatusIcon(step.isComplete, step.isLoading)}
              <span className={`text-sm font-medium ${
                step.isComplete ? 'text-green-700' : 
                step.isLoading ? 'text-blue-700' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {completedSteps} of {steps.length} steps completed
          </p>
        </div>
      </div>
    </div>
  )
}

// Icon components
function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function PendingIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  )
}

function ErrorIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}
