"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const CreateProjectPage = dynamic(
  () => import('@/components/sections/CreateProject'),
  { 
    ssr: false,
    loading: () => <PageSkeleton />
  }
)

export default function ClientCreateProject() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CreateProjectPage />
    </Suspense>
  )
}

function PageSkeleton() {
    return (
      <div className="min-h-screen w-full bg-crypto-dark-bg p-4">
        <div className="container max-w-6xl mx-auto py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 max-w-md mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="h-[600px] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-[200px] rounded-2xl" />
              <Skeleton className="h-[300px] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }