"use client";

import { motion } from "framer-motion";
import { Plus, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function EmptyState() {
  const router = useRouter();
  function handleCreateProject() {
    router.push("/create-project");
  }

  return (
    <motion.div
      className="border border-purple-500/20 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-12 my-8 text-center"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Coins className="h-16 w-16 text-purple-400 mb-4 opacity-70" />
      <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
      <p className="text-gray-400 mb-6">
        You haven&apos;t created any funding projects yet
      </p>
      <Button
        className="bg-gradient-to-r from-purple-500 to-cyan-500 cursor-pointer hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
        onClick={handleCreateProject}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Project
      </Button>
    </motion.div>
  );
}
