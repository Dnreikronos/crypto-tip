'use client';



import ProjectsContent from './ProjectsContent';
import AnimatedBackground from '@/components/ui/AnimatedBackground';


export default function ProjectsPage() {
  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen">
      <AnimatedBackground />
      <ProjectsContent />
    </div>
  );
} 