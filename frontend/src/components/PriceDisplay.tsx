import { useCryptoPrice, useMultipleCryptoPrices } from '@/hooks/useCryptoPrice';
import { RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SinglePriceDisplayProps {
  symbol: string;
  showRefresh?: boolean;
}

export function SinglePriceDisplay({ symbol, showRefresh = false }: SinglePriceDisplayProps) {
  const { price, isLoading, error, lastUpdated, refresh } = useCryptoPrice({
    symbol,
    refreshInterval: 120000, // 2 minutes
    autoRefresh: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400">Loading {symbol} price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
        <TrendingDown className="w-4 h-4 text-red-400" />
        <span className="text-red-400">Error loading {symbol} price</span>
        {showRefresh && (
          <button
            onClick={refresh}
            className="ml-auto p-1 hover:bg-red-800/30 rounded"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="font-medium text-white">{symbol}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-mono">
          ${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
        
        {showRefresh && (
          <button
            onClick={refresh}
            className="p-1 hover:bg-gray-700/50 rounded transition-colors"
            title="Refresh price"
          >
            <RefreshCw className="w-3 h-3 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface MultiplePricesDisplayProps {
  symbols: string[];
  showRefresh?: boolean;
}

export function MultiplePricesDisplay({ symbols, showRefresh = false }: MultiplePricesDisplayProps) {
  const { prices, isLoading, errors, lastUpdated, refresh } = useMultipleCryptoPrices({
    symbols,
    refreshInterval: 120000, // 2 minutes
    autoRefresh: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {symbols.map((symbol) => (
          <div key={symbol} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading {symbol} price...</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Cryptocurrency Prices</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          {showRefresh && (
            <button
              onClick={refresh}
              className="p-2 hover:bg-gray-700/50 rounded transition-colors"
              title="Refresh all prices"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {symbols.map((symbol) => {
        const price = prices[symbol];
        const error = errors[symbol];

        return (
          <motion.div
            key={symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              error
                ? 'bg-red-900/20 border-red-700/50'
                : 'bg-gray-800/50 border-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {error ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-400" />
              )}
              <span className="font-medium text-white">{symbol}</span>
            </div>
            
            <div className="text-right">
              {error ? (
                <span className="text-red-400 text-sm">Error loading price</span>
              ) : price ? (
                <span className="text-green-400 font-mono">
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-gray-400">No data</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Example usage component
export function PriceDisplayExample() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Crypto Price Display Examples</h2>
      
      {/* Single price display */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Single Price Display</h3>
        <SinglePriceDisplay symbol="ETH" showRefresh={true} />
      </div>
      
      {/* Multiple prices display */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Multiple Prices Display</h3>
        <MultiplePricesDisplay 
          symbols={['ETH', 'BTC', 'SOL', 'ADA']} 
          showRefresh={true} 
        />
      </div>
    </div>
  );
} 