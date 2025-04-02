'use client';

import { motion } from 'framer-motion';
import { UserPlus, Palette, Rocket, Coins } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "Create Account",
      description: "Sign up with your email or GitHub account in seconds.",
      color: "bg-cyan-500"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Customize Page",
      description: "Add your projects, funding goals, and personalize your profile.",
      color: "bg-blue-500"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Share Your Link",
      description: "Add your CryptoTip link to your GitHub, social media, or website.",
      color: "bg-indigo-500"
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Receive Donations",
      description: "Get cryptocurrency directly to your wallet with zero platform fees.",
      color: "bg-purple-500"
    }
  ];

  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
            How Crypto Tip Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start receiving crypto donations for your development work in just a few simple steps.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block">
            <div className="flex justify-between items-start max-w-5xl mx-auto relative">
              <svg className="absolute top-24 w-full h-20 z-0" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                  d="M100,50 H900" 
                  stroke="url(#gradient)" 
                  strokeWidth="4" 
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                  variants={lineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="33%" stopColor="#3b82f6" />
                    <stop offset="66%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center text-center w-64 z-10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className={`${step.color} rounded-full h-16 w-16 flex items-center justify-center mb-5 shadow-lg`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            <div className="flex flex-col items-center max-w-md mx-auto relative">
              <svg className="absolute left-1/2 -translate-x-1/2 h-full w-4 z-0" viewBox="0 0 20 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                  d="M10,0 V800" 
                  stroke="url(#gradientMobile)" 
                  strokeWidth="4" 
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                  variants={lineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
                <defs>
                  <linearGradient id="gradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="33%" stopColor="#3b82f6" />
                    <stop offset="66%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center text-center mb-16 z-10 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 w-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`${step.color} rounded-full h-16 w-16 flex items-center justify-center mb-5 shadow-lg`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}