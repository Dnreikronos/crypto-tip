import { Bitcoin, Lock } from "lucide-react";
import { SiEthereum, SiSolana, SiKucoin, SiRipple } from "react-icons/si";
import { motion } from "framer-motion";

export function CryptoInfoPanel() {
  const cryptos = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      icon: <Bitcoin className="h-6 w-6 text-yellow-400" />,
      locked: true,
      color: "yellow",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      icon: <SiEthereum className="h-6 w-6 text-cyan-400" />,
      locked: false,
      color: "cyan",
    },
    {
      name: "Solana",
      symbol: "SOL",
      icon: <SiSolana className="h-6 w-6 text-purple-400" />,
      locked: false, 
      color: "purple",
    },
    {
      name: "USDC",
      symbol: "USDC",
      icon: <SiKucoin className="h-6 w-6 text-blue-400" />,
      locked: true,
      color: "blue",
    },
    {
      name: "XRP",
      symbol: "XRP",
      icon: <SiRipple className="h-6 w-6 text-indigo-400" />,
      locked: true,
      color: "indigo",
    },
  ];

  return (
    <motion.div
      className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.h3
        className="text-2xl font-bold mb-6 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Supported Cryptocurrencies
      </motion.h3>

      <div className="grid grid-cols-3 gap-6">
        {cryptos.map((crypto, idx) => (
          <motion.div
            key={crypto.symbol}
            className={
              `relative flex flex-col items-center p-4 rounded-xl border bg-gray-800/60 transition-all ` +
              (crypto.locked
                ? "opacity-50 cursor-not-allowed border-gray-600"
                : "hover:shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-600 ring-1 ring-cyan-400")
            }
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 * idx + 0.5 }}
          >
            {crypto.locked && (
              <div className="absolute top-2 right-2 bg-gray-700 rounded-full p-1">
                <Lock className="h-4 w-4 text-gray-300" />
              </div>
            )}

            <div className="relative z-10">
              <motion.div
                className="p-3 bg-gray-900 rounded-full"
                whileHover={crypto.locked ? {} : { rotate: 10 }}
                whileTap={crypto.locked ? {} : { scale: 0.9 }}
                animate={
                  crypto.locked ? { opacity: 0.6 } : { y: [0, -3, 0, 3, 0] }
                }
                transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }}
              >
                {crypto.icon}
              </motion.div>
            </div>

            <div className="mt-3 text-center z-10">
              <span
                className={`block text-lg font-semibold text-${crypto.color}-300`}
              >
                {crypto.name}
              </span>
              <small className="text-gray-400">{crypto.symbol}</small>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute -top-3 right-6 bg-cyan-600 text-white text-xs uppercase px-2 py-1 rounded-full shadow-md z-10">
        Available
      </div>
    </motion.div>
  );
}
