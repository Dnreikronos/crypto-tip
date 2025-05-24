"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectsTable } from "@/components/ui/ProjectsTable";
import TableSkeleton from "@/components/ui/TableSkeleton";

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

const projectsSchema = z.array(projectSchema);

// API functions
async function fetchProjects() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();
  return projectsSchema.parse(data);
}

export default function ProjectsContent() {
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Discover Projects"
        description="Explore and support innovative blockchain projects from our community"
      />
      <ProjectsTable initialProjects={projects || []} isMyProjects={false} />
    </div>
  );
}
