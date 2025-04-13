import { Suspense } from 'react';
import { ProjectsTable } from '@/components/ui/ProjectsTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { getProjects } from './_data/projects';

export default async function MyProjectsPage() {
  const projects = await getProjects();
  
  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen">
      <AnimatedBackground />
      
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <PageHeader />
        
        <Suspense fallback={<TableSkeleton />}>
          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <ProjectsTable initialProjects={projects} />
          )}
        </Suspense>
      </main>
    </div>
  );
}