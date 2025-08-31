/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl?: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      // 4MB
      toast.error("Image must be smaller than 4MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    onChange(file, url);
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
  };

  if (previewUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <div className="w-full min-h-48 max-h-96 bg-black rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
          <img
            src={previewUrl}
            alt="Project preview"
            className="max-w-full max-h-full object-contain"
            style={{ imageRendering: "auto" }}
          />
        </div>
        <motion.button
          type="button"
          onClick={removeImage}
          disabled={disabled}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>

        {previewUrl.startsWith("blob:") && (
          <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded">
            Preview - Save to upload
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
        transition-all duration-300 flex flex-col items-center justify-center
        ${
          isDragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-gray-600 hover:border-gray-500"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800/50"}
      `}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        className="text-center"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: isDragging ? 1 : 0.7 }}
      >
        {isDragging ? (
          <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        ) : (
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        )}

        <p className="text-gray-300 font-medium mb-2">
          {isDragging
            ? "Drop your image here"
            : "Click to select or drag and drop"}
        </p>

        <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 4MB</p>

        <motion.div
          className="mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-lg inline-block"
          whileHover={{ scale: 1.05 }}
        >
          Choose Image
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
