"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

import { getProjects } from "@/app/services/projectService";
import { ProjectsGrid } from "@/app/components/ui/ProjectsGrid";
import { ProjectsGridSkeleton } from "@/app/components/ui/ProjectsGridSkeleton";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import SectionTransition from "@/app/components/ui/SectionTransition";

export default function ProjectsPreviewSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects-preview"],
    // Fetch a generous amount so search works client-side, but we will only display 5 projects.
    queryFn: () => getProjects(1, 100),
    staleTime: 60 * 1000,
  });

  const projects = data?.projects ?? [];

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.trim().toLowerCase();
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.creator?.name &&
          project.creator.name.toLowerCase().includes(q)),
    );
  }, [projects, searchQuery]);

  const previewProjects = filteredProjects.slice(0, 5);

  return (
    <section
      id="projects-preview"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center"
    >
      {/* Simple separator between sections */}
      <SectionTransition />

      <motion.div
        className="max-w-6xl w-full mx-auto relative z-10 space-y-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Heading */}
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400">
            Explore Projects
          </h2>
          <p className="text-gray-300 max-w-2xl">
            Take a peek at what our community is building. Search for a project
            by name or browse some of the most recent submissions.
          </p>
        </div>

        {/* Search input */}
        <div className="max-w-md mx-auto w-full flex items-center gap-2">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 backdrop-blur-sm bg-gray-800/40 border-gray-700 placeholder-gray-400"
          />
          <Button
            variant="outline"
            size="icon"
            className="border-gray-700 bg-purple-500/10 hover:bg-purple-500/20"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <ProjectsGridSkeleton count={5} />
        ) : error ? (
          <div className="text-center text-red-400">
            Failed to load projects: {error.message}
          </div>
        ) : previewProjects.length === 0 ? (
          <div className="text-center text-gray-400">
            No projects found matching your search.
          </div>
        ) : (
          <ProjectsGrid projects={previewProjects} isMyProjects={false} />
        )}

        {/* Call to action */}
        <div className="flex justify-center">
          <Link href="/projects" passHref legacyBehavior>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="group bg-purple-600/20 hover:bg-purple-600/30 border text-white border-purple-500/30 backdrop-blur-sm"
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
              <a className="inline-flex items-center">
                View All Projects{" "}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
