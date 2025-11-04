"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const setOriginalImage = useEditorStore((state) => state.setOriginalImage);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        router.push("/editor");
      };
      reader.readAsDataURL(file);
    },
    [setOriginalImage, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            Seamless
          </h1>
          <p className="text-gray-400">Where your header and PFP finally meet.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-2xl p-16 text-center
            transition-all duration-300 cursor-pointer
            ${
              isDragging
                ? "border-white bg-gray-900 scale-105"
                : "border-gray-700 bg-gray-950 hover:border-gray-600"
            }
          `}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <motion.div
            animate={{
              scale: isDragging ? 1.1 : 1,
              rotate: isDragging ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {isDragging ? (
              <Upload className="w-16 h-16 mx-auto mb-4 text-white" />
            ) : (
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            )}
          </motion.div>

          <h2 className="text-2xl font-semibold mb-2 text-white">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </h2>
          <p className="text-gray-500 mb-4">
            Drag and drop or click to browse
          </p>
          <p className="text-sm text-gray-600">
            PNG, JPG, GIF up to 10MB
          </p>
        </motion.div>
      </div>
    </div>
  );
}

