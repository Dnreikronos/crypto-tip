'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bitcoin, Coins, ArrowRight, Sparkles } from 'lucide-react'
import { TipsInfoPanel } from './TipsInfoPanel'
import { CryptoInfoPanel } from './CryptoInfoPanel'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectPreview } from './ProjectPreview'
import { motion, AnimatePresence } from 'framer-motion'

type FormValues = {
	title: string;
	description: string;
	goal: string;
	walletAddr: string;
	acceptTerms: boolean;
}

export default function CreateProjectPage() {
	const [previewMode, setPreviewMode] = useState(false)
	const router = useRouter()

	const form = useForm<FormValues>({
		defaultValues: {
			title: '',
			description: '',
			goal: '',
			walletAddr: '',
			acceptTerms: false,
		},
	})

	const formValues = form.watch()

	async function onSubmit(values: FormValues) {
		try {
			console.log('Project data:', values)

			toast.custom(
				() => (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -50 }}
						className="bg-gradient-to-r from-cyan-500/90 to-purple-500/90 p-4 rounded-lg shadow-lg border border-white/10 flex items-center"
					>
						<Sparkles className="h-5 w-5 mr-3 text-white" />
						<span className="text-white font-medium">
							Project created successfully!
						</span>
					</motion.div>
				),
				{ duration: 3000 }
			)

			setTimeout(() => router.push('/creator-tip'), 1500)
		} catch (error) {
			toast.error('Failed to create project. Please try again.')
			console.error(error)
		}
	}

	function togglePreview() {
		setPreviewMode(!previewMode)
	}

	return (
		<div className="min-h-screen text-gray-100 relative overflow-hidden w-full">
			<div className="container max-w-6xl mx-auto px-4 py-16 relative z-10">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
				>
					<motion.div
						className="inline-flex items-center justify-center mb-6 bg-gray-800/80 p-3 rounded-full border border-cyan-500/30 shadow-lg"
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{
							duration: 0.5,
							type: "spring",
							stiffness: 200
						}}
						whileHover={{
							rotate: [0, -10, 10, -5, 5, 0],
							transition: { duration: 0.5 }
						}}
					>
						<Coins className="h-8 w-8 text-cyan-500" />
					</motion.div>
					<motion.h1
						className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.7, delay: 0.2 }}
					>
						<motion.span
							initial={{ display: "inline-block" }}

						>
							Create Your Project Funding
						</motion.span>
					</motion.h1>
					<motion.p
						className="text-lg text-gray-400 max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.4 }}
					>
						Set up your crypto funding page and start receiving support from around the world
					</motion.p>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
					<AnimatePresence mode="wait">
						{previewMode ? (
							<motion.div
								key="preview"
								className="lg:col-span-2"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.4 }}
							>
								<ProjectPreview
									project={{
										title: formValues.title || 'Your Amazing Project',
										description: formValues.description || 'Project description will appear here...',
										goal: parseFloat(formValues.goal || '0'),
										raised: 0,
										walletAddr: formValues.walletAddr || '0x...',
									}}
									onBack={togglePreview}
								/>
							</motion.div>
						) : (
							<motion.div
								key="form"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.5 }}
							>
								<motion.div
									className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg p-6 md:p-8 shadow-lg"
									whileHover={{ boxShadow: "0 0 25px rgba(34, 211, 238, 0.1)" }}
									transition={{ duration: 0.3 }}
								>
									<div className="flex justify-between items-center mb-6">
										<h2 className="text-2xl font-bold text-white">Project Details</h2>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												onClick={togglePreview}
												variant="ghost"
												className="text-cyan-400 cursor-pointer "
											>
												Preview
												<motion.div
													initial={{ x: 0 }}
													animate={{ x: [0, 5, 0] }}
													transition={{
														duration: 1.5,
														repeat: Infinity,
														repeatDelay: 2,
														ease: "easeInOut"
													}}
												>
													<ArrowRight className="ml-2 h-4 w-4" />
												</motion.div>
											</Button>
										</motion.div>
									</div>

									<Form {...form}>
										<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
											<FormField
												control={form.control}
												name="title"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-gray-400">Project Title</FormLabel>
														<FormControl>
															<motion.div whileFocus={{ scale: 1.01 }}>
																<Input
																	placeholder="e.g., My Web3 Game"
																	{...field}
																	className="bg-gray-800/70 border-gray-700 text-white focus:border-cyan-500 transition-all duration-300"
																/>
															</motion.div>
														</FormControl>
														<FormDescription className="text-gray-400">
															A catchy title helps your project stand out.
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="description"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-gray-400">Project Description</FormLabel>
														<FormControl>
															<motion.div whileFocus={{ scale: 1.01 }}>
																<Textarea
																	placeholder="Describe your project, its goals, and why people should support it..."
																	className="bg-gray-800/70 border-gray-700 text-white min-h-[120px] focus:border-cyan-500 transition-all duration-300"
																	{...field}
																/>
															</motion.div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="goal"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-gray-400">Funding Goal</FormLabel>
														<FormControl>
															<div className="relative">
																<motion.div whileFocus={{ scale: 1.01 }}>
																	<Input
																		type="number"
																		step="0.01"
																		min="0"
																		placeholder="5.0"
																		{...field}
																		className="bg-gray-800/70 border-gray-700 text-white pl-10 focus:border-cyan-500 transition-all duration-300"
																	/>
																</motion.div>
																<motion.div
																	className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
																	initial={{ opacity: 0.7 }}
																	whileHover={{ opacity: 1, scale: 1.1 }}
																>
																	<Bitcoin className="h-4 w-4 text-cyan-400" />
																</motion.div>
															</div>
														</FormControl>
														<FormDescription className="text-gray-400">
															Set a reasonable goal to attract supporters.
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="walletAddr"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-gray-400">Wallet Address</FormLabel>
														<FormControl>
															<div className="relative">
																<motion.div whileFocus={{ scale: 1.01 }}>
																	<Input
																		placeholder="0x..."
																		{...field}
																		className="bg-gray-800/70 border-gray-700 text-white pr-10 focus:border-cyan-500 transition-all duration-300"
																	/>
																</motion.div>

															</div>
														</FormControl>
														<FormDescription className="text-gray-400">
															Your cryptocurrency wallet address to receive funds.
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>


											<div className="pt-2">
												<FormField
													control={form.control}
													name="acceptTerms"
													render={({ field }) => (
														<FormItem className="flex flex-row items-start space-x-3 space-y-0">
															<FormControl>
																<motion.div
																	whileHover={{ scale: 1.1 }}
																	whileTap={{ scale: 0.9 }}
																>
																	<Checkbox
																		checked={field.value}
																		onCheckedChange={field.onChange}
																		className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
																	/>
																</motion.div>
															</FormControl>
															<div className="space-y-1 leading-none">
																<FormLabel className="text-sm text-gray-400">
																	I agree to the terms and conditions for receiving crypto donations
																</FormLabel>
																<FormMessage />
															</div>
														</FormItem>
													)}
												/>
											</div>

											<div className="flex justify-end pt-4">
												<motion.div
													whileHover={{ scale: 1.03 }}
													whileTap={{ scale: 0.97 }}
												>
													<Button
														type="submit"
														className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all px-8 py-2 cursor-pointer relative overflow-hidden group"
													>
														<span className="relative z-10">Create Project</span>
														<motion.span
															className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100"
															transition={{ duration: 0.3 }}
														/>
													</Button>
												</motion.div>
											</div>
										</form>
									</Form>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{!previewMode && (
						<motion.div
							className="space-y-6"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<TipsInfoPanel />
							<CryptoInfoPanel />
						</motion.div>
					)}
				</div>
			</div>
		</div>
	)
}
