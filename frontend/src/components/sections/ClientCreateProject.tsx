"use client"

import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins } from 'lucide-react'

const CreateProjectPage = dynamic(
	() => import('@/components/sections/CreateProject'),
	{
		ssr: false,
		loading: () => <PageSkeleton />
	}
)

export default function ClientCreateProject() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<CreateProjectPage />
		</Suspense>
	)
}

function PageSkeleton() {
	useEffect(() => {
		const interval = setInterval(() => {
			document.querySelectorAll('.pulse-width').forEach(element => {
				const width = 30 + Math.floor(Math.random() * 70); // Random width between 30-100%
				(element as HTMLElement).style.width = `${width}%`;
			});
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen w-full bg-gray-950 p-4">
			<div className="container max-w-6xl mx-auto py-16">
				<div className="text-center mb-12">
					<div className="relative mx-auto mb-6">
						<Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-800 border border-cyan-500/10 animate-pulse" />
						<Skeleton className="h-8 w-8 rounded-full absolute bottom-0 right-0 translate-x-1/4 bg-purple-900/40 border border-purple-500/20 animate-pulse" />
					</div>

					<Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4 bg-gray-800 rounded-lg animate-pulse" />
					<div className="flex justify-center gap-2 items-center">
						<Skeleton className="h-6 w-1/4 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
						<Skeleton className="h-6 w-1/6 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
						<Skeleton className="h-6 w-1/5 max-w-xs mx-auto bg-gray-800 rounded-lg animate-pulse pulse-width" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
					<div className="animate-slide-up">
						<Skeleton className="h-[600px] rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-lg shadow-cyan-900/5">
							<div className="p-6 border-b border-gray-800">
								<div className="flex justify-between items-center">
									<Skeleton className="h-7 w-48 bg-gray-800 rounded-lg animate-pulse" />
									<Skeleton className="h-9 w-28 bg-gray-800 rounded-lg animate-pulse" />
								</div>
							</div>

							<div className="p-6 space-y-8">
								<div className="space-y-2">
									<Skeleton className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
									<Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse" />
									<Skeleton className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-5 w-40 bg-gray-800 rounded animate-pulse" />
									<Skeleton className="h-28 w-full bg-gray-800 rounded-lg animate-pulse" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-5 w-36 bg-gray-800 rounded animate-pulse" />
									<Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse" />
									<Skeleton className="h-4 w-1/2 bg-gray-800 rounded animate-pulse" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-5 w-36 bg-gray-800 rounded animate-pulse" />
									<Skeleton className="h-10 w-full bg-gray-800 rounded-lg animate-pulse" />
									<Skeleton className="h-4 w-3/5 bg-gray-800 rounded animate-pulse" />
								</div>
							</div>

							<div className="p-6 flex justify-end">
								<Skeleton className="h-10 w-36 bg-gradient-to-r from-purple-800/60 to-cyan-800/60 rounded-lg animate-pulse" />
							</div>
						</Skeleton>
					</div>

					<div className="space-y-6 animate-slide-up animation-delay-300">
						<Skeleton className="h-[200px] rounded-2xl bg-gray-900 border border-gray-800 shadow-lg shadow-purple-900/5 p-6">
							<div className="flex items-center mb-4">
								<Skeleton className="h-6 w-6 rounded-full bg-cyan-900/40 border border-cyan-500/20 animate-pulse mr-2" />
								<Skeleton className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
							</div>

							<div className="space-y-3">
								{[1, 2, 3, 4].map((item) => (
									<div key={item} className="flex items-start">
										<Skeleton className="h-5 w-5 rounded-full bg-cyan-900/40 border border-cyan-500/20 animate-pulse mr-2" />
										<Skeleton className="h-4 w-full bg-gray-800 rounded animate-pulse pulse-width" />
									</div>
								))}
							</div>
						</Skeleton>

						<Skeleton className="h-[300px] rounded-2xl bg-gray-900 border border-gray-800 shadow-lg shadow-purple-900/5 p-6">
							<Skeleton className="h-6 w-60 bg-gray-800 rounded animate-pulse mb-6" />

							<div className="grid grid-cols-2 gap-4">
								{[1, 2, 3, 4].map((coin) => (
									<div key={coin} className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center animate-pulse">
										<Skeleton className="h-8 w-8 rounded-full bg-purple-900/30 border border-purple-500/20 animate-pulse mr-3 flex items-center justify-center">
											{coin === 1 && (
												<div className="h-4 w-4 text-yellow-500 opacity-60">
													<Coins />
												</div>
											)}
										</Skeleton>
										<div>
											<Skeleton className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-1" />
											<Skeleton className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
										</div>
									</div>
								))}
							</div>
						</Skeleton>
					</div>
				</div>
			</div>
		</div>
	)
}
