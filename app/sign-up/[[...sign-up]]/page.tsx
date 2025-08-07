import { SignUp } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join PandemicNet
          </h1>
          <p className="text-gray-600">
            Create your account to access the pandemic response network
          </p>
        </div>
        
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'shadow-none border border-gray-200',
            },
          }}
        />
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            After signing up, we&#39;ll set up your secure Puter cloud workspace
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
