'use client'

import { usePuterUser, hasValidPuterMetadata } from '@/lib/clerkPuter'

interface PuterUserInfoProps {
  className?: string
}

/**
 * Example component demonstrating type-safe access to Puter user metadata
 * Uses the usePuterUser hook to eliminate `as any` casting
 */
export function PuterUserInfo({ className }: PuterUserInfoProps) {
  const { 
    user, 
    isLoaded, 
    puterUuid, 
    puterUsername, 
    puterAccountStatus, 
    hasPuterAccess,
    isPuterReady,
    puterAccountCreated 
  } = usePuterUser()

  if (!isLoaded) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Not authenticated
      </div>
    )
  }

  // Type-safe check using type guard
  if (!hasValidPuterMetadata(user)) {
    return (
      <div className={`text-orange-600 text-sm ${className}`}>
        Puter account not yet configured
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isPuterReady ? 'bg-green-500' : 'bg-orange-500'
        }`} />
        <span className="text-sm font-medium">
          {puterUsername || 'Puter User'}
        </span>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          <span className="font-medium">UUID:</span> {puterUuid?.slice(0, 8)}...
        </div>
        
        {puterAccountStatus && (
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
              puterAccountStatus === 'active' 
                ? 'bg-green-100 text-green-800'
                : puterAccountStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {puterAccountStatus}
            </span>
          </div>
        )}
        
        <div>
          <span className="font-medium">Access:</span>
          <span className={`ml-1 ${hasPuterAccess ? 'text-green-600' : 'text-orange-600'}`}>
            {hasPuterAccess ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        {puterAccountCreated && (
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-1">
              {new Date(puterAccountCreated).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for displaying in headers or status bars
 */
export function PuterUserBadge({ className }: PuterUserInfoProps) {
  const { puterUsername, isPuterReady, isLoaded } = usePuterUser()

  if (!isLoaded) {
    return <div className={`w-16 h-4 bg-gray-200 rounded animate-pulse ${className}`} />
  }

  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        isPuterReady ? 'bg-green-500' : 'bg-gray-400'
      }`} />
      <span className="text-gray-600">
        {puterUsername || 'Guest'}
      </span>
    </div>
  )
}
