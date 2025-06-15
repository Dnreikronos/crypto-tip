"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SectionTransition from "@/components/ui/SectionTransition";

const faqs = [
  {
    question: "How does CryptoTip work?",
    answer:
      "CryptoTip allows developers to create personalized donation pages where supporters can send cryptocurrency directly to their wallets. Simply sign up, customize your page, add your wallet addresses, and start receiving donations.",
  },
  {
    question: "Which cryptocurrencies are supported?",
    answer:
      "Currently we support Ethereum (ETH). We're working on adding Bitcoin (BTC) and Solana (SOL) support soon. More cryptocurrencies will be added based on community demand.",
  },
  {
    question: "Are there any fees?",
    answer:
      "CryptoTip charges a 5% platform fee on all donations. This fee does not include blockchain network transaction fees, which are paid separately. The platform fee helps us maintain and improve our services.",
  },
  {
    question: "Is it safe to share my wallet addresses?",
    answer:
      "Yes, sharing your public wallet addresses is completely safe. These are designed to be public for receiving transactions. Never share your private keys or seed phrases.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="min-h-screen w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center"
    >
      {/* Interactive Transition */}
      <SectionTransition type="flow" />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Interactive Transition Bottom */}
      {/* Transição Minimalista */}
      <SectionTransition />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
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
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need to know about getting started with CryptoTip
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="space-y-3 sm:space-y-4 max-w-3xl mx-auto px-4 sm:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden w-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                borderColor: "rgba(0, 229, 255, 0.3)",
                boxShadow: "0 4px 20px -4px rgba(0, 229, 255, 0.1)",
              }}
            >
              <motion.button
                className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-300"
                onClick={() => toggleFaq(index)}
                data-magnetic
                data-magnetic-text="Toggle Answer"
              >
                <h3 className="text-base sm:text-lg font-semibold text-white pr-3 sm:pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </motion.div>
              </motion.button>

              {/* Resposta sempre presente - apenas opacity muda */}
              <div className="border-t border-gray-700/30">
                <motion.div
                  className="px-4 sm:px-6 overflow-hidden"
                  animate={{
                    maxHeight: openIndex === index ? "500px" : 0,
                    paddingTop: openIndex === index ? "1rem" : 0,
                    paddingBottom: openIndex === index ? "1.5rem" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
