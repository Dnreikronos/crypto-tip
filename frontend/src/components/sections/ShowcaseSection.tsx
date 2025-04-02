'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Heart } from 'lucide-react';
import { SiGithub } from 'react-icons/si';

export default function ShowcaseSection() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  const projects = [
    {
      name: "Alex Chen",
      project: "Web3 Auth Library",
      description: "A lightweight authentication library for Web3 applications that supports multiple wallets and chains.",
      image: "/images/developer-1.jpg",
      raised: "12.4 ETH",
      supporters: 78,
      githubUrl: "#",
      projectUrl: "#"
    },
    {
      name: "Sarah Johnson",
      project: "Block Explorer API",
      description: "Open-source API for blockchain data with comprehensive documentation and easy integration.",
      image: "/images/developer-2.jpg",
      raised: "3.2 SOL",
      supporters: 45,
      githubUrl: "#",
      projectUrl: "#"
    },
    {
      name: "Miguel Lopez",
      project: "Crypto Trading Bot",
      description: "Customizable trading bot for cryptocurrency markets with advanced strategy implementation.",
      image: "/images/developer-3.jpg",
      raised: "0.8 BTC",
      supporters: 124,
      githubUrl: "#",
      projectUrl: "#"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Developers Getting Funded
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how developers are using Crypto Tip to fund their open-source projects.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project, index) => (
            <motion.div 
              key={index}
              className="relative rounded-xl overflow-hidden group"
              variants={cardVariants}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              whileHover={{ 
                y: -10,
                transition: {
                  duration: 0.3
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900 z-10"></div>
              
              <div className="w-full h-64 bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <span>Developer Profile Image</span>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                    Developer
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">{project.project}</h4>
                <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Raised</p>
                    <p className="text-lg font-bold text-white">{project.raised}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Supporters</p>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-1" />
                      <p className="text-lg font-bold text-white">{project.supporters}</p>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="flex space-x-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeCard === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <a 
                    href={project.githubUrl} 
                    className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition duration-200"
                  >
                    <SiGithub className="h-5 w-5" />
                  </a>
                  <a 
                    href={project.projectUrl} 
                    className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  <a 
                    href={`/donate/${project.name.toLowerCase().replace(' ', '-')}`}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    Support Project
                  </a>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a 
              href="/showcase" 
              className="inline-flex items-center px-6 py-3 text-base font-medium text-cyan-400 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-all duration-200"
            >
              View More Examples
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
