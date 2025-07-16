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
  Share2,
  Copy,
  CheckCheck,
} from "lucide-react";
import ProfileCard from "@/components/ui/ProfileCard";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { ContractService } from "@/services/contractService";
import { SolanaContractService } from "@/services/solanaContractService";
import { createDonation } from "@/services/donationService";
import { toast } from "sonner";
import type { ProjectResponse } from "@/services/projectService";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import {
  Connection as SolConnection,
  PublicKey,
  SystemProgram,
  Transaction as SolTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<void>;
      publicKey?: {
        toString: () => string;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signTransaction: (tx: any) => Promise<any>;
    };
  }
}

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;

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

// Social Media Icons
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
);

// Valores pré-definidos para doação em ETH
const DONATION_PRESETS = [
  { amountETH: 0.002, label: "☕ Tea", description: "Buy me a tea" },
  { amountETH: 0.006, label: "🍕 Pizza", description: "Buy me a pizza slice" },
  { amountETH: 0.01, label: "🍔 Meal", description: "Buy me a meal" },
  { amountETH: 0.041, label: "💝 Generous", description: "Super generous!" },
];

export default function DonationPageClient({
  project,
}: DonationPageClientProps) {
  const [selectedAmountETH, setSelectedAmountETH] = useState<number | null>(
    null,
  );
  const [customAmountETH, setCustomAmountETH] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Currency — "ETH" (default) or "SOL"
  const [selectedCurrency, setSelectedCurrency] = useState<"ETH" | "SOL">("ETH");
  const currencySymbol = selectedCurrency;
  const networkName = selectedCurrency === "ETH" ? "Ethereum" : "Solana";

  // Use the custom hook for ETH price
  const {
    price: ethPrice,
    isLoading: isLoadingPrice,
    error: priceError,
  } = useCryptoPrice({
    symbol: selectedCurrency,
    refreshInterval: 120000, // 2 minutes
    autoRefresh: true,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const progress =
    project && project.goal > 0 ? (project.raised / project.goal) * 100 : 0;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Handle price errors with toast notifications
  useEffect(() => {
    if (priceError) {
      console.error(`${currencySymbol} price error:`, priceError);

      // Show more specific error messages
      if (priceError.includes("rate limit")) {
        toast.error("Rate limit exceeded", {
          description: "Too many requests. Please wait a moment and try again.",
        });
      } else if (priceError.includes("Failed to fetch")) {
        toast.error("Network error", {
          description:
            "Unable to connect to price services. Please check your internet connection.",
        });
      } else if (priceError.includes("all sources")) {
        toast.error("All price services unavailable", {
          description:
            "Multiple price services are currently down. Please try again later.",
        });
      } else {
        toast.error(`Failed to fetch ${currencySymbol} price`, {
          description: priceError.split("\n")[0], // Show only the first line of error
        });
      }
    }
  }, [priceError, currencySymbol]);

  const handleDonate = async () => {
    if (!project) {
      toast.error("No project selected");
      return;
    }

    if (!ethPrice || ethPrice <= 0) {
      toast.error(`${currencySymbol} price not available`, {
        description: "Please wait for the price to load or refresh the page.",
      });
      return;
    }

    const selectedValue = getSelectedValueETH();
    if (selectedValue <= 0) {
      toast.error("Please select a donation amount");
      return;
    }

    // Validate minimum amounts based on currency
    if (selectedCurrency === "SOL" && selectedValue < 0.001) {
      toast.error("Minimum donation amount is 0.001 SOL", {
        description: "Please increase your donation amount.",
      });
      return;
    } else if (selectedCurrency === "ETH" && selectedValue < 0.0001) {
      toast.error("Minimum donation amount is 0.0001 ETH", {
        description: "Please increase your donation amount.",
      });
      return;
    }

    // SOL Donation Flow
    if (selectedCurrency === "SOL") {
      const solanaProvider = window.solana;
      if (!solanaProvider || !solanaProvider.isPhantom) {
        toast.error("Phantom wallet not found", {
          description: "Please install Phantom to donate with SOL.",
        });
        return;
      }

      try {
        setIsSubmitting(true);
        await solanaProvider.connect();

        setIsProcessing(true);

        // Use a reliable RPC endpoint with fallback
        // Note: For production, consider using a dedicated RPC provider like:
        // - QuickNode (https://quicknode.com)
        // - Alchemy (https://alchemy.com)
        // - Helius (https://helius.xyz)
        // This will avoid rate limits and 403 errors from public endpoints
        
        // Detect if we're using testnet or mainnet based on the RPC URL
        const isTestnet = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes('testnet') || false;
        
        const primaryEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
          (isTestnet ? "https://api.testnet.solana.com" : "https://solana-mainnet.rpc.extrnode.com");
        const fallbackEndpoint = isTestnet ? 
          "https://api.testnet.solana.com" : "https://rpc.ankr.com/solana";
        
        console.log(`Using ${isTestnet ? 'testnet' : 'mainnet'} Solana network`);
        
        // Warn users if they're on testnet
        if (isTestnet) {
          toast.info("Using Solana Testnet", {
            description: "You're connected to Solana testnet. Use testnet SOL for donations.",
          });
        }
        
        const fromPubkey = new PublicKey(solanaProvider.publicKey!.toString());
        
        let connection;
        let balance: number;
        let estimatedFee: number;

        // Try primary endpoint first
        try {
          connection = new SolConnection(primaryEndpoint);
          balance = await connection.getBalance(fromPubkey);
          console.log(`Connected to Solana RPC: ${primaryEndpoint}`);
        } catch (error) {
          console.warn(`Primary endpoint failed: ${primaryEndpoint}`, error);
          
          // Try fallback endpoint
          try {
            connection = new SolConnection(fallbackEndpoint);
            balance = await connection.getBalance(fromPubkey);
            console.log(`Connected to Solana RPC: ${fallbackEndpoint}`);
          } catch (fallbackError) {
            console.error(`Fallback endpoint also failed: ${fallbackEndpoint}`, fallbackError);
            toast.error("Failed to connect to Solana network", {
              description: "Unable to connect to Solana RPC endpoints. Please try again later.",
            });
            return;
          }
        }
        
        // Validate recipient address
        let recipientPubkey;
        try {
          recipientPubkey = new PublicKey(project.wallet_addr);
        } catch (error) {
          toast.error("Invalid recipient address", {
            description: "The project's wallet address is not a valid Solana address.",
          });
          return;
        }

        const lamports = Math.round(selectedValue * LAMPORTS_PER_SOL);

        // Estimate transaction fee
        try {
          const feeEstimate = await connection!.getFeeForMessage(
            new SolTransaction().add(
              SystemProgram.transfer({
                fromPubkey,
                toPubkey: recipientPubkey,
                lamports: 1000, // Small amount for fee estimation
              })
            ).compileMessage()
          );
          estimatedFee = feeEstimate?.value || 5000; // Default to 5000 lamports if estimation fails
        } catch (error) {
          console.error("Failed to estimate fee:", error);
          estimatedFee = 5000; // Use default fee
        }
        
        const totalRequired = lamports + estimatedFee;
        
        if (balance! < totalRequired) {
          toast.error("Insufficient SOL balance", {
            description: `You need at least ${(totalRequired / LAMPORTS_PER_SOL).toFixed(4)} SOL (including fees)`,
          });
          return;
        }

        const transaction = new SolTransaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: recipientPubkey,
            lamports,
          }),
        );

        transaction.feePayer = fromPubkey;
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;

        const signedTx = await solanaProvider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        
        // Wait for confirmation with timeout
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'confirmed');

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        await createDonation({
          amount: selectedValue,
          crypto_type: "SOL",
          tx_hash: signature,
          from_addr: fromPubkey.toString(),
          message,
          anonymous: isAnonymous,
          project_id: project.id,
        });

        setShowThankYou(true);
        setTimeout(() => setShowThankYou(false), 3000);

        toast.success("Donation sent successfully!");
      } catch (error: unknown) {
        console.error("SOL donation error:", error);
        
        // Provide more specific error messages
        if (typeof error === "object" && error !== null) {
          const err = error as any;
          
          if (err.message?.includes("User rejected")) {
            toast.error("Transaction rejected", {
              description: "You rejected the transaction in Phantom.",
            });
          } else if (err.message?.includes("insufficient funds")) {
            toast.error("Insufficient funds", {
              description:
                "You don't have enough SOL to complete this transaction.",
            });
          } else if (err.message?.includes("Invalid public key")) {
            toast.error("Invalid wallet address", {
              description: "Please check the recipient wallet address.",
            });
          } else if (err.message?.includes("blockhash")) {
            toast.error("Transaction expired", {
              description: "Please try again with a fresh transaction.",
            });
          } else if (err.message?.includes("Transaction failed")) {
            toast.error("Transaction failed", {
              description: err.message,
            });
          } else {
            toast.error("Failed to send donation", {
              description:
                err.message ||
                "An unexpected error occurred. Please try again.",
            });
          }
        } else {
          toast.error("Failed to send donation", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      } finally {
        setIsSubmitting(false);
        setIsProcessing(false);
      }

      return; // End SOL flow
    }

    // ETH Donation Flow (default)

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
          params: [{ chainId: "0x1" }], // ETH mainnet chainId
        });
      } catch {
        toast.error("Failed to switch to Ethereum Mainnet", {
          description:
            "Please enable Ethereum Mainnet in MetaMask and try again.",
        });
        return;
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.[0]) {
        throw new Error("No accounts found");
      }

      const contractService = new ContractService();

      setIsProcessing(true);

      const ethAmount = selectedValue;

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

  const getSelectedValueETH = () => {
    if (customAmountETH && parseFloat(customAmountETH) > 0) {
      return parseFloat(customAmountETH);
    }
    if (selectedAmountETH !== null && selectedAmountETH > 0) {
      return selectedAmountETH;
    }
    return 0;
  };

  const getSelectedValueUSD = () => {
    const ethAmount = getSelectedValueETH();
    return ethPrice && ethPrice > 0 ? ethAmount * ethPrice : 0;
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
    if (!value) value = "0";
    setCustomAmountETH(value);
    setDisplayValue(value);
    setSelectedAmountETH(null);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success("Link copied to clipboard!", {
        description: "Share this project with your network",
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link", {
        description: "Please try again",
      });
    }
  };

  const shareToX = () => {
    const text = `Check out this amazing project: ${project?.title || "Open Source Project"}! 🚀\n\nSupport innovation with crypto donations 💰`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    toast.success("Opening X (Twitter)", {
      description: "Share this project with your followers!",
    });
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "width=580,height=296");
    toast.success("Opening Facebook", {
      description: "Share this project with your friends!",
    });
  };

  const shareToLinkedIn = () => {
    const title = `Support ${project?.title || "Open Source Project"}`;
    const summary = `Help fund this amazing open-source project with cryptocurrency donations. Every contribution makes a difference!`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(url, "_blank", "width=520,height=570");
    toast.success("Opening LinkedIn", {
      description: "Share this project with your professional network!",
    });
  };

  const shareToWhatsApp = () => {
    const text = `🚀 Check out this amazing project: ${project?.title || "Open Source Project"}!\n\nSupport innovation with crypto donations 💰\n\n${currentUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp", {
      description: "Share this project with your contacts!",
    });
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
          className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
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

                  {!isLoadingPrice && ethPrice && ethPrice > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>
                          Goal: ${getSelectedValueUSD().toFixed(0)} (
                          {getSelectedValueETH().toFixed(3)} {currencySymbol})
                        </span>
                        <span>
                          Raised: ${getSelectedValueUSD().toFixed(0)} (
                          {getSelectedValueETH().toFixed(3)} {currencySymbol})
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

                  {!isLoadingPrice && ethPrice && ethPrice > 0 && (
                    <div className="text-center text-xs text-gray-500 mb-4">
                      1 {currencySymbol} = ${ethPrice.toFixed(2)} USD
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

                  {/* Currency Switcher */}
                  <div className="flex justify-center gap-4 mt-4">
                    {(["ETH", "SOL"] as const).map((cur) => (
                      <motion.button
                        key={cur}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCurrency(cur)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedCurrency === cur
                            ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                            : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {cur}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-gray-400">
                    Help fuel innovation and keep this project growing
                  </p>
                </div>

                {/* Share Section - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className={`w-full p-3 cursor-pointer border rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group ${
                      showShareOptions
                        ? "bg-cyan-600/20 border-cyan-600/50 text-cyan-300"
                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800/70 hover:border-gray-600"
                    }`}
                  >
                    <Share2
                      className={`w-4 h-4 transition-colors ${
                        showShareOptions
                          ? "text-cyan-400"
                          : "group-hover:text-cyan-400"
                      }`}
                    />
                    {showShareOptions
                      ? "Hide share options"
                      : "Share this project"}
                    <motion.div
                      animate={{ rotate: showShareOptions ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showShareOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 grid grid-cols-2 gap-2 overflow-hidden"
                      >
                        {/* X (Twitter) */}
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareToX}
                          className="flex items-center gap-2 p-3 bg-black/50 hover:bg-black/70 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 group"
                        >
                          <TwitterIcon className="w-5 h-5 text-white" />
                          <span className="text-sm text-gray-300 group-hover:text-white">
                            X
                          </span>
                        </motion.button>

                        {/* Facebook */}
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareToFacebook}
                          className="flex items-center gap-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 hover:border-blue-600/50 rounded-lg transition-all duration-200 group"
                        >
                          <FacebookIcon className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-300 group-hover:text-white">
                            Facebook
                          </span>
                        </motion.button>

                        {/* LinkedIn */}
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareToLinkedIn}
                          className="flex items-center gap-2 p-3 bg-blue-700/20 hover:bg-blue-700/30 border border-blue-700/30 hover:border-blue-700/50 rounded-lg transition-all duration-200 group"
                        >
                          <LinkedInIcon className="w-5 h-5 text-blue-300" />
                          <span className="text-sm text-gray-300 group-hover:text-white">
                            LinkedIn
                          </span>
                        </motion.button>

                        {/* WhatsApp */}
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareToWhatsApp}
                          className="flex items-center gap-2 p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 hover:border-green-600/50 rounded-lg transition-all duration-200 group"
                        >
                          <WhatsAppIcon className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-300 group-hover:text-white">
                            WhatsApp
                          </span>
                        </motion.button>

                        {/* Copy Link */}
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={copyToClipboard}
                          className="col-span-2 flex items-center justify-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200 group"
                        >
                          {linkCopied ? (
                            <>
                              <CheckCheck className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-green-400">
                                Link copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                              <span className="text-sm text-gray-300 group-hover:text-white">
                                Copy Link
                              </span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-cyan-400" />
                      Choose your support
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {DONATION_PRESETS.map((preset, index) => {
                        const usdAmount =
                          ethPrice && ethPrice > 0
                            ? preset.amountETH * ethPrice
                            : 0;
                        return (
                          <motion.button
                            key={preset.amountETH}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedAmountETH(preset.amountETH);
                              setCustomAmountETH(preset.amountETH.toString());
                              setDisplayValue(preset.amountETH.toString());
                            }}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                              selectedAmountETH === preset.amountETH ||
                              (customAmountETH &&
                                parseFloat(customAmountETH) ===
                                  preset.amountETH)
                                ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                            }`}
                            disabled={isLoadingPrice}
                          >
                            <div className="text-left">
                              <p className="font-semibold text-white">
                                {preset.amountETH} {currencySymbol}
                              </p>
                              <p className="text-xs text-gray-400">
                                {!isLoadingPrice && ethPrice && ethPrice > 0
                                  ? `≈ $${usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : isLoadingPrice
                                    ? "Loading..."
                                    : "Price unavailable"}
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
                        Custom amount ({currencySymbol})
                      </label>

                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={displayValue}
                          onChange={handleCustomAmountChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          disabled={isLoadingPrice}
                          className={`w-full px-4 py-4 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 disabled:opacity-50 ${
                            inputFocused
                              ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-gray-800/80"
                              : getSelectedValueETH() > 0
                                ? "border-cyan-500/50 bg-gray-800/70"
                                : "border-gray-600 hover:border-gray-500"
                          }`}
                        />

                        {!isLoadingPrice &&
                          ethPrice &&
                          ethPrice > 0 &&
                          getSelectedValueETH() > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            >
                              <div className="text-right">
                                <div className="text-sm text-cyan-400 font-medium">
                                  ≈ ${" "}
                                  {getSelectedValueUSD().toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {networkName}
                                </div>
                              </div>
                            </motion.div>
                          )}

                        {getSelectedValueETH() > 0 &&
                          ((selectedCurrency === "SOL" &&
                            getSelectedValueETH() < 0.001) ||
                            (selectedCurrency === "ETH" &&
                              getSelectedValueETH() < 0.0001)) && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -bottom-6 left-0 text-xs text-red-400"
                            >
                              Minimum amount is{" "}
                              {selectedCurrency === "SOL"
                                ? "0.001 SOL"
                                : "0.0001 ETH"}
                            </motion.div>
                          )}

                        {displayValue &&
                          displayValue !== "0.00" &&
                          displayValue !== "" &&
                          getSelectedValueETH() <= 0 && (
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
                        <span>
                          Minimum:{" "}
                          {selectedCurrency === "SOL"
                            ? "0.001 SOL"
                            : "0.0001 ETH"}
                        </span>
                        {!isLoadingPrice && ethPrice && ethPrice > 0 ? (
                          <span>
                            1 {currencySymbol} = ${ethPrice.toFixed(2)}
                          </span>
                        ) : isLoadingPrice ? (
                          <span>Loading {currencySymbol} price...</span>
                        ) : (
                          <span>{currencySymbol} price unavailable</span>
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
                        checked={!isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(!checked)}
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
                      (selectedCurrency === "SOL" &&
                        getSelectedValueETH() < 0.001) ||
                      (selectedCurrency === "ETH" &&
                        getSelectedValueETH() < 0.0001) ||
                      isLoadingPrice ||
                      !ethPrice ||
                      ethPrice <= 0 ||
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
                    ) : !ethPrice || ethPrice <= 0 ? (
                      <>
                        <Heart className="w-5 h-5" />
                        {currencySymbol} price unavailable - Please refresh
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 group-hover:animate-pulse" />
                        {(selectedCurrency === "SOL" &&
                          getSelectedValueETH() >= 0.001) ||
                        (selectedCurrency === "ETH" &&
                          getSelectedValueETH() >= 0.0001)
                          ? `Support with ${getSelectedValueETH().toFixed(4)} ${currencySymbol} (≈ $${getSelectedValueUSD().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                          : getSelectedValueETH() > 0 &&
                              ((selectedCurrency === "SOL" &&
                                getSelectedValueETH() < 0.001) ||
                                (selectedCurrency === "ETH" &&
                                  getSelectedValueETH() < 0.0001))
                            ? `Minimum donation is ${selectedCurrency === "SOL" ? "0.001 SOL" : "0.0001 ETH"}`
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
                {getSelectedValueETH().toFixed(4)} {currencySymbol}
                {ethPrice && ethPrice > 0
                  ? ` (≈ $${getSelectedValueUSD().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                  : ""}
                donated
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
