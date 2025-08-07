/**
 * TypeScript definitions for Clerk ⇄ Puter unified identity model
 * Defines the data structures for linking Clerk authentication with Puter cloud services
 */

declare global {
  namespace ClerkPuterIdentity {
    // Clerk User Metadata Extensions
    interface ClerkUserPublicMetadata {
      // Safe for frontend access - used for UI state and non-sensitive operations
      puterUuid?: string;           // Puter user UUID for account linking
      puterUsername?: string;       // Puter username for display
      puterAccountStatus?: 'active' | 'pending' | 'error' | 'suspended';
      puterAccountCreated?: string; // ISO timestamp
      hasPuterAccess?: boolean;     // Quick check for frontend components
      lastPuterSync?: string;       // ISO timestamp of last successful sync
    }

    interface ClerkUserPrivateMetadata {
      // Server-only access - never sent to client
      puterApiToken?: string;      // Server-to-server API token (if available)
      puterRefreshToken?: string;  // Refresh token for API access
      puterAccountDetails?: {
        accountType: string;       // Free, Pro, Enterprise, etc.
        storageQuota: number;      // In bytes
        apiCallsRemaining: number; // Rate limiting info
      };
      puterWebhookSecret?: string; // For validating Puter webhooks
      accountCreationRetries?: number; // Track retry attempts
      lastAccountCreationError?: string;
    }

    // Puter API Integration Types
    interface PuterAccountCreationRequest {
      // Based on available Puter API (to be confirmed with Puter.com)
      email: string;               // From Clerk user
      username?: string;           // Generated or from Clerk
      firstName?: string;          // From Clerk user data
      lastName?: string;           // From Clerk user data
      externalId: string;          // Clerk user ID for linking
      source: 'clerk_integration'; // Track integration source
      accountType: 'standard';     // Default account type
    }

    interface PuterAccountCreationResponse {
      success: boolean;
      uuid: string;                // Puter user UUID
      username: string;            // Confirmed username
      apiToken?: string;           // If server-to-server tokens supported
      error?: string;              // Error message if failed
    }

    // Service Layer Types
    interface PuterAccountServiceResult {
      success: boolean;
      puterUuid?: string;
      error?: string;
    }

    // Frontend Hook Types
    interface UsePuterAuthReturn {
      puterReady: boolean;
      puterError: string | null;
      puterUuid: string | undefined;
      puterUsername: string | undefined;
      hasPuterAccess: boolean;
      accountStatus: ClerkUserPublicMetadata['puterAccountStatus'];
    }

    // Webhook Types
    interface ClerkWebhookUserCreatedPayload {
      data: {
        id: string;
        email_addresses: Array<{
          email_address: string;
          id: string;
          verification?: {
            status: string;
            strategy: string;
          };
        }>;
        first_name?: string;
        last_name?: string;
        username?: string;
        created_at: number;
        updated_at: number;
        profile_image_url?: string;
        public_metadata: Record<string, any>;
        private_metadata: Record<string, any>;
      };
      object: 'event';
      type: 'user.created';
    }

    // Security & Audit Types
    interface IdentityAuditLog {
      timestamp: string;
      clerkUserId: string;
      puterUuid?: string;
      operation: 'create' | 'link' | 'access' | 'error' | 'unlink' | 'verify';
      details: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      success: boolean;
      errorMessage?: string;
    }

    interface PuterAccessVerificationResult {
      valid: boolean;
      clerkUserId: string;
      puterUuid: string;
      errorReason?: 'uuid_mismatch' | 'account_suspended' | 'no_access' | 'invalid_user';
    }

    // Environment Configuration
    interface EnvironmentConfig {
      clerkWebhookSecret: string;
      puterApiBase: string;
      puterApiKey?: string;          // Server-to-server key (if available)
      puterWebhookSecret?: string;   // For validating Puter webhooks
    }

    // Error Types
    interface PuterIntegrationError extends Error {
      code: 'ACCOUNT_CREATION_FAILED' | 'UUID_MISMATCH' | 'TOKEN_EXPIRED' | 'API_ERROR' | 'VERIFICATION_FAILED';
      clerkUserId?: string;
      puterUuid?: string;
      retryable: boolean;
    }

    // Monitoring & Metrics Types
    interface IdentityMetrics {
      accountCreationSuccessRate: number;
      authenticationSuccessRate: number;
      apiErrorRate: number;
      tokenRefreshFrequency: number;
      accountLinkingIntegrityViolations: number;
    }

    interface MetricAlert {
      condition: 'account_creation_failure_rate' | 'uuid_mismatch_errors' | 'webhook_signature_failures' | 'unusual_api_usage' | 'token_expiration_spikes';
      threshold: number;
      currentValue: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: string;
    }
  }
}

// Extend existing Clerk types to include our metadata
declare module '@clerk/types' {
  interface UserPublicMetadata extends ClerkPuterIdentity.ClerkUserPublicMetadata {}
  interface UserPrivateMetadata extends ClerkPuterIdentity.ClerkUserPrivateMetadata {}
}

// Extend existing Puter types to include identity linking
declare module './puter' {
  interface PuterUser {
    // Extend existing PuterUser with Clerk linkage info
    clerkUserId?: string;          // Link back to Clerk user
    accountSource?: string;        // Track how account was created
    lastClerkSync?: string;        // Last sync with Clerk
  }
}

export {};
