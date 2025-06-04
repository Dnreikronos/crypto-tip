"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { createDonation } from "@/services/donationService";
import type { ProjectResponse } from "@/services/projectService";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiBitcoin, SiEthereum, SiSolana } from "react-icons/si";

interface DonationFormProps {
  project: ProjectResponse | null;
}

export default function DonationForm({ project }: DonationFormProps) {
  const router = useRouter();
  const [usdAmount, setUsdAmount] = useState("50");
  const [currency, setCurrency] = useState("ethereum");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(false);
  const [showPublicly, setShowPublicly] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usdAmountNumber = parseFloat(usdAmount) || 0;
  const cryptoAmount = conversionRate ? usdAmountNumber / conversionRate : 0;

  useEffect(() => {
    async function fetchRate() {
      setIsRateLoading(true);
      try {
        const res = await fetch(`/api/quotes?slug=${currency}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch rate");
        setConversionRate(data.price);
      } catch (error: unknown) {
        console.error("Error fetching conversion rate:", error);
        toast.error("Failed to fetch conversion rate");
      } finally {
        setIsRateLoading(false);
      }
    }
    fetchRate();
  }, [currency]);

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

      const amountInWei = (cryptoAmount * 1e18).toString(16);

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: fromAddress,
            to: toAddress,
            value: `0x${amountInWei}`,
          },
        ],
      })) as string;

      await createDonation({
        amount: cryptoAmount,
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
    }
  }

  return (
    <motion.div
      className="bg-gray-900 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
          <p className="text-sm text-gray-400 mb-2">Donation Amount (USD)</p>
          <div className="flex items-baseline gap-3">
            <motion.span className="text-4xl font-bold" key={usdAmount}>
              ${usdAmount}
            </motion.span>
            <motion.span className="text-gray-400" key={cryptoAmount}>
              ≈{" "}
              {isRateLoading
                ? "Loading..."
                : `${cryptoAmount.toFixed(6)} ${currency === "ethereum" ? "ETH" : currency === "bitcoin" ? "BTC" : "SOL"}`}
            </motion.span>
          </div>

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

          <Input
            type="number"
            min="0"
            step="0.01"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            className="bg-gray-800 text-white placeholder-gray-500 mb-2"
          />
          <Slider
            value={[usdAmountNumber]}
            min={5}
            max={500}
            step={1}
            onValueChange={(vals) => setUsdAmount(vals[0].toString())}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 USD</span>
            <span>500 USD</span>
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
              className={`relative p-4 rounded-lg border border-gray-700 bg-gray-800 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed`}
              disabled
            >
              <div className="absolute top-2 right-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="h-8 w-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <SiBitcoin className="h-5 w-5 text-yellow-400" />
              </div>
              <span className="text-sm">Bitcoin</span>
              <span className="text-xs text-gray-500">BTC</span>
            </motion.button>

            <motion.button
              className={`cursor-pointer p-4 rounded-lg border ${currency === "ethereum" ? "border-cyan-500 bg-cyan-900/20" : "border-gray-700 bg-gray-800"} flex flex-col items-center gap-2`}
              onClick={() => setCurrency("ethereum")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: currency === "ethereum" ? 1.1 : 1,
                  backgroundColor:
                    currency === "ethereum" ? "#06b6d4" : "#06b6d4",
                }}
              >
                <SiEthereum className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-sm">Ethereum</span>
              <span className="text-xs text-gray-500">ETH</span>
            </motion.button>

            <motion.button
              className={`relative p-4 rounded-lg border border-gray-700 bg-gray-800 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed`}
              disabled
            >
              <div className="absolute top-2 right-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <SiSolana className="h-5 w-5 text-purple-400" />
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
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-400">
                {showPublicly ? "Public Donation" : "Anonymous"}
              </span>
              <Switch
                checked={showPublicly}
                onCheckedChange={setShowPublicly}
              />
            </label>
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
              disabled={isSubmitting}
            >
              <motion.div className="flex items-center justify-center">
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    Send ${usdAmount} Tip
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
              </motion.div>
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
