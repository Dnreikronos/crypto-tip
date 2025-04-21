'use client'

import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function TipsInfoPanel() {
  return (
    <motion.div
      className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ boxShadow: "0 0 25px rgba(34, 211, 238, 0.1)" }}
    >
      <motion.h3 
        className="flex items-center text-xl font-bold mb-4 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <AlertCircle className="h-5 w-5 mr-2 text-cyan-400" />
        </motion.div>
        Tips for Success
      </motion.h3>
      <ul className="space-y-3 text-gray-400">
        {[
          "Be specific about your project goals and how funds will be used",
          "Include a compelling project description with relevant details",
          "Set a reasonable funding goal to attract supporters",
          "Share your project funding page on social media for visibility"
        ].map((tip, index) => (
          <motion.li 
            key={index}
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            whileHover={{ x: 5 }}
          >
            <motion.span 
              className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-900 text-cyan-400 text-xs mr-2 mt-0.5"
              whileHover={{ scale: 1.2, backgroundColor: "rgba(8, 145, 178, 0.4)" }}
            >
              {index + 1}
            </motion.span>
            <span>{tip}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}