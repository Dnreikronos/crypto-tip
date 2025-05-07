'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { Project } from '@/app/my-projects/_data/projects';

interface ProjectsTableProps {
	initialProjects: Project[];
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 }
};

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
	const [projects, setProjects] = useState<Project[]>(initialProjects);

	function handleDeleteProject(id: string) {
		setProjects(projects.filter(project => project.id !== id));
		toast.success("Project deleted successfully");
	}

	return (
		<motion.div
			className="overflow-hidden rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur-sm mb-8"
			variants={itemVariants}
			initial="hidden"
			animate="visible"
		>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-purple-500/5 border-b border-purple-500/10">
						<TableHead className="text-gray-300">Project</TableHead>
						<TableHead className="text-gray-300">Goal (ETH)</TableHead>
						<TableHead className="text-gray-300">Raised (ETH)</TableHead>
						<TableHead className="text-gray-300">Progress</TableHead>
						<TableHead className="text-gray-300">Created</TableHead>
						<TableHead className="text-gray-300 text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project: Project) => {
						const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;

						return (
							<TableRow key={project.id} className="hover:bg-purple-500/5 border-b border-purple-500/10">
								<TableCell className="font-medium">
									<div>
										<p className="font-semibold text-white">{project.title}</p>
										<p className="text-gray-400 text-xs truncate max-w-xs">{project.description}</p>
									</div>
								</TableCell>
								<TableCell>{project.goal.toFixed(2)}</TableCell>
								<TableCell className="text-cyan-400">{project.raised.toFixed(2)}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
											<div
												className="bg-gradient-to-r from-purple-400 to-cyan-400 h-full rounded-full"
												style={{ width: `${Math.min(progress, 100)}%` }}
											></div>
										</div>
										<span className="text-xs text-gray-300">{Math.round(progress)}%</span>
									</div>
								</TableCell>
								<TableCell>
									{new Date(project.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/5"
											title="View"
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-400/5"
											title="Edit"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/5"
											title="Delete"
											onClick={() => handleDeleteProject(project.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</motion.div>
	);
}
