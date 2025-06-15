"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectsGridSkeletonProps {
  count?: number;
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function ProjectsGridSkeleton({ count = 6 }: ProjectsGridSkeletonProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="group relative"
        >
          <div className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur-sm">
            {/* Image Skeleton */}
            <div className="relative h-48 w-full">
              <Skeleton className="h-full w-full bg-gray-800" />
              {/* Status Badge and Menu overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <Skeleton className="h-5 w-16 bg-gray-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title and Description */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-full bg-gray-800" />
                <Skeleton className="h-4 w-2/3 bg-gray-800" />
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-12 bg-gray-800" />
                  <Skeleton className="h-3 w-8 bg-gray-800" />
                </div>
                <Skeleton className="h-2 w-full bg-gray-800 rounded-full" />
              </div>

              {/* Funding Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-8 bg-gray-800" />
                  <Skeleton className="h-4 w-16 bg-gray-800" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10 bg-gray-800" />
                  <Skeleton className="h-4 w-16 bg-gray-800" />
                </div>
              </div>

              {/* Created Date */}
              <div className="mb-4">
                <Skeleton className="h-3 w-24 bg-gray-800" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 bg-gray-800 rounded" />
                <Skeleton className="h-8 flex-1 bg-gray-800 rounded" />
              </div>
            </div>

            {/* Subtle animation overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-xl pointer-events-none"
              animate={{
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
