"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/app/(dashboard)/my-projects/_hooks/useProject";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Coins, ArrowRight, Sparkles } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { ProjectPreview } from "@/app/components/ui/ProjectPreview";
import { TipsInfoPanel } from "@/app/components/ui/TipsInfoPanel";
import { CryptoInfoPanel } from "@/app/components/ui/CryptoInfoPanel";
import { ImageUpload } from "@/app/components/ui/ImageUpload";
import { useUploadThing } from "@/app/lib/uploadthing";

const projectSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" }),
  goal: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Goal must be a positive number",
    }),
  wallet_addr: z
    .string()
    .min(42, { message: "Please enter a valid Ethereum wallet address" })
    .startsWith("0x", { message: "Ethereum addresses should start with 0x" }),
  project_link: z.string().url({ message: "Please enter a valid URL" }),
  repo_link: z.string().url({ message: "Please enter a valid URL" }),
  image_url: z.string().optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof projectSchema>;

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const projectId = Array.isArray(rawId) ? rawId[0] : (rawId ?? "");
  const {
    data: project,
    isLoading: isProjectLoading,
    isError,
    error,
  } = useProject(projectId);
  const { mutate: updateProjectMutation, isPending: isUpdating } =
    useUpdateProject();

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      wallet_addr: "",
      project_link: "",
      repo_link: "",
      image_url: "",
      accept_terms: false,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
        goal: project.goal.toString(),
        wallet_addr: project.wallet_addr,
        project_link: project.project_link,
        repo_link: project.repo_link,
        image_url: project.image_url || "",
        accept_terms: false,
      });
    }
  }, [project, form]);

  async function onSubmit(values: FormValues) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accept_terms, ...projectData } = values;

    if (selectedImageFile) {
      try {
        toast.info("Uploading image...");

        const uploadResult = await startUpload([selectedImageFile]);

        if (uploadResult && uploadResult[0]?.url) {
          projectData.image_url = uploadResult[0].url;
          toast.success("Image uploaded successfully!");
        }
      } catch (error) {
        toast.error(
          "Failed to upload image. Updating project without new image.",
        );
        console.error("Image upload error:", error);
      }
    }

    updateProjectMutation(
      { id: projectId, data: projectData },
      {
        onSuccess: () => {
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
                  Project updated successfully!
                </span>
              </motion.div>
            ),
            { duration: 3000 },
          );
          setTimeout(() => router.push("/my-projects"), 1500);
        },
        onError: (error) => {
          toast.error(`Failed to update project: ${error.message}`);
        },
      },
    );
  }

  // Loading & error states
  if (isProjectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading project...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Project not found
      </div>
    );
  }

  function togglePreview() {
    setPreviewMode(!previewMode);
  }

  const formValues = form.watch();

  return (
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
            stiffness: 200,
          }}
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: { duration: 0.5 },
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
          <motion.span initial={{ display: "inline-block" }}>
            Edit Your Project
          </motion.span>
        </motion.h1>
        <motion.p
          className="text-lg text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Update your project details and settings.
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
                  title: formValues.title || project.title,
                  description: formValues.description || project.description,
                  goal: parseFloat(formValues.goal) || project.goal,
                  raised: project.raised,
                  wallet_addr: formValues.wallet_addr || project.wallet_addr,
                  image_url:
                    imagePreviewUrl ||
                    formValues.image_url ||
                    project.image_url,
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
                  <h2 className="text-2xl font-bold text-white">
                    Project Details
                  </h2>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={togglePreview}
                      variant="ghost"
                      className="text-cyan-400 cursor-pointer"
                    >
                      Preview
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Project Title
                          </FormLabel>
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
                          <FormLabel className="text-gray-400">
                            Project Description
                          </FormLabel>
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
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Project Image
                          </FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={imagePreviewUrl || field.value}
                              onChange={(file, previewUrl) => {
                                setSelectedImageFile(file);
                                setImagePreviewUrl(previewUrl || "");
                              }}
                              disabled={isUpdating || isUploading}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Upload an image to showcase your project (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Funding Goal
                          </FormLabel>
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
                                <Coins className="h-4 w-4 text-cyan-400" />
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
                      name="wallet_addr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Wallet Address
                          </FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Input
                                placeholder="0x..."
                                {...field}
                                className="bg-gray-800/70 border-gray-700 text-white focus:border-cyan-500 transition-all duration-300"
                              />
                            </motion.div>
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Your Ethereum wallet address to receive funds.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="project_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Project Link
                          </FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Input
                                placeholder="https://..."
                                {...field}
                                className="bg-gray-800/70 border-gray-700 text-white focus:border-cyan-500 transition-all duration-300"
                              />
                            </motion.div>
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Link to your project website or demo.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repo_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">
                            Repository Link
                          </FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Input
                                placeholder="https://github.com/..."
                                {...field}
                                className="bg-gray-800/70 border-gray-700 text-white focus:border-cyan-500 transition-all duration-300"
                              />
                            </motion.div>
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Link to your project&apos;s code repository.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-2">
                      <FormField
                        control={form.control}
                        name="accept_terms"
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
                                I agree to the terms and conditions for
                                receiving crypto donations
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
                          disabled={isUpdating || isUploading}
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all px-8 py-2 cursor-pointer relative overflow-hidden group"
                        >
                          <span className="relative z-10">
                            {isUploading
                              ? "Uploading..."
                              : isUpdating
                                ? "Saving..."
                                : "Save Changes"}
                          </span>
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
  );
}
