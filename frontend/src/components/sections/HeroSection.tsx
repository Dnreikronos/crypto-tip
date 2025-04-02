'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Coins } from 'lucide-react';
import ButtonPrimary from '@/components/ui/ButtonPrimary';
import ButtonSecondary from '@/components/ui/ButtonSecondary';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="hero" className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      
      <motion.div 
        ref={containerRef}
        className="max-w-4xl mx-auto text-center z-10"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <motion.div 
          className="mb-8 inline-flex items-center justify-center"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-3">
            <Coins className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
          variants={fadeInUp}
        >
          Get Crypto Funding for Your Code
        </motion.h1>

        <motion.h2 
          className="text-xl sm:text-2xl text-gray-300 mb-8"
          variants={fadeInUp}
        >
          The developer-first platform to receive cryptocurrency
          donations for your open-source projects
        </motion.h2>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={fadeInUp}
        >
          <ButtonPrimary href="/signup">
            Create Your Page <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonPrimary>
          <ButtonSecondary href="/showcase">
            See Examples <Code className="ml-2 h-4 w-4" />
          </ButtonSecondary>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          variants={fadeInUp}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <motion.h3 
              className="text-3xl font-bold text-cyan-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              1,000+
            </motion.h3>
            <p className="text-gray-400">Developers Funded</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <motion.h3 
              className="text-3xl font-bold text-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              $2.5M+
            </motion.h3>
            <p className="text-gray-400">Crypto Donated</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <motion.h3 
              className="text-3xl font-bold text-purple-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              14+
            </motion.h3>
            <p className="text-gray-400">Cryptocurrencies</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute right-0 bottom-0 w-72 h-72 md:w-96 md:h-96 opacity-20 md:opacity-40 -z-10"
        initial={{ opacity: 0, y: 100, rotate: 5 }}
        animate={{ opacity: [0.2, 0.4, 0.2], y: 0, rotate: 0 }}
        transition={{ duration: 3, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-full h-full bg-gradient-to-tr from-gray-800 via-gray-900 to-black rounded-lg p-4 overflow-hidden">
          <pre className="text-xs text-cyan-400">
            <code>{`
function donate() {
  const wallet = connect();
  const amount = ethers.utils
    .parseEther("0.1");
  return wallet.sendTransaction({
    to: "0x...",
    value: amount
  });
}
            `}</code>
          </pre>
        </div>
      </motion.div>
    </section>
  );
}