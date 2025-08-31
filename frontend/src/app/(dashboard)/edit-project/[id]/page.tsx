import AnimatedBackground from "@/app/components/ui/AnimatedBackground";
import ClientEditProject from "../_components/ClientEditProject";

export default function EditProjectRoute() {
  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      <AnimatedBackground />
      <div className="pt-20 pb-16 relative z-10">
        <ClientEditProject />
      </div>
    </div>
  );
}
