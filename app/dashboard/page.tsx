'use client'

import { UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { AuthWrapper } from '@/components/AuthWrapper'
import { usePuterUser } from '@/lib/clerkPuter'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">
              PandemicNet Dashboard
            </h1>
            <UserButton />
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <DashboardContent />
        </main>
      </div>
    </AuthWrapper>
  )
}

function DashboardContent() {
  const router = useRouter()
  const messages = useQuery(api.messages.getForCurrentUser)
  const { puterUuid, puterUsername, puterAccountStatus, hasPuterAccess } = usePuterUser()
  const { requiresOnboarding, isComplete } = useOnboardingFlow()

  // Redirect to onboarding if needed
  useEffect(() => {
    if (requiresOnboarding && !isComplete) {
      router.push('/onboarding')
    }
  }, [requiresOnboarding, isComplete, router])

  if (requiresOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking your setup...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Welcome to PandemicNet{puterUsername ? `, ${puterUsername}` : ''}!
        </h2>
        <p className="text-blue-700">
          Your Clerk and Puter integration is working correctly. Both services are now ready.
        </p>
        {puterUuid && (
          <div className="mt-3 text-sm text-blue-600">
            <span className="font-medium">Puter ID:</span> {puterUuid.slice(0, 8)}...
            {puterAccountStatus && (
              <span className="ml-3">
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  puterAccountStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {puterAccountStatus}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Messages
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {messages?.length ?? 0}
          </p>
        </div>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Status
          </h3>
          <p className="text-2xl font-bold text-green-600">
            Online
          </p>
        </div>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Puter Access
          </h3>
          <p className={`text-2xl font-bold ${
            hasPuterAccess ? 'text-green-600' : 'text-orange-600'
          }`}>
            {hasPuterAccess ? 'Active' : 'Pending'}
          </p>
        </div>
      </div>

      {/* Content section */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Getting Started
        </h3>
        <div className="prose text-gray-600">
          <p className="mb-4">
            Your account has been successfully set up with both Clerk authentication 
            and Puter cloud services. You can now:
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Access secure file storage through Puter</li>
            <li>Manage your profile with Clerk authentication</li>
            <li>Collaborate with other users in the pandemic network</li>
            <li>View real-time updates and statistics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
