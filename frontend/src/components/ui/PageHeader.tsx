'use client';

// app/my-projects/components/PageHeader.tsx
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function PageHeader() {
  function handleCreateProject() {
    toast.info("Create project functionality would be implemented here");
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
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
    </motion.div>
  );
}