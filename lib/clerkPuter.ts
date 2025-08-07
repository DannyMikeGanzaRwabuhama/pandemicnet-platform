'use client'

import { useUser } from '@clerk/nextjs'
import type { UserResource } from '@clerk/types'

/**
 * Extended Clerk UserResource type with type-safe Puter metadata
 */
export type ClerkWithPuter = UserResource & {
  publicMetadata: {
    puterUuid?: string
    puterUsername?: string
    puterAccountStatus?: 'active' | 'pending' | 'error' | 'suspended'
    puterAccountCreated?: string
    hasPuterAccess?: boolean
    lastPuterSync?: string
  }
}

/**
 * Type-safe hook for accessing Clerk user with Puter metadata
 * Eliminates the need for `as any` casting throughout the application
 */
export const usePuterUser = () => {
  const { user, isLoaded, isSignedIn } = useUser()

  // Type-safe casting of user with Puter metadata
  const puterUser = user as ClerkWithPuter | null

  return {
    user: puterUser,
    isLoaded,
    isSignedIn,
    // Convenience getters for Puter-specific metadata
    puterUuid: puterUser?.publicMetadata?.puterUuid,
    puterUsername: puterUser?.publicMetadata?.puterUsername,
    puterAccountStatus: puterUser?.publicMetadata?.puterAccountStatus,
    hasPuterAccess: puterUser?.publicMetadata?.hasPuterAccess ?? false,
    isPuterReady: !!(puterUser?.publicMetadata?.puterUuid && puterUser?.publicMetadata?.hasPuterAccess),
    lastPuterSync: puterUser?.publicMetadata?.lastPuterSync,
    puterAccountCreated: puterUser?.publicMetadata?.puterAccountCreated,
  }
}

/**
 * Type guard to check if a Clerk user has Puter metadata
 */
export const hasValidPuterMetadata = (user: UserResource | null): user is ClerkWithPuter => {
  if (!user) return false
  return !!(user.publicMetadata as ClerkWithPuter['publicMetadata'])?.puterUuid
}

/**
 * Helper to safely extract Puter UUID from any Clerk user object
 */
export const getPuterUuid = (user: UserResource | null): string | null => {
  if (!user) return null
  return (user.publicMetadata as ClerkWithPuter['publicMetadata'])?.puterUuid ?? null
}

/**
 * Helper to safely check if user has Puter access
 */
export const hasPuterAccess = (user: UserResource | null): boolean => {
  if (!user) return false
  const metadata = user.publicMetadata as ClerkWithPuter['publicMetadata']
  return !!(metadata?.puterUuid && metadata?.hasPuterAccess)
}
