"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectsTable } from "@/components/ui/ProjectsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { getProjects } from "./getProjects";
import { Suspense } from "react";

export default function ProjectsContent() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <Projects />
    </Suspense>
  );
}

function Projects() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["my-projects"],
    queryFn: getProjects,
  });

  if (projects.length === 0) return <EmptyState />;
  return <ProjectsTable initialProjects={projects} isMyProjects={true} />;
}
