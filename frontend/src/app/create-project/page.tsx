import ClientCreateProject from "@/components/sections/ClientCreateProject";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function CreateProjectRoute() {
  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      <AnimatedBackground />
      <div className="pt-20 pb-16 relative z-10">
        <ClientCreateProject />
      </div>
    </div>
  );
}
