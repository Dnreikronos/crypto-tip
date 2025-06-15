import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ProjectsContentModern from "./ProjectsContentModern";

export default function ProjectsPage() {
  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <ProjectsContentModern />
    </div>
  );
}
