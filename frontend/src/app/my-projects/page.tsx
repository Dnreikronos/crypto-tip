import { PageHeader } from "@/components/ui/PageHeader";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ProjectsContentModern from "./ProjectsContentModern";

export default function MyProjectsPage() {
  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 w-full">
        <PageHeader
          title="My Projects"
          description="Manage and track your funding projects"
          showCreateButton
        />
        <ProjectsContentModern />
      </main>
    </div>
  );
}
