"use client";

import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ProjectFilters, ViewMode, SortField, SortOrder, ProjectStatus } from "@/components/ui/ProjectFilters";
import { ProjectsGrid } from "@/components/ui/ProjectsGrid";
import { ProjectsTable } from "@/components/ui/ProjectsTable";
import { EmptyStateModern } from "@/components/ui/EmptyStateModern";
import { ProjectsGridSkeleton } from "@/components/ui/ProjectsGridSkeleton";
import { getProjects, Project } from "./getProjects";
import { Suspense } from "react";

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
          project.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => {
        const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;
        
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
  return (
    <Suspense 
      fallback={
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
          {/* Content skeleton */}
          <ProjectsGridSkeleton />
        </div>
      }
    >
      <Projects />
    </Suspense>
  );
}

function Projects() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["my-projects"],
    queryFn: getProjects,
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
  } = useProjectFilters(projects);

  // Determine empty state variant
  const getEmptyStateVariant = (): "no-projects" | "no-results" | "filtered" => {
    if (projects.length === 0) return "no-projects";
    if (filteredAndSortedProjects.length === 0 && hasActiveFilters) {
      return searchQuery.trim() ? "no-results" : "filtered";
    }
    return "no-projects";
  };

  return (
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
          key={viewMode} // Re-animate when view mode changes
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === "grid" ? (
            <ProjectsGrid 
              projects={filteredAndSortedProjects} 
              isMyProjects={true} 
            />
          ) : (
            <ProjectsTable 
              initialProjects={filteredAndSortedProjects} 
              isMyProjects={true} 
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 