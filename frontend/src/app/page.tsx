import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
// import ShowcaseSection from "@/components/sections/ShowcaseSection";
// import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
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
