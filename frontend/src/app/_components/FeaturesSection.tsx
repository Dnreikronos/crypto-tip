"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Shield,
  Zap,
  Globe,
  Code,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import SectionTransition from "@/app/components/ui/SectionTransition";

const features = [
  {
    icon: Wallet,
    title: "Multi-Crypto Support",
    description:
      "Accept donations in Bitcoin, Ethereum, and 12+ other cryptocurrencies",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description:
      "All transactions are recorded on the blockchain for complete transparency",
    color: "purple",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Create your donation page in under 5 minutes with our simple wizard",
    color: "yellow",
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Receive donations from supporters worldwide without geographical restrictions",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Code,
    title: "Developer-First",
    description:
      "Built by developers, for developers. Integrate with GitHub and showcase your projects",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description:
      "Track your donations, supporter growth, and project impact with detailed analytics",
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
  },
];

export default function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="features"
      className="min-h-screen w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center"
    >
      {/* Transição Minimalista */}
      <SectionTransition />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why Choose CryptoTip?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need to start receiving cryptocurrency donations for
            your open-source projects
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                data-magnetic
                data-magnetic-text={feature.title}
              >
                {/* Card Background */}
                <motion.div
                  className="relative h-full p-6 sm:p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden"
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {/* Gradient Background on Hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0`}
                    animate={{
                      opacity: isHovered ? 0.1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl opacity-0`}
                    style={{
                      boxShadow: `0 0 30px rgba(${
                        feature.color === "cyan"
                          ? "0, 229, 255"
                          : feature.color === "purple"
                            ? "147, 51, 234"
                            : feature.color === "yellow"
                              ? "255, 193, 7"
                              : feature.color === "green"
                                ? "34, 197, 94"
                                : feature.color === "blue"
                                  ? "59, 130, 246"
                                  : "236, 72, 153"
                      }, 0.3)`,
                    }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 sm:mb-6 relative`}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />

                    {/* Sparkle Effect */}
                    {isHovered && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.h3
                      className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3"
                      animate={{
                        color: isHovered ? "#ffffff" : "#e5e7eb",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.title}
                    </motion.h3>

                    <motion.p
                      className="text-sm sm:text-base text-gray-400 leading-relaxed mb-3 sm:mb-4"
                      animate={{
                        color: isHovered ? "#d1d5db" : "#9ca3af",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* Learn More Link */}
                    <motion.div
                      className="flex items-center text-xs sm:text-sm font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -10,
                        color: `rgb(${
                          feature.color === "cyan"
                            ? "0, 229, 255"
                            : feature.color === "purple"
                              ? "147, 51, 234"
                              : feature.color === "yellow"
                                ? "255, 193, 7"
                                : feature.color === "green"
                                  ? "34, 197, 94"
                                  : feature.color === "blue"
                                    ? "59, 130, 246"
                                    : "236, 72, 153"
                        })`,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      Learn more
                      <motion.div
                        animate={{ x: isHovered ? 5 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent"
                    style={{
                      background: isHovered
                        ? `linear-gradient(135deg, ${
                            feature.color === "cyan"
                              ? "rgba(0, 229, 255, 0.3)"
                              : feature.color === "purple"
                                ? "rgba(147, 51, 234, 0.3)"
                                : feature.color === "yellow"
                                  ? "rgba(255, 193, 7, 0.3)"
                                  : feature.color === "green"
                                    ? "rgba(34, 197, 94, 0.3)"
                                    : feature.color === "blue"
                                      ? "rgba(59, 130, 246, 0.3)"
                                      : "rgba(236, 72, 153, 0.3)"
                          }, transparent)`
                        : "transparent",
                    }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -10px rgba(0, 229, 255, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            data-magnetic
            data-magnetic-text="Get Started Now"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
