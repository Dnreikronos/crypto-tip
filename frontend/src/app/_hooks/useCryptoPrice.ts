/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from "react";
import { cryptoPriceService } from "@/app/lib/crypto-price";

interface UseCryptoPriceOptions {
  symbol: string;
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
}

interface UseCryptoPriceReturn {
  price: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export function useCryptoPrice({
  symbol,
  refreshInterval = 120000, // 2 minutes default
  autoRefresh = true,
}: UseCryptoPriceOptions): UseCryptoPriceReturn {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = useCallback(
    async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedPrice = await cryptoPriceService.getPrice(
          symbol,
          forceRefresh,
        );

        setPrice(fetchedPrice);
        setLastUpdated(new Date());

        console.log(`Price updated for ${symbol}:`, fetchedPrice);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error(`Error fetching ${symbol} price:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [symbol],
  );

  const refresh = useCallback(async () => {
    await fetchPrice(true); // Force refresh
  }, [fetchPrice]);

  const clearCache = useCallback(() => {
    cryptoPriceService.clearCache(symbol);
  }, [symbol]);

  useEffect(() => {
    // Initial fetch
    fetchPrice();

    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchPrice();
      }, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchPrice, autoRefresh, refreshInterval]);

  return {
    price,
    isLoading,
    error,
    lastUpdated,
    refresh,
    clearCache,
  };
}

// Hook for multiple cryptocurrencies
interface UseMultipleCryptoPricesOptions {
  symbols: string[];
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface UseMultipleCryptoPricesReturn {
  prices: Record<string, number>;
  isLoading: boolean;
  errors: Record<string, string>;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  clearCache: (symbol?: string) => void;
}

export function useMultipleCryptoPrices({
  symbols,
  refreshInterval = 120000,
  autoRefresh = true,
}: UseMultipleCryptoPricesOptions): UseMultipleCryptoPricesReturn {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const fetchedPrices = await cryptoPriceService.getPrices(symbols);

      setPrices(fetchedPrices);
      setLastUpdated(new Date());

      console.log("Prices updated:", fetchedPrices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      // Set error for all symbols if batch fetch fails
      const allErrors: Record<string, string> = {};
      symbols.forEach((symbol) => {
        allErrors[symbol] = errorMessage;
      });
      setErrors(allErrors);
      console.error("Error fetching multiple prices:", err);
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  const refresh = useCallback(async () => {
    await fetchPrices();
  }, [fetchPrices]);

  const clearCache = useCallback((symbol?: string) => {
    cryptoPriceService.clearCache(symbol);
  }, []);

  useEffect(() => {
    if (symbols.length === 0) return;

    // Initial fetch
    fetchPrices();

    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        fetchPrices();
      }, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchPrices, autoRefresh, refreshInterval]);

  return {
    prices,
    isLoading,
    errors,
    lastUpdated,
    refresh,
    clearCache,
  };
}
