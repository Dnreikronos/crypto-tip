'use client'

import { ArrowLeft, Bitcoin, Share2, Clipboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ProjectPreviewProps {
	project: {
		title: string;
		description: string;
		goal: number;
		raised: number;
		walletAddr: string;
	};
	onBack: () => void;
}

export function ProjectPreview({ project, onBack }: ProjectPreviewProps) {
	const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;

	function copyToClipboard() {
		navigator.clipboard.writeText(project.walletAddr)
			.then(() => {
				toast.success("Wallet address copied to clipboard")
			})
			.catch(() => {
				toast.error("Failed to copy address")
			})
	}

	return (
		<div className="bg-gray-900 border border-gray-700 rounded-lg p-6 md:p-8 shadow-lg animate-fade-in">
			<div className="flex justify-between items-center mb-6">
				<Button
					onClick={onBack}
					variant="ghost"
					className="text-cyan-400 hover:bg-gray-800 cursor-pointer"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
				</Button>

				<Button
					variant="outline"
					className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white cursor-pointer"
					onClick={() => {
						toast.info("Share link copied to clipboard")
					}}
				>
					<Share2 className="mr-2 h-4 w-4" /> Share Preview
				</Button>
			</div>

			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-4 text-white">{project.title}</h1>
				<div className="max-w-2xl mx-auto">
					<p className="text-gray-400 mb-6 whitespace-pre-line">
						{project.description}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/10 flex flex-col items-center justify-center">
					<p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Goal</p>
					<p className="text-2xl font-bold text-white flex items-center">
						<Bitcoin className="h-5 w-5 text-cyan-400 mr-2" />
						{project.goal.toFixed(2)} ETH
					</p>
				</div>

				<div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/10 flex flex-col items-center justify-center">
					<p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Raised</p>
					<p className="text-2xl font-bold text-cyan-400 flex items-center">
						<Bitcoin className="h-5 w-5 text-cyan-400 mr-2" />
						{project.raised.toFixed(2)} ETH
					</p>
				</div>

				<div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/10 flex flex-col items-center justify-center">
					<p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Progress</p>
					<p className="text-2xl font-bold text-cyan-400">{Math.round(progress)}%</p>
					<div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
						<div
							className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full"
							style={{ width: `${Math.min(progress, 100)}%` }}
						></div>
					</div>
				</div>
			</div>

			<div className="mb-8">
				<h3 className="text-xl font-bold mb-4 text-white">Support This Project</h3>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					{[0.01, 0.05, 0.1, 0.5].map((amount) => (
						<button
							key={amount}
							className="bg-gray-800 border border-cyan-500/20 rounded-lg py-3 px-4 text-white cursor-pointer transition-all hover:bg-gray-700"
							onClick={() => {
								toast.info(`Selected ${amount} ETH donation`)
							}}
						>
							<span className="block text-lg font-semibold">{amount} ETH</span>
							<span className="text-xs text-gray-400">Support</span>
						</button>
					))}
				</div>
				<div className="mt-4">
					<button
						className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg py-3 font-medium hover:opacity-90 transition-all"
						onClick={() => {
							toast.info("Donation process would start here")
						}}
					>
						Donate Now
					</button>
				</div>
			</div>

			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
				<h3 className="text-lg font-bold mb-4 text-white">Wallet Address</h3>
				<div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
					<code className="text-sm text-gray-400 font-mono truncate">
						{project.walletAddr}
					</code>
					<Button
						variant="ghost"
						size="sm"
						className="text-gray-400 hover:text-cyan-400"
						onClick={copyToClipboard}
					>
						<span className="sr-only">Copy address</span>
						<Clipboard className="h-4 w-4" />
					</Button>
				</div>
				<p className="mt-2 text-xs text-gray-400">
					Send ETH to this address to support the project directly
				</p>
			</div>

			<div className="text-center text-xs text-gray-400">
				<p>This is a preview of how your project page will look</p>
			</div>
		</div>
	);
}
