import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function TableSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur-sm mb-8">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-purple-500/5 border-b border-purple-500/10">
						<TableHead className="text-gray-300">
							<Skeleton className="h-4 w-24 bg-purple-500/20" />
						</TableHead>
						<TableHead className="text-gray-300">
							<Skeleton className="h-4 w-20 bg-purple-500/20" />
						</TableHead>
						<TableHead className="text-gray-300">
							<Skeleton className="h-4 w-20 bg-purple-500/20" />
						</TableHead>
						<TableHead className="text-gray-300">
							<Skeleton className="h-4 w-16 bg-purple-500/20" />
						</TableHead>
						<TableHead className="text-gray-300">
							<Skeleton className="h-4 w-20 bg-purple-500/20" />
						</TableHead>
						<TableHead className="text-gray-300 text-right">
							<Skeleton className="h-4 w-16 bg-purple-500/20 ml-auto" />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{[...Array(5)].map((_, i) => (
						<TableRow key={i} className="hover:bg-purple-500/5 border-b border-purple-500/10">
							<TableCell>
								<div className="space-y-2">
									<Skeleton className="h-4 w-32 bg-purple-500/20" />
									<Skeleton className="h-3 w-48 bg-purple-500/20" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-16 bg-purple-500/20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-16 bg-purple-500/20" />
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Skeleton className="h-2 w-full bg-purple-500/20" />
									<Skeleton className="h-4 w-8 bg-purple-500/20" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24 bg-purple-500/20" />
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Skeleton className="h-8 w-8 rounded-lg bg-purple-500/20" />
									<Skeleton className="h-8 w-8 rounded-lg bg-purple-500/20" />
									<Skeleton className="h-8 w-8 rounded-lg bg-purple-500/20" />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
