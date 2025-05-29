"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectsTableProps {
  initialProjects: (Project | MyProject)[];
  isMyProjects?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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

export function ProjectsTable({
  initialProjects,
  isMyProjects = false,
}: ProjectsTableProps) {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    router.push(`/donation?projectId=${projectId}`);
  };

  if (!mounted) return null;

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
          {initialProjects.map((project) => {
            const raised = project.raised || 0;
            const progress =
              project.goal > 0 ? (raised / project.goal) * 100 : 0;
            const createdAt =
              project.created_at instanceof Date
                ? project.created_at
                : new Date(project.created_at);

            return (
              <TableRow
                key={project.id}
                className="hover:bg-purple-500/5 border-b border-purple-500/10"
              >
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="text-gray-400 text-xs truncate max-w-xs">
                      {project.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{project.goal.toFixed(2)}</TableCell>
                <TableCell className="text-cyan-400">
                  {raised.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-cyan-400 h-full rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-300">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!isMyProjects && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-green-400 hover:bg-green-400/5"
                        title="Donate"
                        onClick={() => handleDonate(project.id)}
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/5 cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isMyProjects && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-400/5 cursor-pointer"
                        title="Edit"
                        onClick={() =>
                          router.push(`/edit-project/${project.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {isMyProjects && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/5 cursor-pointer"
                        title="Delete"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
