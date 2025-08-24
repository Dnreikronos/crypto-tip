"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, type Variants } from "framer-motion";

interface Supporter {
  id: string;
  name: string;
  avatar: string;
  amount: string;
  currency: string;
  message: string;
  timeAgo: string;
}

export default function RecentSupporters() {
  const supporters: Supporter[] = [
    {
      id: "1",
      name: "Alex",
      avatar: "A",
      amount: "0.25 ETH",
      currency: "eth",
      message: '"Love your work on the FileSync API!"',
      timeAgo: "2 hours ago",
    },
    {
      id: "2",
      name: "Maria",
      avatar: "M",
      amount: "0.5 BTC",
      currency: "btc",
      message: '"Keep building awesome stuff!"',
      timeAgo: "1 day ago",
    },
    {
      id: "3",
      name: "Satoshi",
      avatar: "S",
      amount: "1 ETH",
      currency: "eth",
      message: '"Your components saved me weeks of work"',
      timeAgo: "3 days ago",
    },
    {
      id: "4",
      name: "CryptoWhale",
      avatar: "C",
      amount: "5 ETH",
      currency: "eth",
      message: "",
      timeAgo: "1 week ago",
    },
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-xl font-bold mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Recent Supporters
      </motion.h2>

      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {supporters.map((supporter) => (
          <motion.div
            key={supporter.id}
            className="flex items-start gap-3"
            variants={item}
            whileHover={{ scale: 1.02, x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-10 w-10 bg-gray-800 text-white">
                <AvatarFallback>{supporter.avatar}</AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{supporter.name}</span>
                <span className="text-xs text-gray-400">
                  {supporter.timeAgo}
                </span>
              </div>
              <motion.p
                className={`text-sm ${
                  supporter.currency === "eth"
                    ? "text-cyan-400"
                    : supporter.currency === "btc"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
                whileHover={{ scale: 1.05 }}
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 0px rgba(255,255,255,0)",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 2,
                  duration: 1.5,
                }}
              >
                {supporter.amount}
              </motion.p>
              {supporter.message && (
                <motion.p
                  className="text-sm text-gray-300 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {supporter.message}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
