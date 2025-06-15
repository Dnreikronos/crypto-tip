"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ProjectFilters,
  ViewMode,
  SortField,
  SortOrder,
  ProjectStatus,
} from "@/components/ui/ProjectFilters";
import { ProjectsGrid } from "@/components/ui/ProjectsGrid";
import { ProjectsTable } from "@/components/ui/ProjectsTable";
import { EmptyStateModern } from "@/components/ui/EmptyStateModern";
import { ProjectsGridSkeleton } from "@/components/ui/ProjectsGridSkeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProjects } from "@/services/projectService";
import { z } from "zod";

// Validation schemas
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  goal: z.number(),
  wallet_addr: z.string(),
  project_link: z.string().url().optional(),
  repo_link: z.string().url().optional(),
  image_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  raised: z.number().default(0),
  creator: userSchema.optional(),
  user: userSchema.optional(), // Keep both for compatibility
});

const apiResponseSchema = z.object({
  projects: z.array(projectSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

type Project = z.infer<typeof projectSchema>;

// Custom hook for filtering and sorting projects
function useProjectFilters(projects: Project[]) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("all");

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          (project.user?.name &&
            project.user.name.toLowerCase().includes(query)) ||
          (project.creator?.name &&
            project.creator.name.toLowerCase().includes(query)),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => {
        const progress =
          project.goal > 0 ? (project.raised / project.goal) * 100 : 0;

        switch (statusFilter) {
          case "completed":
            return progress >= 100;
          case "active":
            return progress > 0 && progress < 100;
          case "archived":
            return false; // This would need to be implemented in the backend
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "goal":
          aValue = a.goal;
          bValue = b.goal;
          break;
        case "raised":
          aValue = a.raised || 0;
          bValue = b.raised || 0;
          break;
        case "progress":
          aValue = a.goal > 0 ? (a.raised || 0) / a.goal : 0;
          bValue = b.goal > 0 ? (b.raised || 0) / b.goal : 0;
          break;
        case "created_at":
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, sortField, sortOrder]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("created_at");
    setSortOrder("desc");
  };

  return {
    // State
    viewMode,
    searchQuery,
    sortField,
    sortOrder,
    statusFilter,
    // Setters
    setViewMode,
    setSearchQuery,
    setSortField,
    setSortOrder,
    setStatusFilter,
    // Derived
    filteredAndSortedProjects,
    hasActiveFilters,
    clearFilters,
  };
}

export default function ProjectsContentModern() {
  const [page, setPage] = useState(1);
  const limit = 12; // Increased for better grid layout

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      const response = await getProjects(page, limit);
      return apiResponseSchema.parse(response);
    },
  });

  const {
    viewMode,
    searchQuery,
    sortField,
    sortOrder,
    statusFilter,
    setViewMode,
    setSearchQuery,
    setSortField,
    setSortOrder,
    setStatusFilter,
    filteredAndSortedProjects,
    hasActiveFilters,
    clearFilters,
  } = useProjectFilters(data?.projects || []);

  // Determine empty state variant
  const getEmptyStateVariant = ():
    | "no-projects"
    | "no-results"
    | "filtered"
    | "no-public-projects" => {
    if (!data?.projects || data.projects.length === 0)
      return "no-public-projects";
    if (filteredAndSortedProjects.length === 0 && hasActiveFilters) {
      return searchQuery.trim() ? "no-results" : "filtered";
    }
    return "no-public-projects";
  };

  if (error) {
    return (
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
        <PageHeader
          title="Error"
          description="Something went wrong while loading projects"
        />
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400">{error.message}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
        <PageHeader
          title="Discover Projects"
          description="Explore and support innovative blockchain projects from our community"
        />
        <div className="space-y-6">
          {/* Filters skeleton */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="h-10 bg-gray-800 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-6 bg-gray-800 rounded animate-pulse" />
                <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
                <div className="w-20 h-8 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <ProjectsGridSkeleton />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
        <PageHeader title="Error" description="No data available" />
      </main>
    );
  }

  const { projects, pagination } = data;

  return (
    <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
      <PageHeader
        title="Discover Projects"
        description="Explore and support innovative blockchain projects from our community"
      />

      <motion.div
        className="space-y-6 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Only show filters if there are projects */}
        {projects.length > 0 && (
          <ProjectFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            projectCount={filteredAndSortedProjects.length}
          />
        )}

        {/* Content */}
        {filteredAndSortedProjects.length === 0 ? (
          <EmptyStateModern
            variant={getEmptyStateVariant()}
            searchQuery={searchQuery}
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "grid" ? (
              <ProjectsGrid
                projects={filteredAndSortedProjects}
                isMyProjects={false}
              />
            ) : (
              <ProjectsTable
                initialProjects={filteredAndSortedProjects}
                isMyProjects={false}
              />
            )}
          </motion.div>
        )}

        {/* Modern Pagination */}
        {projects.length > 0 && (
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-purple-500/20 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="text-sm text-gray-400">
              Showing{" "}
              <span className="text-cyan-400 font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="text-cyan-400 font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="text-purple-400 font-medium">
                {pagination.total}
              </span>{" "}
              projects
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page === 1}
                className="border-purple-500/30 text-purple-400 hover:scale-105 transition-all duration-300 bg-black/30 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                <span className="text-sm text-gray-400">Page</span>
                <span className="text-sm font-medium text-purple-400">
                  {pagination.page}
                </span>
                <span className="text-sm text-gray-400">of</span>
                <span className="text-sm font-medium text-purple-400">
                  {pagination.pages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage((p) => Math.min(pagination.pages, p + 1));
                }}
                disabled={pagination.page === pagination.pages}
                className="border-cyan-500/30 text-cyan-400 hover:scale-105 transition-all duration-300 bg-black/30 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
