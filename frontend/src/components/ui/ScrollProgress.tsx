"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface Section {
  id: string;
  name: string;
  color: string;
}

const sections: Section[] = [
  { id: "hero", name: "Hero", color: "#00e5ff" },
  { id: "features", name: "Features", color: "#3f51b5" },
  { id: "how-it-works", name: "Process", color: "#9c27b0" },
  { id: "faq", name: "FAQ", color: "#ff6b35" },
  { id: "cta", name: "Action", color: "#4caf50" },
];

export default function ScrollProgress() {
  const [activeSection, setActiveSection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionIndex = Math.floor(scrollPosition / windowHeight);
      setActiveSection(Math.min(sectionIndex, sections.length - 1));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const targetY = index * window.innerHeight;
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Progress Bar - Apenas em mobile */}
      {isMobile && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 origin-left z-50"
          style={{ scaleX }}
        />
      )}

      {/* Section Navigation - Oculto em mobile */}
      {!isMobile && (
        <div className="fixed right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-50">
          <div className="flex flex-col space-y-3">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(index)}
                className="group relative w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white/30 backdrop-blur-sm transition-all duration-300"
                style={{
                  backgroundColor:
                    activeSection === index ? section.color : "transparent",
                  borderColor:
                    activeSection === index
                      ? section.color
                      : "rgba(255,255,255,0.3)",
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                data-magnetic
                data-magnetic-text={section.name}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: section.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: activeSection === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Tooltip */}
                <div className="absolute right-6 lg:right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 lg:px-3 lg:py-1 rounded-lg text-xs lg:text-sm whitespace-nowrap">
                    {section.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Current Section Indicator */}
          <motion.div
            className="mt-4 lg:mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="text-xs text-white/60 font-mono">
              {String(activeSection + 1).padStart(2, "0")} /{" "}
              {String(sections.length).padStart(2, "0")}
            </div>
            <div className="text-xs lg:text-sm text-white/80 font-medium mt-1">
              {sections[activeSection]?.name}
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Section Indicator - Mais discreto */}
      {isMobile && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <motion.div
            className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {String(activeSection + 1).padStart(2, "0")} /{" "}
            {String(sections.length).padStart(2, "0")}
          </motion.div>
        </div>
      )}
    </>
  );
}
