"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Coffee,
  Sparkles,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Eye,
  EyeOff,
} from "lucide-react";
import ProfileCard from "@/components/ui/ProfileCard";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { ContractService } from "@/services/contractService";
import { createDonation } from "@/services/donationService";
import { toast } from "sonner";
import type { ProjectResponse } from "@/services/projectService";

interface DonationPageClientProps {
  project: ProjectResponse | null;
}

const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-cyan-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full cursor-pointer bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1 "
        }`}
      />
    </button>
  );
};

const formatCurrency = (value: string) => {
  const cleanValue = value.replace(/\D/g, "");

  if (!cleanValue) return "";

  const cents = parseInt(cleanValue);

  const dollars = cents / 100;

  return (
    "$" +
    dollars.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const extractUSDValue = (formattedValue: string) => {
  if (!formattedValue) return "";

  const cleanValue = formattedValue.replace(/[$\s]/g, "");

  const normalizedValue = cleanValue.replace(/,/g, "");

  const numValue = parseFloat(normalizedValue) || 0;

  return numValue.toString();
};

// Valores pré-definidos para doação em USD
const DONATION_PRESETS = [
  { amountUSD: 5, label: "☕ Tea", description: "Buy me a tea" },
  { amountUSD: 15, label: "🍕 Pizza", description: "Buy me a pizza slice" },
  { amountUSD: 25, label: "🍔 Meal", description: "Buy me a meal" },
  { amountUSD: 100, label: "💝 Generous", description: "Super generous!" },
];

export default function DonationPageClient({
  project,
}: DonationPageClientProps) {
  const [selectedAmountUSD, setSelectedAmountUSD] = useState<number | null>(
    null,
  );
  const [customAmountUSD, setCustomAmountUSD] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const progress =
    project && project.goal > 0 ? (project.raised / project.goal) * 100 : 0;

  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const response = await fetch("/api/quotes?symbol=ETH");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch ETH price");
        }

        setEthPrice(data.price);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
        setEthPrice(3000); // Fallback price
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchETHPrice();
    const interval = setInterval(fetchETHPrice, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleDonate = async () => {
    if (!project) {
      toast.error("No project selected");
      return;
    }

    const selectedValue = getSelectedValueUSD();
    if (selectedValue <= 0) {
      toast.error("Please select a donation amount");
      return;
    }

    if (selectedValue < 1) {
      toast.error("Minimum donation amount is $1.00");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask not found", {
        description: "Please install MetaMask to make a donation.",
      });
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setIsSubmitting(true);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
        });
      } catch (switchError: unknown) {
        // handle only "chain not added" error (4902); otherwise rethrow
        if (
          typeof switchError === "object" &&
          switchError !== null &&
          "code" in switchError &&
          (switchError as { code: number }).code === 4902
        ) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia",
                  nativeCurrency: {
                    name: "SepoliaETH",
                    symbol: "SEP",
                    decimals: 18,
                  },
                  rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } catch {
            toast.error("Failed to add Sepolia network", {
              description: "Please add Sepolia network manually in MetaMask.",
            });
            return;
          }
        } else {
          throw switchError;
        }
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.[0]) {
        throw new Error("No accounts found");
      }

      const contractService = new ContractService();

      setIsProcessing(true);

      const ethAmount = getSelectedValueETH();

      const tx = await contractService.donate({
        recipient: project.wallet_addr,
        cryptoType: "ETH",
        message,
        anonymous: isAnonymous,
        amount: ethAmount.toString(),
      });

      await createDonation({
        amount: ethAmount,
        crypto_type: "ETH",
        tx_hash: tx.transactionHash,
        from_addr: accounts[0],
        message,
        anonymous: isAnonymous,
        project_id: project.id,
      });

      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);

      toast.success("Donation sent successfully!");
    } catch (error: unknown) {
      console.log("Full error object:", error);
      if (typeof error === "object" && error !== null && "code" in error) {
        const err = error as { code?: number; message?: string };
        if (err.code === 4001) {
          toast.error("Transaction rejected", {
            description: "You rejected the transaction in MetaMask.",
          });
        } else if (err.code === -32002) {
          toast.error("Request pending", {
            description: "Please check MetaMask for a pending request.",
          });
        } else if (err.code === -32603) {
          toast.error("Transaction failed", {
            description: "Insufficient funds or gas price too low.",
          });
        } else {
          toast.error("Failed to send donation", {
            description:
              err.message || "An unexpected error occurred. Please try again.",
          });
        }
      } else {
        toast.error("Unexpected error", {
          description: "Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  const getSelectedValueUSD = () => {
    if (selectedAmountUSD !== null) return selectedAmountUSD;
    if (customAmountUSD) return parseFloat(customAmountUSD) || 0;
    return 0;
  };

  const getSelectedValueETH = () => {
    const usdAmount = getSelectedValueUSD();
    return ethPrice && ethPrice > 0 ? usdAmount / ethPrice : 0;
  };

  const convertGoalToUSD = (ethAmount: number) => {
    return ethPrice && ethPrice > 0 ? ethAmount * ethPrice : 0;
  };

  const convertRaisedToUSD = (ethAmount: number) => {
    return ethPrice && ethPrice > 0 ? ethAmount * ethPrice : 0;
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCurrency(value);
    const usdValue = extractUSDValue(formatted);

    setCustomAmountUSD(usdValue);
    setDisplayValue(formatted);
    setSelectedAmountUSD(null);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative">
      <AnimatedBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
        >
          {project
            ? `Support ${project.title}`
            : "Support Open-Source Development"}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Suspense
              fallback={
                <div className="h-80 bg-gray-900/60 rounded-lg animate-pulse"></div>
              }
            >
              {project ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl"
                >
                  {project.image_url && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-800"
                    >
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        priority
                      />
                    </motion.div>
                  )}

                  <h3 className="text-xl font-semibold mb-4">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {(project.project_link || project.repo_link) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.project_link && (
                        <motion.a
                          href={project.project_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30 hover:bg-purple-600/30 transition-colors text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Project
                        </motion.a>
                      )}
                      {project.repo_link && (
                        <motion.a
                          href={project.repo_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg border border-cyan-600/30 hover:bg-cyan-600/30 transition-colors text-sm"
                        >
                          <Github className="w-3 h-3" />
                          Source Code
                        </motion.a>
                      )}
                    </div>
                  )}

                  {!isLoadingPrice && ethPrice > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>
                          Goal: ${convertGoalToUSD(project.goal).toFixed(0)} (
                          {project.goal.toFixed(3)} ETH)
                        </span>
                        <span>
                          Raised: $
                          {convertRaisedToUSD(project.raised).toFixed(0)} (
                          {project.raised.toFixed(3)} ETH)
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {Math.round(progress)}% funded
                      </p>
                    </div>
                  )}

                  {!isLoadingPrice && ethPrice > 0 && (
                    <div className="text-center text-xs text-gray-500 mb-4">
                      1 ETH = ${ethPrice.toFixed(2)} USD
                    </div>
                  )}

                  {project.creator && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-sm text-gray-400">Created by</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {project.creator.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {project.creator.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {project.creator.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <ProfileCard />
              )}
            </Suspense>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <Suspense
              fallback={
                <div className="h-96 bg-gray-900/60 rounded-lg animate-pulse"></div>
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">
                      Support Open Source
                    </span>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    Choose Your Support
                  </h2>
                  <p className="text-gray-400">
                    Help fuel innovation and keep this project growing
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-cyan-400" />
                      Choose your support
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {DONATION_PRESETS.map((preset, index) => {
                        const ethAmount =
                          ethPrice && ethPrice > 0
                            ? preset.amountUSD / ethPrice
                            : 0;
                        return (
                          <motion.button
                            key={preset.amountUSD}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedAmountUSD(preset.amountUSD);
                              setCustomAmountUSD("");
                              setDisplayValue("");
                            }}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                              selectedAmountUSD === preset.amountUSD
                                ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                            }`}
                            disabled={isLoadingPrice}
                          >
                            <div className="text-left">
                              <p className="font-semibold text-white">
                                $
                                {preset.amountUSD.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className="text-xs text-gray-400">
                                {!isLoadingPrice
                                  ? `≈ ${ethAmount.toFixed(4)} ETH`
                                  : "Loading..."}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {preset.description}
                              </p>
                            </div>
                            <div className="text-right text-lg">
                              {preset.label}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-gray-300">
                        Custom amount
                      </label>

                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="$0.00"
                          value={displayValue}
                          onChange={handleCustomAmountChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          disabled={isLoadingPrice}
                          className={`w-full px-4 py-4 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 disabled:opacity-50 ${
                            inputFocused
                              ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-gray-800/80"
                              : customAmountUSD &&
                                  parseFloat(customAmountUSD) > 0
                                ? "border-cyan-500/50 bg-gray-800/70"
                                : "border-gray-600 hover:border-gray-500"
                          }`}
                        />

                        {!isLoadingPrice &&
                          ethPrice > 0 &&
                          customAmountUSD &&
                          parseFloat(customAmountUSD) > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            >
                              <div className="text-right">
                                <div className="text-sm text-cyan-400 font-medium">
                                  ≈{" "}
                                  {(
                                    parseFloat(customAmountUSD) / ethPrice
                                  ).toFixed(4)}{" "}
                                  ETH
                                </div>
                                <div className="text-xs text-gray-500">
                                  Ethereum
                                </div>
                              </div>
                            </motion.div>
                          )}

                                                {displayValue &&
                           displayValue !== "$0.00" &&
                           customAmountUSD &&
                           parseFloat(customAmountUSD) > 0 &&
                           parseFloat(customAmountUSD) < 1 && (
                             <motion.div
                               initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="absolute -bottom-6 left-0 text-xs text-red-400"
                             >
                               Minimum amount is $1.00
                             </motion.div>
                           )}
                         
                         {displayValue &&
                           displayValue !== "$0.00" &&
                           (!customAmountUSD ||
                             parseFloat(customAmountUSD) <= 0) && (
                             <motion.div
                               initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="absolute -bottom-6 left-0 text-xs text-red-400"
                             >
                               Enter a positive amount
                             </motion.div>
                           )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Minimum: $1.00</span>
                        {!isLoadingPrice && ethPrice > 0 && (
                          <span>1 ETH = ${ethPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leave a message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Say something nice... ✨"
                      rows={3}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors resize-none"
                    />

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {isAnonymous ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-300">
                          {isAnonymous
                            ? "Anonymous donation"
                            : "Public donation"}
                        </span>
                      </div>
                      <Switch
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}

                      />
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDonate}
                                         disabled={
                       getSelectedValueUSD() < 1 ||
                       isLoadingPrice ||
                       isSubmitting ||
                       isProcessing
                     }
                    className="w-full p-4 bg-gradient-to-r from-purple-600 to-cyan-600 cursor-pointer hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting || isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isProcessing
                          ? "Processing transaction..."
                          : "Connecting to MetaMask..."}
                      </>
                    ) : (
                                              <>
                          <Heart className="w-5 h-5 group-hover:animate-pulse" />
                          {getSelectedValueUSD() >= 1
                            ? `Support with $${getSelectedValueUSD().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${ethPrice > 0 ? ` (≈ ${getSelectedValueETH().toFixed(4)} ETH)` : ""}`
                            : getSelectedValueUSD() > 0 && getSelectedValueUSD() < 1
                              ? "Minimum donation is $1.00"
                              : "Choose an amount to support"}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </Suspense>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700 text-center max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Thank You! 🎉
              </h3>
              <p className="text-gray-400 mb-4">
                Your support means the world to us and helps keep this project
                alive!
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-semibold text-cyan-400"
              >
                $
                {getSelectedValueUSD().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                donated
                {ethPrice > 0
                  ? ` (≈ ${getSelectedValueETH().toFixed(4)} ETH)`
                  : ""}
              </motion.div>
              {isAnonymous && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1"
                >
                  <EyeOff className="w-4 h-4" />
                  Anonymous donation
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
