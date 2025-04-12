import { Bitcoin, Coins } from 'lucide-react'

export function CryptoInfoPanel() {
  return (
    <div className="bg-cyan-900/10 border border-gray-700/50 rounded-2xl p-6 shadow-lg animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-white">Supported Cryptocurrencies</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center p-3 bg-muted rounded-lg border border-amber-500/20">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
            <Bitcoin className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h4 className="font-medium text-black">Bitcoin</h4>
            <p className="text-xs text-muted-foreground">BTC</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-muted rounded-lg border border-cyan-400/20">
          <div className="h-8 w-8 rounded-full bg-cyan-400/20 flex items-center justify-center mr-3">
            <div className="h-4 w-4 text-cyan-400">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1.75L5.75 12.25L12 16L18.25 12.25L12 1.75Z" fill="currentColor" />
                <path d="M12 16L5.75 12.25L12 22.25L18.25 12.25L12 16Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-black">Ethereum</h4>
            <p className="text-xs text-muted-foreground">ETH</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-muted rounded-lg border border-purple-500/20">
          <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
            <div className="h-4 w-4 text-purple-500">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5H15.33L5 15.33V5Z" fill="currentColor" />
                <path d="M5 15.33L15.33 5H19L8.67 15.33H5Z" fill="currentColor" />
                <path d="M8.67 15.33H19V19H5V15.33H8.67Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-black">Solana</h4>
            <p className="text-xs text-muted-foreground">SOL</p>
          </div>
        </div>
        <div className="flex items-center p-3 bg-muted rounded-lg border border-border">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center mr-3">
            <Coins className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h4 className="font-medium text-black">Others</h4>
            <p className="text-xs text-muted-foreground">USDC, XRP, etc</p>
          </div>
        </div>
      </div>
    </div>
  )
}