'use client';

import { motion } from 'framer-motion';
import { Wallet, Globe, Shield, Zap, Code, Users } from 'lucide-react';

export default function FeaturesSection() {
	const features = [
		{
			icon: <Wallet className="h-10 w-10" />,
			title: "Multiple Cryptocurrencies",
			description: "Accept donations in BTC, ETH, SOL, and more. All major cryptocurrencies supported.",
			color: "from-cyan-500 to-blue-600"
		},
		{
			icon: <Globe className="h-10 w-10" />,
			title: "Custom Profile Page",
			description: "Create a personalized donation page to showcase your projects and funding goals.",
			color: "from-blue-500 to-indigo-600"
		},
		{
			icon: <Shield className="h-10 w-10" />,
			title: "Secure Transactions",
			description: "Direct wallet-to-wallet transfers with no middlemen or hidden fees.",
			color: "from-indigo-500 to-purple-600"
		},
		{
			icon: <Zap className="h-10 w-10" />,
			title: "Instant Setup",
			description: "Get your donation page up and running in less than 5 minutes.",
			color: "from-purple-500 to-pink-600"
		},
		{
			icon: <Code className="h-10 w-10" />,
			title: "Embed Anywhere",
			description: "Add your donation button to GitHub, personal websites, or social media.",
			color: "from-pink-500 to-rose-600"
		},
		{
			icon: <Users className="h-10 w-10" />,
			title: "Developer Community",
			description: "Join a network of developers funding and supporting each other's work.",
			color: "from-rose-500 to-orange-600"
		}
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2
			}
		}
	};

	const itemVariants = {
		hidden: { y: 50, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5
			}
		}
	};

	return (
		<section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl rounded-full bg-cyan-900/10 blur-3xl -z-10" />

			<div className="max-w-7xl mx-auto">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
						Built for Developers, By Developers
					</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Everything you need to receive funding for your open-source projects and development work.
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
							variants={itemVariants}
							whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 224, 255, 0.15)" }}
						>
							<div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-5`}>
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
							<p className="text-gray-400">{feature.description}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
