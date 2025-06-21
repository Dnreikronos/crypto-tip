interface PriceCache {
  price: number;
  timestamp: number;
  symbol: string;
}

interface RateLimitInfo {
  requests: number;
  resetTime: number;
}

class CryptoPriceService {
  private cache = new Map<string, PriceCache>();
  private rateLimits = new Map<string, RateLimitInfo>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 45; // Conservative limit for CoinGecko

  private isRateLimited(apiKey: string): boolean {
    const limit = this.rateLimits.get(apiKey);
    if (!limit) return false;

    const now = Date.now();
    if (now > limit.resetTime) {
      // Reset the rate limit window
      this.rateLimits.set(apiKey, {
        requests: 0,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
      return false;
    }

    return limit.requests >= this.MAX_REQUESTS_PER_MINUTE;
  }

  private incrementRateLimit(apiKey: string): void {
    const now = Date.now();
    const limit = this.rateLimits.get(apiKey);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(apiKey, {
        requests: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
    } else {
      limit.requests++;
    }
  }

  private isCacheValid(cacheEntry: PriceCache): boolean {
    return Date.now() - cacheEntry.timestamp < this.CACHE_DURATION;
  }

  private async fetchFromCoinGecko(symbol: string): Promise<number> {
    const apiKey = "coingecko";

    if (this.isRateLimited(apiKey)) {
      throw new Error("CoinGecko rate limit exceeded");
    }

    const coinId = this.symbolToCoinGeckoId(symbol);
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&precision=2`;

    console.log(`Fetching ${symbol} price from CoinGecko:`, url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CryptoTip/1.0",
      },
    });

    this.incrementRateLimit(apiKey);

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("CoinGecko response:", data);

    const price = data[coinId]?.usd;
    if (typeof price !== "number" || price <= 0) {
      throw new Error(`Invalid price from CoinGecko: ${JSON.stringify(data)}`);
    }

    return price;
  }

  private async fetchFromCoinMarketCap(symbol: string): Promise<number> {
    const apiKey = "coinmarketcap";

    if (this.isRateLimited(apiKey)) {
      throw new Error("CoinMarketCap rate limit exceeded");
    }

    const response = await fetch(`/api/quotes?symbol=${symbol}`);

    this.incrementRateLimit(apiKey);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `CoinMarketCap API error: ${response.status} - ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("CoinMarketCap response:", data);

    if (typeof data.price !== "number" || data.price <= 0) {
      throw new Error(
        `Invalid price from CoinMarketCap: ${JSON.stringify(data)}`,
      );
    }

    return data.price;
  }

  private async fetchFromCryptoCompare(symbol: string): Promise<number> {
    const apiKey = "cryptocompare";

    if (this.isRateLimited(apiKey)) {
      throw new Error("CryptoCompare rate limit exceeded");
    }

    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`;

    console.log(`Fetching ${symbol} price from CryptoCompare:`, url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    this.incrementRateLimit(apiKey);

    if (!response.ok) {
      throw new Error(
        `CryptoCompare API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("CryptoCompare response:", data);

    const price = data.USD;
    if (typeof price !== "number" || price <= 0) {
      throw new Error(
        `Invalid price from CryptoCompare: ${JSON.stringify(data)}`,
      );
    }

    return price;
  }

  private symbolToCoinGeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      ETH: "ethereum",
      BTC: "bitcoin",
      USDT: "tether",
      BNB: "binancecoin",
      SOL: "solana",
      ADA: "cardano",
      DOT: "polkadot",
      MATIC: "matic-network",
      LINK: "chainlink",
      UNI: "uniswap",
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  async getPrice(symbol: string, forceRefresh = false): Promise<number> {
    const cacheKey = symbol.toUpperCase();

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        console.log(`Using cached price for ${symbol}:`, cached.price);
        return cached.price;
      }
    }

    const errors: string[] = [];

    // Try APIs in order of preference
    const apis = [
      { name: "CoinGecko", fetch: () => this.fetchFromCoinGecko(symbol) },
      {
        name: "CoinMarketCap",
        fetch: () => this.fetchFromCoinMarketCap(symbol),
      },
      {
        name: "CryptoCompare",
        fetch: () => this.fetchFromCryptoCompare(symbol),
      },
    ];

    for (const api of apis) {
      try {
        console.log(`Attempting to fetch ${symbol} price from ${api.name}...`);
        const price = await api.fetch();

        // Cache the successful result
        this.cache.set(cacheKey, {
          price,
          timestamp: Date.now(),
          symbol: cacheKey,
        });

        console.log(
          `Successfully fetched ${symbol} price from ${api.name}:`,
          price,
        );
        return price;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(`${api.name} failed for ${symbol}:`, errorMessage);
        errors.push(`${api.name}: ${errorMessage}`);

        // Continue to next API
        continue;
      }
    }

    // If all APIs failed, throw error with details
    throw new Error(
      `Failed to fetch ${symbol} price from all sources:\n${errors.join("\n")}`,
    );
  }

  // Get multiple prices at once (with batching where possible)
  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const errors: Record<string, string> = {};

    // Process each symbol
    await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          results[symbol] = await this.getPrice(symbol);
        } catch (error) {
          errors[symbol] =
            error instanceof Error ? error.message : "Unknown error";
        }
      }),
    );

    // Log any errors
    if (Object.keys(errors).length > 0) {
      console.warn("Some price fetches failed:", errors);
    }

    return results;
  }

  // Clear cache for a specific symbol or all
  clearCache(symbol?: string): void {
    if (symbol) {
      this.cache.delete(symbol.toUpperCase());
    } else {
      this.cache.clear();
    }
  }

  // Get cache status
  getCacheInfo(): Array<{
    symbol: string;
    price: number;
    age: number;
    valid: boolean;
  }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([symbol, cache]) => ({
      symbol,
      price: cache.price,
      age: now - cache.timestamp,
      valid: this.isCacheValid(cache),
    }));
  }

  // Get rate limit status
  getRateLimitInfo(): Array<{
    api: string;
    requests: number;
    resetIn: number;
  }> {
    const now = Date.now();
    return Array.from(this.rateLimits.entries()).map(([api, limit]) => ({
      api,
      requests: limit.requests,
      resetIn: Math.max(0, limit.resetTime - now),
    }));
  }
}

// Export singleton instance
export const cryptoPriceService = new CryptoPriceService();

// Export types for use in components
export type { PriceCache, RateLimitInfo };
