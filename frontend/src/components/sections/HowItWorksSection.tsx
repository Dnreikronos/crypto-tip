"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Settings,
  Share2,
  Coins,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import SectionTransition from "@/components/ui/SectionTransition";

const steps = [
  {
    id: 1,
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up with your GitHub account or email in under 30 seconds",
    details:
      "Connect your GitHub to automatically import your repositories and showcase your work to potential supporters.",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    icon: Settings,
    title: "Setup Your Page",
    description:
      "Customize your donation page with projects, goals, and wallet addresses",
    details:
      "Add your crypto wallet addresses, set funding goals, and describe your projects to attract supporters.",
    color: "purple",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: 3,
    icon: Share2,
    title: "Share & Promote",
    description:
      "Share your page on social media, GitHub, and with your community",
    details:
      "Use our sharing tools and embed widgets to promote your page across all your platforms and reach more supporters.",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: 4,
    icon: Coins,
    title: "Receive Donations",
    description:
      "Start receiving cryptocurrency donations directly to your wallet",
    details:
      "Get notified instantly when someone supports your work. All transactions are secure and transparent on the blockchain.",
    color: "orange",
    gradient: "from-orange-500 to-red-600",
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    if (!completedSteps.includes(index)) {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % steps.length;
          setCompletedSteps((completed) =>
            completed.includes(next) ? completed : [...completed, next],
          );
          return next;
        });
      }, 2000);

      setTimeout(() => {
        clearInterval(interval);
        setIsPlaying(false);
      }, steps.length * 2000);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  return (
    <section
      id="how-it-works"
      className="min-h-screen w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center"
    >
      {/* Transição Minimalista */}
      <SectionTransition />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            How CryptoTip Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Get started in minutes and begin receiving crypto donations for your
            projects
          </motion.p>

          {/* Playback Controls */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors text-sm sm:text-base min-w-[120px] justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-magnetic
              data-magnetic-text={isPlaying ? "Pause Demo" : "Play Demo"}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              {isPlaying ? "Pause" : "Play Demo"}
            </motion.button>

            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors text-sm sm:text-base min-w-[100px] justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-magnetic
              data-magnetic-text="Reset Demo"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Steps Timeline */}
          <div className="space-y-4 sm:space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const isCompleted = completedSteps.includes(index);

              return (
                <motion.div
                  key={step.id}
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="absolute left-6 sm:left-8 top-14 sm:top-16 w-0.5 h-8 sm:h-12 bg-gray-700"
                      animate={{
                        backgroundColor: isCompleted ? "#10b981" : "#374151",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <motion.div
                    className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-gray-800/70 backdrop-blur-sm border border-gray-600/50"
                        : "bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-800/50"
                    }`}
                    onClick={() => handleStepClick(index)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    data-magnetic
                    data-magnetic-text={step.title}
                  >
                    {/* Step Icon */}
                    <motion.div
                      className={`relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${step.gradient} flex-shrink-0`}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive
                          ? `0 0 20px rgba(${
                              step.color === "cyan"
                                ? "0, 229, 255"
                                : step.color === "purple"
                                  ? "147, 51, 234"
                                  : step.color === "green"
                                    ? "34, 197, 94"
                                    : "255, 107, 53"
                            }, 0.4)`
                          : "0 0 0px transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />

                      {/* Completion Indicator */}
                      {isCompleted && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </motion.div>
                      )}

                      {/* Active Pulse */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-white/30"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <motion.h3
                        className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2"
                        animate={{
                          color: isActive ? "#ffffff" : "#e5e7eb",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="hidden sm:inline">
                          Step {step.id}:{" "}
                        </span>
                        {step.title}
                      </motion.h3>

                      <motion.p
                        className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3"
                        animate={{
                          color: isActive ? "#d1d5db" : "#9ca3af",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {step.description}
                      </motion.p>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-xs sm:text-sm text-gray-300 bg-gray-700/30 p-2 sm:p-3 rounded-lg">
                              {step.details}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Arrow Indicator */}
                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0,
                        x: isActive ? 0 : -10,
                      }}
                      transition={{ duration: 0.3 }}
                      className="hidden sm:block"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Preview Card */}
          <motion.div
            className="relative xl:sticky xl:top-1/2 xl:-translate-y-1/2 xl:self-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
              animate={{
                boxShadow: `0 20px 40px -10px rgba(${
                  steps[activeStep].color === "cyan"
                    ? "0, 229, 255"
                    : steps[activeStep].color === "purple"
                      ? "147, 51, 234"
                      : steps[activeStep].color === "green"
                        ? "34, 197, 94"
                        : "255, 107, 53"
                }, 0.2)`,
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Background Gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${steps[activeStep].gradient} opacity-5`}
                key={activeStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                transition={{ duration: 0.5 }}
              />

              <div className="relative z-10">
                <motion.div
                  className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
                  key={`header-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${steps[activeStep].gradient} flex items-center justify-center`}
                  >
                    {(() => {
                      const Icon = steps[activeStep].icon;
                      return (
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      );
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      {steps[activeStep].title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Step {steps[activeStep].id} of {steps.length}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  key={`content-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
                    {steps[activeStep].description}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {steps[activeStep].details}
                  </p>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                  className="mt-4 sm:mt-6 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === activeStep
                          ? "bg-cyan-400"
                          : completedSteps.includes(index)
                            ? "bg-green-400"
                            : "bg-gray-600"
                      }`}
                      animate={{
                        scale: index === activeStep ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -10px rgba(0, 229, 255, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            data-magnetic
            data-magnetic-text="Start Building"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
