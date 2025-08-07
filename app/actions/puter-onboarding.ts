'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'

interface OnboardingResult {
  success: boolean
  puterUuid?: string
  puterUsername?: string
  error?: string
  requiresClientSignIn?: boolean
}

/**
 * Server Action to initiate Puter.js onboarding flow
 * This prepares the user account and coordinates with client-side Puter.js auth
 */
export async function initiatePuterOnboarding(): Promise<OnboardingResult> {
  try {
    // Verify user authentication with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated with Clerk'
      }
    }

    // Get current user from Clerk
    const user = await (await clerkClient()).users.getUser(userId)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found in Clerk'
      }
    }

    // Check if user already has a Puter UUID (idempotency check)
    const existingPuterUuid = user.publicMetadata?.puterUuid as string | undefined
    const hasPuterAccess = user.publicMetadata?.hasPuterAccess as boolean | undefined

    if (existingPuterUuid && hasPuterAccess) {
      Sentry.addBreadcrumb({
        message: 'User already has active Puter account',
        data: { 
          clerkUserId: userId, 
          puterUuid: existingPuterUuid 
        },
        level: 'info'
      })

      return {
        success: true,
        puterUuid: existingPuterUuid,
        puterUsername: user.publicMetadata?.puterUsername as string | undefined,
      }
    }

    // Set user status to pending while onboarding is in progress
    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        puterAccountStatus: 'pending',
        hasPuterAccess: false,
        lastPuterSync: new Date().toISOString(),
      }
    })

    Sentry.addBreadcrumb({
      message: 'Puter onboarding initiated - client-side auth required',
      data: { clerkUserId: userId },
      level: 'info'
    })

    // Return success but indicate client-side Puter sign-in is required
    // This follows Puter.js's client-side authentication model
    return {
      success: true,
      requiresClientSignIn: true,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Puter onboarding initiation error:', error)
    
    Sentry.captureException(error, {
      tags: { 
        operation: 'puter_onboarding_initiate',
        userId: (await auth()).userId 
      }
    })
    
    return {
      success: false,
      error: `Failed to initiate onboarding: ${errorMessage}`
    }
  }
}

/**
 * Server Action to complete Puter onboarding after successful client-side auth
 * Called after the client successfully authenticates with Puter.js
 */
export async function completePuterOnboarding(
  puterUuid: string, 
  puterUsername: string
): Promise<OnboardingResult> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated with Clerk'
      }
    }

    // Validate required Puter credentials
    if (!puterUuid || !puterUsername) {
      return {
        success: false,
        error: 'Missing required Puter credentials (UUID or username)'
      }
    }

    // Validate UUID format (basic check)
    if (puterUuid.length < 10) {
      return {
        success: false,
        error: 'Invalid Puter UUID format'
      }
    }

    // Get current user to preserve existing metadata
    const user = await (await clerkClient()).users.getUser(userId)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found in Clerk'
      }
    }

    // Update Clerk user metadata with Puter account information
    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        puterUuid,
        puterUsername,
        puterAccountStatus: 'active',
        puterAccountCreated: new Date().toISOString(),
        hasPuterAccess: true,
        lastPuterSync: new Date().toISOString(),
      },
      privateMetadata: {
        ...user.privateMetadata,
        accountCreationRetries: 0,
        lastAccountCreationError: undefined,
      }
    })

    // Log successful completion for monitoring
    Sentry.addBreadcrumb({
      message: 'Puter onboarding completed successfully',
      data: {
        clerkUserId: userId,
        puterUuid,
        puterUsername
      },
      level: 'info'
    })

    // Revalidate cached user data across the app
    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      puterUuid,
      puterUsername,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Puter onboarding completion error:', error)
    
    Sentry.captureException(error, {
      tags: { 
        operation: 'puter_onboarding_complete',
        puterUuid,
      }
    })
    
    // Try to update user status to error state for debugging
    try {
      const { userId } = await auth()
      if (userId) {
        await (await clerkClient()).users.updateUser(userId, {
          publicMetadata: {
            puterAccountStatus: 'error',
            hasPuterAccess: false,
            lastPuterSync: new Date().toISOString(),
          },
          privateMetadata: {
            lastAccountCreationError: errorMessage,
          }
        })
      }
    } catch (metadataError) {
      Sentry.captureException(metadataError, {
        tags: { operation: 'error_metadata_update' }
      })
    }
    
    return {
      success: false,
      error: `Failed to complete onboarding: ${errorMessage}`
    }
  }
}

/**
 * Server Action to verify existing Puter account status
 * Used for checking account status and refreshing sync timestamp
 */
export async function verifyPuterAccount(): Promise<OnboardingResult> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated with Clerk'
      }
    }

    const user = await (await clerkClient()).users.getUser(userId)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found in Clerk'
      }
    }

    const puterUuid = user.publicMetadata?.puterUuid as string | undefined
    const puterUsername = user.publicMetadata?.puterUsername as string | undefined
    const hasPuterAccess = user.publicMetadata?.hasPuterAccess as boolean | undefined

    if (!puterUuid) {
      return {
        success: false,
        error: 'No Puter account linked to this user',
        requiresClientSignIn: true,
      }
    }

    if (!hasPuterAccess) {
      return {
        success: false,
        error: 'Puter account exists but access is disabled',
        requiresClientSignIn: true,
      }
    }

    // Update last sync time to track account activity
    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        lastPuterSync: new Date().toISOString(),
        puterAccountStatus: 'active',
      }
    })

    Sentry.addBreadcrumb({
      message: 'Puter account verification successful',
      data: { clerkUserId: userId, puterUuid },
      level: 'info'
    })

    return {
      success: true,
      puterUuid,
      puterUsername,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Puter account verification error:', error)
    
    Sentry.captureException(error, {
      tags: { 
        operation: 'puter_account_verify',
        userId: (await auth()).userId 
      }
    })
    
    return {
      success: false,
      error: `Account verification failed: ${errorMessage}`
    }
  }
}
