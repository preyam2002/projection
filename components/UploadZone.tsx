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
  const setOriginalImage = useEditorStore((state) => state.setOriginalImage);

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
          setOriginalImage(result);
          router.push("/editor");
        } else {
          alert("Failed to process the image. Please try again.");
        }
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
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
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
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 relative overflow-hidden">
      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="Seamless Logo"
              width={100}
              height={100}
              className="w-auto h-auto"
              priority
            />
          </div>
          <h1 className="text-[10rem] font-bold mb-2 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent font-poppins leading-none">
            <ShuffleText text="SEAMLESS" duration={1} delay={0.2} />
          </h1>
          <p className="text-gray-400">
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
            relative border-2 border-dashed rounded-2xl p-16 text-center
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
              <Upload className="w-16 h-16 mx-auto mb-4 text-white" />
            ) : (
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            )}
          </motion.div>

          <h2 className="text-2xl font-semibold mb-2 text-white">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </h2>
          <p className="text-gray-500 mb-4">Drag and drop or click to browse</p>
          <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
        </motion.div>
      </div>
    </div>
  );
}
