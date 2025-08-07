'use client'

import * as React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width = 'w-full', height = 'h-4' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-300 rounded ${width} ${height} ${className}`}
      style={{ backgroundColor: '#e5e7eb' }}
    />
  )
}

export function OnboardingSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-2">
          <Skeleton height="h-8" width="w-3/4" className="mx-auto" />
          <Skeleton height="h-4" width="w-1/2" className="mx-auto" />
        </div>

        {/* Status cards skeleton */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center space-x-3">
              <Skeleton width="w-5" height="h-5" className="rounded-full" />
              <div className="flex-1">
                <Skeleton height="h-4" width="w-32" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center space-x-3">
              <Skeleton width="w-5" height="h-5" className="rounded-full" />
              <div className="flex-1">
                <Skeleton height="h-4" width="w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <Skeleton height="h-2" width="w-full" className="rounded-full" />
          <Skeleton height="h-3" width="w-24" className="mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeletonLoader() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton height="h-8" width="w-48" />
          <Skeleton width="w-10" height="h-10" className="rounded-full" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
              <Skeleton height="h-4" width="w-24" className="mb-2" />
              <Skeleton height="h-8" width="w-16" />
            </div>
          ))}
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <Skeleton height="h-6" width="w-32" className="mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton width="w-8" height="h-8" className="rounded" />
                  <div className="flex-1">
                    <Skeleton height="h-4" width="w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <Skeleton height="h-6" width="w-40" className="mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton height="h-4" width="w-3/4" />
                  <Skeleton height="h-3" width="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
