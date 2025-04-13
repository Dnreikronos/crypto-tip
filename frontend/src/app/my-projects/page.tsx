'use client'

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  walletAddr: string;
  createdAt: Date;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Decentralized Exchange App",
    description: "A fully decentralized exchange for trading tokens across multiple blockchains",
    goal: 5.0,
    raised: 2.75,
    walletAddr: "0x1234...5678",
    createdAt: new Date('2023-12-10')
  },
  {
    id: "2",
    title: "NFT Marketplace",
    description: "Marketplace for creating, buying and selling unique digital assets",
    goal: 3.0,
    raised: 1.2,
    walletAddr: "0xabcd...efgh",
    createdAt: new Date('2024-01-05')
  },
  {
    id: "3",
    title: "DeFi Lending Protocol",
    description: "Decentralized finance protocol for lending and borrowing crypto assets",
    goal: 10.0,
    raised: 4.5,
    walletAddr: "0x9876...5432",
    createdAt: new Date('2024-02-15')
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function TableSkeleton(): React.ReactElement {
  return (
    <div className="h-96 bg-gray-900/60 rounded-lg animate-pulse"></div>
  );
}

interface ProjectsTableProps {
  projects: Project[];
  onDeleteProject: (id: string) => void;
}

function ProjectsTable({ projects, onDeleteProject }: ProjectsTableProps): React.ReactElement {
  return (
    <motion.div className="overflow-hidden rounded-xl border border-purple-500/20 bg-black/60 backdrop-blur-sm mb-8" variants={itemVariants}>
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
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
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
                      onClick={() => onDeleteProject(project.id)}
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

interface EmptyStateProps {
  onCreateProject: () => void;
}

function EmptyState({ onCreateProject }: EmptyStateProps): React.ReactElement {
  return (
    <motion.div 
      className="border border-purple-500/20 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-12 my-8 text-center"
      variants={itemVariants}
    >
      <Coins className="h-16 w-16 text-purple-400 mb-4 opacity-70" />
      <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
      <p className="text-gray-400 mb-6">You haven&apos;t created any funding projects yet</p>
      <Button 
        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
        onClick={onCreateProject}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Project
      </Button>
    </motion.div>
  );
}

export default function MyProjects(): React.ReactElement {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  function handleDeleteProject(id: string): void {
    setProjects(projects.filter(project => project.id !== id));
    toast.success("Project deleted successfully");
  }

  function handleCreateProject(): void {
    toast.info("Create project functionality would be implemented here");
  }

  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen">
      <AnimatedBackground />
      
      <main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full"
        >
          <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-gray-400">Manage your project fundings and track your progress</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
              onClick={handleCreateProject}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </motion.div>
          
          <Suspense fallback={<TableSkeleton />}>
            {projects.length === 0 ? (
              <EmptyState onCreateProject={handleCreateProject} />
            ) : (
              <ProjectsTable 
                projects={projects} 
                onDeleteProject={handleDeleteProject} 
              />
            )}
          </Suspense>
        </motion.div>
      </main>
    </div>
  );
}