"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store";
import ShuffleText from "@/components/ShuffleText";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const originalImage = useEditorStore((state) => state.originalImage);
  const setOriginalImage = useEditorStore((state) => state.setOriginalImage);
  const setCroppedImage = useEditorStore((state) => state.setCroppedImage);
  const setGeneratedHeader = useEditorStore(
    (state) => state.setGeneratedHeader
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        alert("Failed to read the file. Please try again.");
      };
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Clear previous image data when uploading a new image
          setCroppedImage(null);
          setGeneratedHeader(null);
          setOriginalImage(result);
          router.push("/editor");
        } else {
          alert("Failed to process the image. Please try again.");
        }
      };
      reader.readAsDataURL(file);
    },
    [setOriginalImage, setCroppedImage, setGeneratedHeader, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
        }
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
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
        }
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="h-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-center"
        >
          <div className="mb-1.5 flex justify-center">
            <Image
              src="/logo.png"
              alt="Seamless Logo"
              width={60}
              height={60}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
              priority
            />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-1 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent font-poppins leading-none">
            <ShuffleText text="SEAMLESS" duration={1} delay={0.2} />
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Where your header and PFP finally meet.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 text-center
            transition-all duration-300 cursor-pointer glass
            ${
              isDragging
                ? "border-white scale-105 glow-effect"
                : "border-gray-700 hover:border-gray-600 animated-border"
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
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 text-white" />
            ) : (
              <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 text-gray-400" />
            )}
          </motion.div>

          <h2 className="text-lg sm:text-xl font-semibold mb-1 text-white">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-1.5">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-gray-600">All image formats up to 5MB</p>
        </motion.div>
      </div>
    </div>
  );
}
