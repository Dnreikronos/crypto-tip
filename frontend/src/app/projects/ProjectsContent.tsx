"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectsTable } from "@/components/ui/ProjectsTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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
  created_at: z.string(),
  updated_at: z.string(),
  raised: z.number().default(0),
  user: userSchema.optional(),
});

// Schema for the entire API response, including pagination
const apiResponseSchema = z.object({
  projects: z.array(projectSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export default function ProjectsContent() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      const response = await getProjects(page, limit);
      // Validate the fetched data against the schema
      return apiResponseSchema.parse(response);
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Error"
          description="Something went wrong while loading projects"
        />
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Discover Projects"
          description="Explore and support innovative blockchain projects from our community"
        />
        <TableSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Error" description="No data available" />
      </div>
    );
  }

  const { projects, pagination } = data;

  console.log("Current Page:", pagination.page);
  console.log("Total Pages:", pagination.pages);
  console.log(
    "Is Next button disabled?:",
    pagination.page === pagination.pages,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Discover Projects"
        description="Explore and support innovative blockchain projects from our community"
      />
      <ProjectsTable initialProjects={projects} isMyProjects={false} />

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} projects
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log(
                "Previous button clicked. Current page before update:",
                page,
              );
              setPage((p) => {
                const newPage = Math.max(1, p - 1);
                console.log("New page after Previous click:", newPage);
                return newPage;
              });
            }}
            disabled={page === 1}
            style={{ pointerEvents: "auto", zIndex: 1000 }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log(
                "Next button clicked. Current page before update:",
                page,
              );
              setPage((p) => {
                const newPage = Math.min(pagination.pages, p + 1);
                console.log("New page after Next click:", newPage);
                return newPage;
              });
            }}
            disabled={pagination.page === pagination.pages}
            style={{ pointerEvents: "auto", zIndex: 1000 }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
