'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWalletProviders } from "@/hooks/useWalletProviders";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

export function ButtonConnectWallet() {
  const [userAccount, setUserAccount] = useState<string>("");
  const providers = useWalletProviders();
  const metaMaskProvider = providers.find(p => p.info.name === "MetaMask");

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = await providerWithInfo.provider
        .request({ method: "eth_requestAccounts" }) as string[] | undefined;

      if (accounts?.[0]) {
        setUserAccount(accounts[0]);
        toast.success('Wallet Connected', {
          description: 'Your MetaMask wallet has been connected successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error('Connection Failed', {
        description: 'Unable to connect to MetaMask. Please try again.',
      });
    }
  };

  const handleDisconnect = () => {
    setUserAccount("");
    toast.info('Wallet Disconnected', {
      description: 'Your MetaMask wallet has been disconnected.',
    });
  };

  if (userAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              {metaMaskProvider?.info.icon && (
                <Image 
                  src={metaMaskProvider.info.icon} 
                  alt="MetaMask" 
                  width={20}
                  height={20}
                  className="relative z-10"
                />
              )}
            </div>
            <span className="text-gray-300 group-hover:text-white transition-colors">
              {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
            </span>
          </div>
        </Button>
      </motion.div>
    );
  }

  if (!metaMaskProvider) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
        >
          Install MetaMask
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={() => handleConnect(metaMaskProvider)}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 group"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
            {metaMaskProvider.info.icon && (
              <Image 
                src={metaMaskProvider.info.icon} 
                alt="MetaMask" 
                width={20}
                height={20}
                className="relative z-10"
              />
            )}
          </div>
          <span>Connect MetaMask</span>
        </div>
      </Button>
    </motion.div>
  );
} 