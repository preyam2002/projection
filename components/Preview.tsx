"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useEditorStore } from "@/lib/store";

interface PreviewProps {
  onClose: () => void;
}

// Twitter's exact dimensions
const TWITTER_BANNER_WIDTH = 1500;
const TWITTER_BANNER_HEIGHT = 500;
const TWITTER_PFP_SIZE = 200;
// Profile picture on LEFT side, half over banner vertically (matching Twitter's actual layout)
const PROFILE_LEFT = 16; // 16px from left edge like Twitter
const PROFILE_TOP = TWITTER_BANNER_HEIGHT - TWITTER_PFP_SIZE / 2; // 400px (half over banner)

export default function Preview({ onClose }: PreviewProps) {
  const generatedHeader = useEditorStore((state) => state.generatedHeader);
  const croppedImage = useEditorStore((state) => state.croppedImage);

  if (!generatedHeader || !croppedImage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-6xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="relative bg-black rounded-lg overflow-visible"
          style={{
            width: `${TWITTER_BANNER_WIDTH}px`,
            minHeight: `${TWITTER_BANNER_HEIGHT + 100}px`, // Space for profile picture extending below
            margin: "0 auto",
          }}
        >
          {/* Banner - Twitter exact dimensions: 1500x500 */}
          <div
            className="relative overflow-hidden rounded-t-lg"
            style={{
              width: `${TWITTER_BANNER_WIDTH}px`,
              height: `${TWITTER_BANNER_HEIGHT}px`,
            }}
          >
            <Image
              src={generatedHeader}
              alt="Banner"
              width={TWITTER_BANNER_WIDTH}
              height={TWITTER_BANNER_HEIGHT}
              className="object-cover"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>

          {/* Profile picture - Twitter exact dimensions: 400x400 */}
          <div
            className="absolute rounded-full border-4 border-white overflow-hidden bg-black"
            style={{
              width: `${TWITTER_PFP_SIZE}px`,
              height: `${TWITTER_PFP_SIZE}px`,
              left: `${PROFILE_LEFT}px`,
              top: `${PROFILE_TOP}px`,
            }}
          >
            <Image
              src={croppedImage}
              alt="Profile picture"
              width={TWITTER_PFP_SIZE}
              height={TWITTER_PFP_SIZE}
              className="object-cover"
              style={{ borderRadius: "50%" }}
              unoptimized
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

