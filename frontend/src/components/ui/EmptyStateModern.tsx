"use client";

import { motion } from "framer-motion";
import { Plus, Rocket, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyStateModernProps {
  variant?: "no-projects" | "no-results" | "filtered" | "no-public-projects";
  searchQuery?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export function EmptyStateModern({
  variant = "no-projects",
  searchQuery,
  hasFilters,
  onClearFilters,
}: EmptyStateModernProps) {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/create-project");
  };

  const getContent = () => {
    switch (variant) {
      case "no-results":
        return {
          icon: Search,
          title: "No projects found",
          description: searchQuery
            ? `No projects match "${searchQuery}". Try adjusting your search terms.`
            : "No projects match your current search.",
          actions: (
            <div className="flex flex-col sm:flex-row gap-3">
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          ),
        };

      case "filtered":
        return {
          icon: Filter,
          title: "No matching projects",
          description: "No projects match your current filter criteria. Try adjusting your filters or create a new project.",
          actions: (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
              <Button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ),
        };

      case "no-public-projects":
        return {
          icon: Rocket,
          title: "No projects available yet",
          description: "Be the first to share your innovative project with the community. Create a project and inspire others to support your vision.",
          actions: (
            <Button
              onClick={handleCreateProject}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 font-medium px-8 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create First Project
            </Button>
          ),
        };

      default: // no-projects
        return {
          icon: Rocket,
          title: "Ready to launch your first project?",
          description: "Transform your ideas into funded reality. Create your first project and start connecting with supporters who believe in your vision.",
          actions: (
            <Button
              onClick={handleCreateProject}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 font-medium px-8 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Project
            </Button>
          ),
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="relative mb-8"
        variants={itemVariants}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-3xl rounded-full scale-150" />
        
        {/* Icon container */}
        <div className="relative bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <IconComponent className="h-12 w-12 text-purple-400 mx-auto" />
        </div>
      </motion.div>

      <motion.div className="max-w-md space-y-4" variants={itemVariants}>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {content.title}
        </h3>
        <p className="text-gray-400 leading-relaxed">
          {content.description}
        </p>
      </motion.div>

      <motion.div className="mt-8" variants={itemVariants}>
        {content.actions}
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-500/30 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/40 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 2,
        }}
      />
    </motion.div>
  );
} 