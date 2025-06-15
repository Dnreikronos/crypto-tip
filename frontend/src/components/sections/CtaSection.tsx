"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Users,
  Star,
  Zap,
  Trophy,
  Sparkles,
  Clock,
} from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { useState, useEffect, useRef } from "react";
import SectionTransition from "@/components/ui/SectionTransition";

export default function CtaSection() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [socialProofIndex, setSocialProofIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45,
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  const socialProofs = [
    {
      icon: <Users className="h-5 w-5" />,
      text: "1,000+ developers funded",
      color: "text-cyan-400",
    },
    {
      icon: <Star className="h-5 w-5" />,
      text: "4.9/5 average rating",
      color: "text-yellow-400",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "< 5 min setup time",
      color: "text-green-400",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      text: "$2.5M+ donated",
      color: "text-purple-400",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSocialProofIndex((prev) => (prev + 1) % socialProofs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [socialProofs.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCtaClick = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const createConfetti = () => {
    const colors = ["#00e5ff", "#3f51b5", "#9c27b0", "#ff6b35", "#4caf50"];
    return Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        initial={{
          scale: 0,
          y: 0,
          x: 0,
          rotate: 0,
        }}
        animate={{
          scale: [0, 1, 0],
          y: [0, -100 - Math.random() * 200, -300],
          x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
          rotate: [0, Math.random() * 360, Math.random() * 720],
        }}
        transition={{
          duration: 3,
          ease: "easeOut",
        }}
      />
    ));
  };

  return (
    <section
      id="cta"
      className="min-h-screen w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center"
      ref={sectionRef}
    >
      {/* Transição Minimalista */}
      <SectionTransition />

      {/* Spotlight Effect */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2 }}
        viewport={{ once: true }}
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, -50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Floating Elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-full"
              style={{
                left: `${10 + i * 8}%`,
                top: `${20 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Main CTA Card */}
          <motion.div
            className="relative bg-gradient-to-r from-gray-900/80 via-gray-800/90 to-gray-900/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden"
            whileInView={{
              boxShadow: [
                "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                "0 25px 50px -12px rgba(0, 229, 255, 0.15)",
                "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* Spotlight Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Urgency Banner */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 p-2 sm:p-3"
              initial={{ y: -100 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-orange-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    Limited Time: Setup Fee Waived
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>:
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>:
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>
            </motion.div>

            <div className="pt-6 sm:pt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 leading-tight"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  Ready to Get Funded for Your Code?
                </motion.h2>
              </motion.div>

              <motion.p
                className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Join thousands of developers already receiving crypto donations.
                Create your personalized CryptoTip page in minutes and start
                monetizing your open-source contributions today.
              </motion.p>

              {/* Social Proof Carousel */}
              <motion.div
                className="mb-6 sm:mb-8 h-10 sm:h-12 flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={socialProofIndex}
                    className={`flex items-center gap-2 sm:gap-3 ${socialProofs[socialProofIndex].color}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      {socialProofs[socialProofIndex].icon}
                    </motion.div>
                    <span className="font-medium text-sm sm:text-base lg:text-lg text-center">
                      {socialProofs[socialProofIndex].text}
                    </span>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-magnetic
                  data-magnetic-text="Start Your Journey"
                  className="w-full sm:w-auto"
                >
                  <div onClick={handleCtaClick}>
                    <ButtonPrimary
                      href="/create-project"
                      className="text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 relative overflow-hidden group shadow-2xl w-full sm:w-auto justify-center"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Create Your Page
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </motion.div>
                      </span>

                      {/* Button Glow Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Ripple Effect */}
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-lg"
                        initial={{ scale: 0, opacity: 1 }}
                        whileHover={{
                          scale: 1,
                          opacity: 0,
                          transition: { duration: 0.6 },
                        }}
                      />
                    </ButtonPrimary>
                  </div>
                </motion.div>

                <motion.a
                  href="/projects"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 lg:py-5 text-base sm:text-lg font-medium text-cyan-400 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-cyan-500/50 rounded-lg transition-all duration-300 group w-full sm:w-auto"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(0, 229, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  data-magnetic
                  data-magnetic-text="View Examples"
                >
                  <span>View Examples</span>
                  <motion.div
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="mt-8 sm:mt-12 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-gray-400 text-xs sm:text-sm px-4 sm:px-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Zero setup fees</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Direct to wallet</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>5 min setup</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>24/7 support</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                className="fixed inset-0 pointer-events-none z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {createConfetti()}

                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-cyan-500 text-white px-8 py-4 rounded-xl shadow-2xl"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6" />
                    <span className="font-bold text-lg">
                      Welcome to CryptoTip!
                    </span>
                    <Sparkles className="h-6 w-6" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
