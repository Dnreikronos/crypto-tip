import HeroSection from "./_components/HeroSection";
import FeaturesSection from "./_components/FeaturesSection";
import HowItWorksSection from "./_components/HowItWorksSection";
import ProjectsPreviewSection from "./_components/ProjectsPreviewSection";
// import ShowcaseSection from "./_components/ShowcaseSection";
// import TestimonialsSection from "./_components/TestimonialsSection";
import FaqSection from "./_components/FaqSection";
import CtaSection from "./_components/CtaSection";
import AnimatedBackground from "@/app/components/ui/AnimatedBackground";
import MagneticCursor from "@/app/components/ui/MagneticCursor";
import ScrollProgress from "@/app/components/ui/ScrollProgress";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />
      <MagneticCursor />
      <ScrollProgress />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <ProjectsPreviewSection />
        <FeaturesSection />
        <HowItWorksSection />
        {/* <ShowcaseSection />
        <TestimonialsSection /> */}
        <FaqSection />
        <CtaSection />
      </div>
    </main>
  );
}
