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
    <div className="h-full flex flex-col p-3 sm:p-4 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col h-full">
        {/* Centered Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-2 flex justify-center">
            <Image
              src="/logo.png"
              alt="Seamless Logo"
              width={60}
              height={60}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              priority
            />
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-2 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent font-poppins leading-none">
            <ShuffleText text="SEAMLESS" duration={1} delay={0.2} />
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-400">
            Where your header and PFP finally meet.
          </p>
        </div>

        {/* Two Equal Halves */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Half - Example Box */}
          <div className="flex-1 w-full lg:w-1/2 flex flex-col items-center justify-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white text-center">
              Create seamless X profiles
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed text-center">
              Upload an image and easily position it to create a seamless
              connection between your banner and profile picture.
            </p>
            <div className="w-full max-w-2xl">
              <div className="relative rounded overflow-hidden">
                <Image
                  src="/example.png"
                  alt="Example of seamless Twitter profile"
                  width={800}
                  height={450}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Half - Upload Button */}
          <div className="flex-1 w-full lg:w-1/2 flex flex-col items-center justify-center">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center
                transition-all duration-300 cursor-pointer glass w-full max-w-md
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
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-white" />
                ) : (
                  <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-gray-400" />
                )}
              </motion.div>

              <h2 className="text-base sm:text-lg font-semibold mb-2 text-white">
                {isDragging ? "Drop your image here" : "Upload an image"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-600">
                All image formats up to 5MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
