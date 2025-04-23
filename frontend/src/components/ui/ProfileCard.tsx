"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function ProfileCard() {
  return (
    <motion.div 
      className="bg-gray-900 rounded-lg p-6 text-center flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-800 mb-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(6, 182, 212, 0.5)" }}
      >
        <Image 
          src="/avatar-placeholder.png" 
          alt="DevJane's profile" 
          fill
          className="object-cover"
          sizes="96px"
          priority
        />
      </motion.div>
      
      <motion.h2 
        className="text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        DevJane
      </motion.h2>

      <motion.p 
        className="text-cyan-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        @dev_jane
      </motion.p>
      
      <motion.div 
        className="flex gap-2 my-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span 
          className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(31, 41, 55, 0.8)" }}
        >
          Developer
        </motion.span>
        <motion.span 
          className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(31, 41, 55, 0.8)" }}
        >
          Open Source
        </motion.span>
      </motion.div>
      
      <motion.p 
        className="text-sm text-gray-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Building open-source tools and libraries that help developers create beautiful interfaces faster. Currently working on a new React component library.
      </motion.p>
      
      <motion.div 
        className="w-full space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex justify-between text-sm">
          <span>245 ETH</span>
          <span>of 500 ETH</span>
        </div>
        
        {/* Corrigindo a animação da barra de progresso */}
        <div className="w-full">
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
          >
            <Progress 
              value={49} 
              className="h-2 bg-gray-800" 
              indicatorClassName="bg-gradient-to-r from-purple-500 to-cyan-500"
            />
          </motion.div>
        </div>
        
        <motion.p 
          className="text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          49% funded of monthly goal
        </motion.p>
      </motion.div>
    </motion.div>
  );
}