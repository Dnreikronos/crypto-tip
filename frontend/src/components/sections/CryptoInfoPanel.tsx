import { Bitcoin, Coins } from 'lucide-react'
import { motion } from 'framer-motion'

export function CryptoInfoPanel() {
	const cryptos = [
		{
			name: "Bitcoin",
			symbol: "BTC",
			icon: <Bitcoin className="h-4 w-4 text-yellow-500" />,
			color: "yellow"
		},
		{
			name: "Ethereum",
			symbol: "ETH",
			icon: (
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
					<path d="M12 1.75L5.75 12.25L12 16L18.25 12.25L12 1.75Z" fill="currentColor" />
					<path d="M12 16L5.75 12.25L12 22.25L18.25 12.25L12 16Z" fill="currentColor" />
				</svg>
			),
			color: "cyan"
		},
		{
			name: "Solana",
			symbol: "SOL",
			icon: (
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
					<path d="M5 5H15.33L5 15.33V5Z" fill="currentColor" />
					<path d="M5 15.33L15.33 5H19L8.67 15.33H5Z" fill="currentColor" />
					<path d="M8.67 15.33H19V19H5V15.33H8.67Z" fill="currentColor" />
				</svg>
			),
			color: "purple"
		},
		{
			name: "Others",
			symbol: "USDC, XRP, etc",
			icon: <Coins className="h-4 w-4 text-gray-300" />,
			color: "gray"
		}
	];

	return (
		<motion.div
			className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg p-6 shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.3 }}
			whileHover={{ boxShadow: "0 0 25px rgba(34, 211, 238, 0.1)" }}
		>
			<motion.h3
				className="text-xl font-bold mb-4 text-white"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4 }}
			>
				Supported Cryptocurrencies
			</motion.h3>
			<div className="grid grid-cols-2 gap-4">
				{cryptos.map((crypto, index) => (
					<motion.div
						key={index}
						className={`flex items-center p-3 bg-gray-800/70 rounded-lg border border-${crypto.color}-500/20`}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1 * (index + 2) }}
						whileHover={{
							scale: 1.05,
							boxShadow: crypto.color === "gray"
								? "0 0 15px rgba(156, 163, 175, 0.2)"
								: `0 0 15px rgba(${crypto.color === "yellow" ? "234, 179, 8" : crypto.color === "cyan" ? "6, 182, 212" : "147, 51, 234"}, 0.2)`
						}}
					>
						<motion.div
							className={`h-8 w-8 rounded-full bg-${crypto.color}-900/20 flex items-center justify-center mr-3`}
							whileHover={{ rotate: 15 }}
							whileTap={{ scale: 0.9 }}
						>
							<motion.div
								animate={{
									y: [0, -2, 0, 2, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									repeatDelay: index,
								}}
								className={`text-${crypto.color}-500`}
							>
								{crypto.icon}
							</motion.div>
						</motion.div>
						<div>
							<motion.h4
								className="font-medium text-white"
								whileHover={{ color: crypto.color === "gray" ? "#e5e7eb" : "#" + (crypto.color === "yellow" ? "eab308" : crypto.color === "cyan" ? "06b6d4" : "9333ea") }}
							>
								{crypto.name}
							</motion.h4>
							<p className="text-xs text-gray-400">{crypto.symbol}</p>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	)
}
