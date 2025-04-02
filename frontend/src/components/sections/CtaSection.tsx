'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ButtonPrimary from '@/components/ui/ButtonPrimary';

export default function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-gradient-to-r from-gray-900/70 via-gray-800/90 to-gray-900/70 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-gray-700/50 shadow-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Ready to Get Funded for Your Code?
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Create your personalized CryptoTip page in minutes and start receiving cryptocurrency donations for your development work today.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ButtonPrimary href="/signup" className="text-lg px-8 py-4">
              Create Your Page <ArrowRight className="ml-2 h-5 w-5" />
            </ButtonPrimary>
            <a 
              href="/demo" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-cyan-400 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-cyan-500/50 rounded-lg transition-all duration-200"
            >
              View Demo
            </a>
          </motion.div>
          
          <motion.p 
            className="mt-6 text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            No platform fees. Get started for free.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}