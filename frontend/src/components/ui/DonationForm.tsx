"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createDonation } from "@/services/donationService";
import type { ProjectResponse } from "@/services/projectService";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DonationFormProps {
  project: ProjectResponse | null;
}

export default function DonationForm({ project }: DonationFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [currency, setCurrency] = useState("ethereum");
  const [showPublicly, setShowPublicly] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const usdEquivalent =
    currency === "ethereum"
      ? amount * 30
      : currency === "bitcoin"
        ? amount * 60000
        : amount * 100;

  const handleAmountChange = (value: string) => {
    const newAmount = parseFloat(value);
    setAmount(isNaN(newAmount) ? 0 : newAmount);
  };

  async function handleSend() {
    if (!project) {
      toast.error("No project selected");
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
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.[0]) {
        throw new Error("No accounts found");
      }

      const fromAddress = accounts[0];
      const toAddress = project.wallet_addr;
      const amountInWei = (amount * 1e18).toString(16);

      setIsProcessing(true);

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          { from: fromAddress, to: toAddress, value: `0x${amountInWei}` },
        ],
      })) as string;

      await createDonation({
        amount,
        crypto_type: currency,
        tx_hash: txHash,
        from_addr: fromAddress,
        message,
        anonymous: !showPublicly,
        project_id: project.id,
      });

      toast.success("Donation sent successfully!");
      router.refresh();
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
  }

  return (
    <motion.div
      className="bg-gray-900 rounded-lg p-6 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              className="animate-spin h-10 w-10 text-cyan-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg font-semibold">Processing Transaction...</p>
            <p className="text-sm text-gray-400">
              Please check MetaMask to confirm.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {project ? `Support ${project.title}` : "Support DevJane"}
      </motion.h2>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-400 mb-2">Donation Amount</p>
          <motion.div
            className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-cyan-500 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <Input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-4xl font-bold bg-transparent border-none focus:ring-0 h-auto p-3 flex-1"
              disabled={isSubmitting || isProcessing}
            />
            <div className="text-lg px-4 py-1 rounded-r-lg bg-gray-700 text-cyan-400 font-semibold">
              {currency === "ethereum"
                ? "ETH"
                : currency === "bitcoin"
                  ? "BTC"
                  : "SOL"}
            </div>
          </motion.div>
          <motion.p
            className="text-right text-gray-400 text-sm mt-2"
            key={usdEquivalent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            ≈ ${usdEquivalent.toLocaleString()}
          </motion.p>

          {project && (
            <div className="mt-2">
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{
                    width: `${Math.min((project.raised / project.goal) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-sm text-gray-400">
                <span>Raised: ${project.raised.toLocaleString()}</span>
                <span>Goal: ${project.goal.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="my-4">
            <Slider
              value={[amount]}
              min={5}
              max={500}
              step={1}
              onValueChange={(vals) => setAmount(vals[0])}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
              disabled={isSubmitting || isProcessing}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>500</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-400 mb-3">Select Cryptocurrency</p>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              className="relative p-4 rounded-lg border border-gray-700 bg-gray-800 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="h-8 w-8 bg-yellow-500/50 rounded-full flex items-center justify-center">
                <span className="text-lg">₿</span>
              </div>
              <span className="text-sm">Bitcoin</span>
              <span className="text-xs text-gray-500">BTC</span>
            </motion.button>

            <motion.button
              className={`cursor-pointer p-4 rounded-lg border ${
                currency === "ethereum"
                  ? "border-cyan-500 bg-cyan-900/20"
                  : "border-gray-700 bg-gray-800"
              } flex flex-col items-center gap-2`}
              onClick={() => setCurrency("ethereum")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              disabled={isSubmitting || isProcessing}
            >
              <motion.div
                className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center"
                animate={{ scale: currency === "ethereum" ? 1.1 : 1 }}
              >
                <span className="text-lg">Ξ</span>
              </motion.div>
              <span className="text-sm">Ethereum</span>
              <span className="text-xs text-gray-500">ETH</span>
            </motion.button>

            <motion.button
              className="relative p-4 rounded-lg border border-gray-700 bg-gray-800 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <div className="h-8 w-8 bg-green-500/50 rounded-full flex items-center justify-center">
                <span className="text-lg">◎</span>
              </div>
              <span className="text-sm">Solana</span>
              <span className="text-xs text-gray-500">SOL</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-400">Leave a Message (Optional)</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show publicly</span>
              <Switch
                checked={showPublicly}
                onCheckedChange={setShowPublicly}
                disabled={isSubmitting || isProcessing}
              />
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              placeholder="Write a message of support..."
              className="bg-gray-800 border-gray-700 resize-none h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting || isProcessing}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSend}
              className="cursor-pointer w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity"
              disabled={isSubmitting || isProcessing}
            >
              <div className="flex items-center justify-center">
                {isSubmitting ? (
                  "Preparing..."
                ) : (
                  <>
                    Send {amount}{" "}
                    {currency === "ethereum"
                      ? "ETH"
                      : currency === "bitcoin"
                        ? "BTC"
                        : "SOL"}{" "}
                    Tip
                    <motion.svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </motion.svg>
                  </>
                )}
              </div>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </motion.svg>
          <span>Secure transaction via blockchain</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
