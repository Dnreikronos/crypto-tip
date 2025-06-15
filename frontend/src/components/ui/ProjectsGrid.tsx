"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Gift, 
  Calendar, 
  Target, 
  TrendingUp,
  MoreVertical,
  ImageIcon,
  ExternalLink,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Project as MyProject } from "@/app/my-projects/getProjects";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Project extends Omit<MyProject, "created_at"> {
  wallet_addr: string;
  project_link?: string;
  repo_link?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectsGridProps {
  projects: (Project | MyProject)[];
  isMyProjects?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

async function deleteProject(id: string) {
  const token = Cookies.get("token");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }

  return { id };
}

function getProjectStatus(project: Project | MyProject) {
  const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;
  
  if (progress >= 100) return "completed";
  if (progress > 0) return "active";
  return "active"; // Default status for new projects
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "active":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function ProjectsGrid({ projects, isMyProjects = false }: ProjectsGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: isMyProjects ? ["my-projects"] : ["projects"],
      });

      const previousProjects = queryClient.getQueryData(
        isMyProjects ? ["my-projects"] : ["projects"],
      );

      queryClient.setQueryData(
        isMyProjects ? ["my-projects"] : ["projects"],
        (old: (Project | MyProject)[] = []) =>
          old.filter((project) => project.id !== id),
      );

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          isMyProjects ? ["my-projects"] : ["projects"],
          context.previousProjects,
        );
      }
      toast.error("Failed to delete project");
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: isMyProjects ? ["my-projects"] : ["projects"],
      });
    },
  });

  const handleDonate = (projectId: string) => {
    router.push(`/donation/${projectId}`);
  };

  const handleView = (projectId: string) => {
    router.push(`/donation/${projectId}`);
  };

  const handleEdit = (projectId: string) => {
    router.push(`/edit-project/${projectId}`);
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {projects.map((project) => {
        const raised = project.raised || 0;
        const progress = project.goal > 0 ? (raised / project.goal) * 100 : 0;
        const status = getProjectStatus(project);
        const createdAt =
          project.created_at instanceof Date
            ? project.created_at
            : new Date(project.created_at);

        return (
          <motion.div
            key={project.id}
            variants={itemVariants}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative"
          >
            <div className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
              
              <div className="relative h-48 w-full overflow-hidden">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
                    <ImageIcon className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`capitalize backdrop-blur-sm ${getStatusColor(status)}`}
                  >
                    {status}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white cursor-pointer hover:text-white backdrop-blur-sm bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity will-change-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      side="bottom"
                      sideOffset={5}
                      className="bg-black border-purple-500/20 z-50 will-change-[transform,opacity]"
                      onClick={(e) => e.stopPropagation()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                      avoidCollisions={true}
                      collisionPadding={8}
                    >
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(project.id);
                        }}
                        className="cursor-pointer text-gray-300 hover:text-cyan-400 focus:text-cyan-400"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      {!isMyProjects && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDonate(project.id);
                          }}
                          className="cursor-pointer text-gray-300 hover:text-green-400 focus:text-green-400"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Donate
                        </DropdownMenuItem>
                      )}
                      
                      {isMyProjects && (
                        <>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project.id);
                            }}
                            className="cursor-pointer text-gray-300 hover:text-purple-400 focus:text-purple-400"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-purple-500/20" />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="cursor-pointer text-gray-300 hover:text-red-400 focus:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black border-purple-500/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">
                                  Delete Project
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete &ldquo;{project.title}&rdquo;? This action cannot be undone and will permanently remove your project and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  Delete Project
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-gray-300">{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className="h-2 bg-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Target className="h-3 w-3" />
                      Goal
                    </div>
                    <p className="text-sm font-medium text-white">
                      {project.goal.toFixed(2)} ETH
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <TrendingUp className="h-3 w-3" />
                      Raised
                    </div>
                    <p className="text-sm font-medium text-cyan-400">
                      {raised.toFixed(2)} ETH
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <Calendar className="h-3 w-3" />
                  Created {createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                {/* Project Links */}
                {(('project_link' in project && project.project_link) || ('repo_link' in project && project.repo_link)) && (
                  <div className="flex items-center gap-3 text-xs mb-4">
                    {'project_link' in project && project.project_link && (
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Project</span>
                      </a>
                    )}
                    {'repo_link' in project && project.repo_link && (
                      <a
                        href={project.repo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="h-3 w-3" />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {!isMyProjects && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDonate(project.id)}
                      className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Donate
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(project.id)}
                    className="flex-1 border-cyan-500/30 bg-black text-cyan-400 cursor-pointer hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 