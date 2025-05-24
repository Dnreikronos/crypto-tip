"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does CryptoTip work?",
      answer:
        "CryptoTip provides developers with a customizable donation page where they can showcase their projects and receive cryptocurrency donations. Supporters can donate directly to the developer's wallet with just a few clicks. The platform doesn't hold any funds—all transactions happen directly between wallets.",
    },
    {
      question: "What cryptocurrencies are supported?",
      answer:
        "We currently support Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Polygon (MATIC), Avalanche (AVAX), Binance Coin (BNB), and several other popular cryptocurrencies. We're continually adding more options based on developer demand.",
    },
    {
      question: "Are there any fees?",
      answer:
        "CryptoTip doesn't charge any platform fees on donations. The only costs are the standard network transaction fees for each blockchain, which vary depending on network congestion. We offer a Pro tier with additional features for a small monthly subscription.",
    },
    {
      question: "How do I withdraw my donations?",
      answer:
        "You don't need to! All donations are sent directly to your connected wallet address. There's no need to withdraw or transfer funds from our platform, which means immediate access and reduced security risks.",
    },
    {
      question: "Can I embed CryptoTip on my website or GitHub?",
      answer:
        "Absolutely! We provide customizable widgets and buttons that can be embedded on your personal website, GitHub repositories, or any other platform where you showcase your work. This makes it easy for supporters to donate from anywhere.",
    },
  ];

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about receiving crypto donations for
            your development work.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
            >
              <button
                className="flex justify-between items-center w-full text-left p-6"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-cyan-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-300">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-gray-300">
            Have more questions?{" "}
            <a
              href="/support"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Contact our support team
            </a>{" "}
            for assistance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
