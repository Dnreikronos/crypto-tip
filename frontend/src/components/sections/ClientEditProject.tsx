"use client"

import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const EditProjectPage = dynamic(
  () => import('@/components/sections/EditProject'),
  {
    ssr: false,
    loading: () => <PageSkeleton />
  }
)

export default function ClientEditProject() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditProjectPage />
    </Suspense>
  )
}

function PageSkeleton() {
  useEffect(() => {
    const interval = setInterval(() => {
      document.querySelectorAll('.pulse-width').forEach(element => {
        const width = 30 + Math.floor(Math.random() * 70)
        ;(element as HTMLElement).style.width = `${width}%`
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen w-full bg-gray-950 p-4">
      <div className="container max-w-6xl mx-auto py-16">
        <div className="text-center mb-12">
          <div className="relative mx-auto mb-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-800 border border-cyan-500/10 animate-pulse" />
            <Skeleton className="h-8 w-8 rounded-full absolute bottom-0 right-0 translate-x-1/4 bg-purple-900/40 border border-purple-500/20 animate-pulse" />
          </div>

          <Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4 bg-gray-800 rounded-lg animate-pulse" />
          <div className="flex justify-center gap-2 items-center">
            <Skeleton className="h-6 w-1/4 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-6 w-1/6 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-6 w-1/5 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg p-6 md:p-8 shadow-lg">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-6 w-1/4 bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-6 w-1/2 bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-6 w-2/3 bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse pulse-width" />
            <Skeleton className="h-10 w-1/3 bg-gray-800 rounded-lg animate-pulse pulse-width" />
          </div>
        </div>
      </div>
    </div>
  )
} 