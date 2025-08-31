"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export type ViewMode = "grid" | "table";
export type SortField = "created_at" | "title" | "goal" | "raised" | "progress";
export type SortOrder = "asc" | "desc";
export type ProjectStatus = "all" | "active" | "completed" | "archived";

interface ProjectFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  statusFilter: ProjectStatus;
  onStatusFilterChange: (status: ProjectStatus) => void;
  projectCount: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProjectFilters({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  statusFilter,
  onStatusFilterChange,
  projectCount,
}: ProjectFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <motion.div
      className="mb-8 space-y-4"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search and Primary Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-black/40 border-purple-500/20 focus:border-purple-500/40 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-4">
            {projectCount} project{projectCount !== 1 ? "s" : ""}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/5 cursor-pointer"
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </Button>

          <div className="flex items-center border border-purple-500/20 rounded-lg p-1 bg-black/20">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className={`h-8 w-8 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              className={`h-8 w-8 cursor-pointer ${
                viewMode === "table"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isFilterOpen ? "auto" : 0,
          opacity: isFilterOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden will-change-[height,opacity]"
      >
        <div className="border border-purple-500/20 rounded-lg bg-black/20 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="bg-black/40 border-purple-500/20 cursor-pointer text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-purple-500/20 ">
                  <SelectItem value="all" className="cursor-pointer">
                    All Projects
                  </SelectItem>
                  {/* <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                  <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                  <SelectItem value="archived" className="cursor-pointer">Archived</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Sort by
              </label>
              <Select value={sortField} onValueChange={onSortFieldChange}>
                <SelectTrigger className="bg-black/40 border-purple-500/20 cursor-pointer text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-purple-500/20">
                  <SelectItem value="created_at" className="cursor-pointer">
                    Date Created
                  </SelectItem>
                  <SelectItem value="title" className="cursor-pointer">
                    Title
                  </SelectItem>
                  <SelectItem value="goal" className="cursor-pointer">
                    Goal Amount
                  </SelectItem>
                  <SelectItem value="raised" className="cursor-pointer">
                    Amount Raised
                  </SelectItem>
                  <SelectItem value="progress" className="cursor-pointer">
                    Progress
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Order</label>
              <Button
                variant="outline"
                onClick={() =>
                  onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-full justify-start bg-black/40 border-purple-500/20 text-white hover:bg-purple-500/10 hover:text-purple-400 cursor-pointer"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4 mr-2 text-purple-400" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2 text-purple-400" />
                )}
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
