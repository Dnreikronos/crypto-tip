"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

const CreateProjectPage = dynamic(() => import("./CreateProject"), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

export default function ClientCreateProject() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CreateProjectPage />
    </Suspense>
  );
}

function PageSkeleton() {
  useEffect(() => {
    const interval = setInterval(() => {
      document.querySelectorAll(".pulse-width").forEach((element) => {
        const width = 30 + Math.floor(Math.random() * 70); // Random width between 30-100%
        (element as HTMLElement).style.width = `${width}%`;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative">
      {/* Animated background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>

      {/* Floating particles skeleton */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4 bg-gray-800 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Project Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="bg-gray-900/80 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="p-6 space-y-4">
                {/* Image placeholder */}
                <Skeleton className="w-full h-48 bg-gray-800 rounded-xl animate-pulse" />

                {/* Title */}
                <Skeleton className="h-6 w-3/4 bg-gray-800 rounded animate-pulse" />

                {/* Description lines */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-800 rounded animate-pulse pulse-width" />
                  <Skeleton className="h-4 w-5/6 bg-gray-800 rounded animate-pulse pulse-width" />
                  <Skeleton className="h-4 w-4/5 bg-gray-800 rounded animate-pulse pulse-width" />
                </div>

                {/* Project links */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 bg-purple-900/40 border border-purple-500/20 rounded-lg animate-pulse" />
                  <Skeleton className="h-8 w-24 bg-cyan-900/40 border border-cyan-500/20 rounded-lg animate-pulse" />
                </div>

                {/* Progress section */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                    <Skeleton className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                  </div>
                  <Skeleton className="h-2 w-full bg-gray-700 rounded-full animate-pulse">
                    <div className="h-full w-1/3 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 rounded-full"></div>
                  </Skeleton>
                  <Skeleton className="h-3 w-16 bg-gray-800 rounded animate-pulse mx-auto" />
                </div>

                {/* ETH price */}
                <Skeleton className="h-3 w-32 bg-gray-800 rounded animate-pulse mx-auto" />

                {/* Creator info */}
                <div className="pt-4 border-t border-gray-800">
                  <Skeleton className="h-3 w-20 bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 bg-gradient-to-br from-purple-500/50 to-cyan-500/50 rounded-full animate-pulse" />
                    <div>
                      <Skeleton className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-1" />
                      <Skeleton className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </Skeleton>
          </div>

          {/* Right Column - Donation Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="bg-gray-900/80 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                {/* Header section */}
                <div className="text-center space-y-4">
                  <Skeleton className="h-8 w-40 bg-purple-900/40 border border-purple-500/20 rounded-full animate-pulse mx-auto" />
                  <Skeleton className="h-8 w-64 bg-gray-800 rounded animate-pulse mx-auto" />
                  <Skeleton className="h-4 w-80 bg-gray-800 rounded animate-pulse mx-auto" />
                </div>

                {/* Share section */}
                <Skeleton className="h-12 w-full bg-gray-800/50 border border-gray-700 rounded-xl animate-pulse" />

                {/* Donation presets */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 bg-cyan-900/40 rounded animate-pulse" />
                    <Skeleton className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton
                        key={item}
                        className="h-20 bg-gray-800/50 border border-gray-600 rounded-xl animate-pulse p-4"
                      >
                        <div className="flex justify-between items-start h-full">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
                            <Skeleton className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
                            <Skeleton className="h-3 w-18 bg-gray-700 rounded animate-pulse" />
                          </div>
                          <Skeleton className="h-6 w-8 bg-gray-700 rounded animate-pulse" />
                        </div>
                      </Skeleton>
                    ))}
                  </div>

                  {/* Custom amount input */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                    <Skeleton className="h-14 w-full bg-gray-800/50 border border-gray-600 rounded-xl animate-pulse" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                      <Skeleton className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Message section */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
                  <Skeleton className="h-20 w-full bg-gray-800 border border-gray-600 rounded-xl animate-pulse" />

                  {/* Anonymous toggle */}
                  <Skeleton className="h-12 w-full bg-gray-800/50 rounded-lg animate-pulse p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
                        <Skeleton className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
                      </div>
                      <Skeleton className="h-6 w-11 bg-gray-600 rounded-full animate-pulse" />
                    </div>
                  </Skeleton>
                </div>

                {/* Donate button */}
                <Skeleton className="h-14 w-full bg-gradient-to-r from-purple-800/60 to-cyan-800/60 rounded-xl animate-pulse flex items-center justify-center gap-2">
                  <Skeleton className="h-5 w-5 bg-white/30 rounded animate-pulse" />
                  <Skeleton className="h-4 w-48 bg-white/30 rounded animate-pulse" />
                  <Skeleton className="h-5 w-5 bg-white/30 rounded animate-pulse" />
                </Skeleton>
              </div>
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}
