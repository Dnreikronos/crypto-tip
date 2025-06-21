"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Code } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import ParticleSystem from "@/components/ui/ParticleSystem";
import SectionTransition from "@/components/ui/SectionTransition";
import Logo from "@/components/ui/Logo";

// Component for animated numbers
// function AnimatedNumber({
//   value,
//   delay = 0,
// }: {
//   value: string;
//   delay?: number;
// }) {
//   const [displayValue, setDisplayValue] = useState("0");

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // Parse different formats: "1,000+", "$250K+", "14+"
//       let targetNum = 0;
//       let prefix = "";
//       let suffix = "";

//       if (value.includes("K+")) {
//         // Handle format like "$250K+"
//         const match = value.match(/^(\$?)(\d+)K\+$/);
//         if (match) {
//           prefix = match[1]; // "$"
//           targetNum = parseInt(match[2]); // 250
//           suffix = "K+";
//         }
//       } else if (value.includes("M+")) {
//         // Handle format like "$2.5M+"
//         const match = value.match(/^(\$?)([\d.]+)M\+$/);
//         if (match) {
//           prefix = match[1]; // "$"
//           targetNum = parseFloat(match[2]) * 1000; // Convert to thousands for animation
//           suffix = "M+";
//         }
//       } else if (value.includes(",")) {
//         // Handle format like "1,000+"
//         const match = value.match(/^([\d,]+)\+?$/);
//         if (match) {
//           targetNum = parseInt(match[1].replace(/,/g, ""));
//           suffix = "+";
//         }
//       } else {
//         // Handle simple format like "14+"
//         const match = value.match(/^(\d+)\+?$/);
//         if (match) {
//           targetNum = parseInt(match[1]);
//           suffix = "+";
//         }
//       }

//       let current = 0;
//       const increment = targetNum / 60; // 60 frames for smooth animation
//       const interval = setInterval(() => {
//         current += increment;
//         if (current >= targetNum) {
//           current = targetNum;
//           clearInterval(interval);
//         }

//         let formattedValue;
//         if (suffix === "M+") {
//           formattedValue = (current / 1000).toFixed(1);
//         } else if (suffix === "K+") {
//           formattedValue = Math.floor(current).toString();
//         } else if (suffix === "+" && targetNum >= 1000) {
//           formattedValue = Math.floor(current).toLocaleString();
//         } else {
//           formattedValue = Math.floor(current).toString();
//         }

//         setDisplayValue(prefix + formattedValue + suffix);
//       }, 50);

//       return () => clearInterval(interval);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return <span>{displayValue}</span>;
// }

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        mouseX.set(deltaX);
        mouseY.set(deltaY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleCtaClick = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 3000);
  };

  const typewriterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };


  return (
    <section
      id="hero"
      className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden max-w-screen-2xl mx-auto"
    >
      {/* Interactive Background - Simplificado */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl left-1/4 top-1/4"
          style={{
            x: useTransform(x, [-300, 300], [-30, 30]),
            y: useTransform(y, [-300, 300], [-30, 30]),
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-1/4 bottom-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl"
          style={{
            x: useTransform(x, [-300, 300], [20, -20]),
            y: useTransform(y, [-300, 300], [20, -20]),
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Interactive Transition */}
      {/* Transição Minimalista */}
      <SectionTransition />

      <motion.div
        ref={containerRef}
        className="max-w-4xl mx-auto text-center z-50 relative w-full px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Logo */}
        <motion.div
          className="mb-8 inline-flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          whileHover={{
            scale: 1.1,
            rotate: [0, -10, 10, 0],
            transition: { duration: 0.5 },
          }}
          data-magnetic
          data-magnetic-text="CryptoTip"
        >
          <div className="relative flex items-center justify-center">
            <Logo size={80} className="drop-shadow-2xl" />
          </div>
        </motion.div>

        {/* Typewriter Title with enhanced typography */}
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tight relative z-50 max-w-full leading-tight px-2 sm:px-0"
          variants={typewriterVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="block">
            {"Get Crypto Funding for".split("").map((char, index) => (
              <motion.span key={index} variants={letterVariants}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          <span className="block">
            {"Your Code".split("").map((char, index) => (
              <motion.span key={`line2-${index}`} variants={letterVariants}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.h2
          className="text-lg sm:text-xl md:text-2xl text-gray-300/90 mb-8 text-balance font-medium leading-relaxed relative z-50 max-w-full px-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          The{" "}
          <span className="text-cyan-400 font-semibold">developer-first</span>{" "}
          platform to receive cryptocurrency donations for your{" "}
          <span className="text-purple-400 font-semibold">open-source</span>{" "}
          projects
        </motion.h2>

        {/* CTA Buttons with Magnetic Effect */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12 w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            data-magnetic
            data-magnetic-text="Start Creating"
          >
            <div onClick={handleCtaClick}>
              <ButtonPrimary
                href="/create-project"
                className="relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center font-medium">
                  Create Your Page
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </ButtonPrimary>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-magnetic
            data-magnetic-text="Explore Examples"
          >
            <ButtonSecondary href="/projects" className="font-medium">
              See Examples <Code className="ml-2 h-4 w-4" />
            </ButtonSecondary>
          </motion.div>
        </motion.div>

      </motion.div>

      {/* Floating Code Block with enhanced animation - Oculto em mobile */}
      <motion.div
        className="absolute right-0 bottom-0 w-72 h-72 md:w-96 md:h-96 opacity-0 md:opacity-40 -z-10 hidden md:block"
        style={{
          rotateY: useTransform(x, [-300, 300], [-15, 15]),
          rotateX: useTransform(y, [-300, 300], [15, -15]),
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, y: 100, rotate: 5 }}
        animate={{
          opacity: 0.3,
          y: [0, -20, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          opacity: { duration: 1, delay: 3 },
          y: { duration: 6, ease: "easeInOut", repeat: Infinity },
          rotate: { duration: 6, ease: "easeInOut", repeat: Infinity },
        }}
      >
        <div className="w-full h-full bg-gradient-to-tr from-gray-800 via-gray-900 to-black rounded-lg p-4 overflow-hidden border border-cyan-500/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="text-xs text-cyan-400 font-mono">
            <motion.code
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
            >{`
function donate() {
  const wallet = connect();
  const amount = ethers.utils
    .parseEther("0.1");
  return wallet.sendTransaction({
    to: "0x...",
    value: amount
  });
}
            `}</motion.code>
          </pre>
          <motion.div
            className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-green-500"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Particle System */}
      <ParticleSystem
        isActive={showParticles}
        particleCount={100}
        colors={["#00e5ff", "#3f51b5", "#9c27b0", "#ff6b35"]}
        onComplete={() => setShowParticles(false)}
      />
    </section>
  );
}
