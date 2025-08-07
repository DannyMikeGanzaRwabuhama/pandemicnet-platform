'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePuterUser } from '@/lib/clerkPuter'
import { usePuterStore } from '@/store/usePuterStore'
import { initiatePuterOnboarding, completePuterOnboarding } from '@/app/actions/puter-onboarding'

interface OnboardingState {
  isClerkReady: boolean
  isPuterReady: boolean
  puterUuid: string | null
  puterUsername: string | null
  isComplete: boolean
  error: string | null
  requiresOnboarding: boolean
  isOnboarding: boolean
}

export function useOnboardingFlow() {
  const { user, isLoaded, puterUuid, puterUsername, isPuterReady: hasPuterMetadata } = usePuterUser()
  const { init: initPuter, puterReady, error: puterError, auth } = usePuterStore()
  
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isClerkReady: false,
    isPuterReady: false,
    puterUuid: null,
    puterUsername: null,
    isComplete: false,
    error: null,
    requiresOnboarding: false,
    isOnboarding: false,
  })

  // Start the onboarding process
  const startOnboarding = useCallback(async () => {
    if (onboardingState.isOnboarding) return
    
    setOnboardingState(prev => ({
      ...prev,
      isOnboarding: true,
      error: null,
    }))

    try {
      // Initiate server-side preparation
      const result = await initiatePuterOnboarding()
      
      if (!result.success) {
        setOnboardingState(prev => ({
          ...prev,
          error: result.error || 'Failed to start onboarding',
          isOnboarding: false,
        }))
        return
      }

      if (result.puterUuid && result.puterUsername) {
        // User already has account, just initialize Puter
        setOnboardingState(prev => ({
          ...prev,
          puterUuid: result.puterUuid!,
          puterUsername: result.puterUsername!,
          isOnboarding: false,
        }))
        
        await initPuter()
        return
      }

      if (result.requiresClientSignIn) {
        // Need to sign in with Puter.js client-side
        await handlePuterSignIn()
      }
      
    } catch (error) {
      setOnboardingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Onboarding failed',
        isOnboarding: false,
      }))
    }
  }, [onboardingState.isOnboarding, initPuter])

  // Handle Puter.js client-side sign-in
  const handlePuterSignIn = useCallback(async () => {
    try {
      // Initialize Puter.js if needed
      if (!puterReady) {
        await initPuter()
      }

      // Sign in to Puter.com
      await auth.signIn()
      
      // Get user info from Puter
      const puterUser = auth.getUser()
      
      if (!puterUser) {
        throw new Error('Failed to get Puter user information')
      }

      // Complete onboarding on server-side
      const result = await completePuterOnboarding(puterUser.uuid, puterUser.username)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete onboarding')
      }

      setOnboardingState(prev => ({
        ...prev,
        puterUuid: result.puterUuid!,
        puterUsername: result.puterUsername!,
        isOnboarding: false,
      }))
      
    } catch (error) {
      setOnboardingState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Puter sign-in failed',
        isOnboarding: false,
      }))
    }
  }, [puterReady, initPuter, auth])

  // Effect to handle Clerk ready state
  useEffect(() => {
    if (isLoaded && user) {
      const hasValidPuterAccount = puterUuid && hasPuterMetadata
      
      setOnboardingState(prev => ({
        ...prev,
        isClerkReady: true,
        puterUuid: puterUuid || null,
        puterUsername: puterUsername || null,
        requiresOnboarding: !hasValidPuterAccount,
        error: null,
      }))

      // If user has Puter account, initialize it
      if (hasValidPuterAccount) {
        initPuter().catch((error) => {
          setOnboardingState(prev => ({
            ...prev,
            error: `Failed to initialize Puter: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }))
        })
      }
    }
  }, [isLoaded, user, puterUuid, puterUsername, hasPuterMetadata, initPuter])

  // Effect to handle Puter ready state
  useEffect(() => {
    setOnboardingState(prev => ({
      ...prev,
      isPuterReady: puterReady,
      error: prev.error || puterError,
    }))
  }, [puterReady, puterError])

  // Effect to determine completion state
  useEffect(() => {
    const isComplete = onboardingState.isClerkReady && 
                      onboardingState.isPuterReady && 
                      onboardingState.puterUuid !== null &&
                      !onboardingState.error &&
                      !onboardingState.requiresOnboarding

    setOnboardingState(prev => ({
      ...prev,
      isComplete,
    }))
  }, [
    onboardingState.isClerkReady, 
    onboardingState.isPuterReady, 
    onboardingState.puterUuid, 
    onboardingState.error,
    onboardingState.requiresOnboarding
  ])

  return {
    ...onboardingState,
    isLoading: onboardingState.isOnboarding || (!onboardingState.isComplete && !onboardingState.error),
    user,
    startOnboarding,
    retry: () => {
      setOnboardingState(prev => ({
        ...prev,
        error: null,
      }))
      
      if (onboardingState.requiresOnboarding) {
        startOnboarding()
      } else if (onboardingState.puterUuid && !puterReady) {
        initPuter().catch((error) => {
          setOnboardingState(prev => ({
            ...prev,
            error: `Failed to initialize Puter: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }))
        })
      }
    }
  }
}
