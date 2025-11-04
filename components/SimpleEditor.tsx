"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Twitter's exact dimensions
const TWITTER_BANNER_WIDTH = 1500;
const TWITTER_BANNER_HEIGHT = 500;
const TWITTER_PFP_SIZE = 200; // Display size (actual upload is 400x400 but shown at 200x200)

// Profile picture position: LEFT side, half over banner (matching Twitter's actual layout)
const PROFILE_LEFT = 16; // 16px from left edge like Twitter
const PROFILE_TOP = TWITTER_BANNER_HEIGHT - TWITTER_PFP_SIZE / 2; // Half overlapping banner

export default function SimpleEditor() {
  const router = useRouter();
  const originalImage = useEditorStore((state) => state.originalImage);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [pfpUrl, setPfpUrl] = useState<string>("");

  useEffect(() => {
    if (!originalImage) {
      router.push("/upload");
      return;
    }

    const img = new window.Image();
    img.src = originalImage;
    img.onload = () => {
      setImageElement(img);
    };
  }, [originalImage, router]);

  useEffect(() => {
    if (!imageElement) return;

    // Create banner image (1500x500)
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = TWITTER_BANNER_WIDTH;
    bannerCanvas.height = TWITTER_BANNER_HEIGHT;
    const bannerCtx = bannerCanvas.getContext("2d");

    if (bannerCtx) {
      // Fill with grey background
      bannerCtx.fillStyle = "#808080";
      bannerCtx.fillRect(0, 0, TWITTER_BANNER_WIDTH, TWITTER_BANNER_HEIGHT);

      // Draw the image - scale to fit width and center vertically
      const scale = TWITTER_BANNER_WIDTH / imageElement.width;
      const scaledHeight = imageElement.height * scale;
      const yOffset = (TWITTER_BANNER_HEIGHT - scaledHeight) / 2;

      bannerCtx.drawImage(
        imageElement,
        0,
        0,
        imageElement.width,
        imageElement.height,
        0,
        yOffset,
        TWITTER_BANNER_WIDTH,
        scaledHeight
      );
    }
    setBannerUrl(bannerCanvas.toDataURL());

    // Create profile picture (200x200 circular)
    const pfpCanvas = document.createElement("canvas");
    pfpCanvas.width = TWITTER_PFP_SIZE;
    pfpCanvas.height = TWITTER_PFP_SIZE;
    const pfpCtx = pfpCanvas.getContext("2d");

    if (pfpCtx) {
      // Fill with grey background
      pfpCtx.fillStyle = "#808080";
      pfpCtx.fillRect(0, 0, TWITTER_PFP_SIZE, TWITTER_PFP_SIZE);

      // Clip to circle
      pfpCtx.save();
      pfpCtx.beginPath();
      pfpCtx.arc(
        TWITTER_PFP_SIZE / 2,
        TWITTER_PFP_SIZE / 2,
        TWITTER_PFP_SIZE / 2,
        0,
        Math.PI * 2
      );
      pfpCtx.clip();

      // Draw the same part of the image that appears in the banner
      // The PFP should show the part of the banner at its position
      const scale = TWITTER_BANNER_WIDTH / imageElement.width;
      const scaledHeight = imageElement.height * scale;
      const yOffset = (TWITTER_BANNER_HEIGHT - scaledHeight) / 2;

      // Calculate which part of the banner image should show in the PFP
      // PFP is on the left side at x=16px and overlaps banner at y=400px
      const pfpCenterX = PROFILE_LEFT + TWITTER_PFP_SIZE / 2;
      const pfpCenterY = PROFILE_TOP + TWITTER_PFP_SIZE / 2;

      // Map back to original image coordinates
      const sourceCenterX = pfpCenterX / scale;
      const sourceCenterY = (pfpCenterY - yOffset) / scale;
      const sourceRadius = TWITTER_PFP_SIZE / scale;

      pfpCtx.drawImage(
        imageElement,
        sourceCenterX - sourceRadius / 2,
        sourceCenterY - sourceRadius / 2,
        sourceRadius,
        sourceRadius,
        0,
        0,
        TWITTER_PFP_SIZE,
        TWITTER_PFP_SIZE
      );

      pfpCtx.restore();
    }
    setPfpUrl(pfpCanvas.toDataURL());
  }, [imageElement]);

  if (!imageElement) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-8 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={() => router.push("/upload")}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <h1 className="text-2xl font-bold mb-6 text-white text-center">
          Twitter Profile Preview
        </h1>

        <div
          className="relative bg-white rounded-lg overflow-visible"
          style={{
            width: `${TWITTER_BANNER_WIDTH}px`,
          }}
        >
          {/* Banner */}
          <div
            className="relative overflow-hidden"
            style={{
              width: `${TWITTER_BANNER_WIDTH}px`,
              height: `${TWITTER_BANNER_HEIGHT}px`,
            }}
          >
            {bannerUrl && (
              <Image
                src={bannerUrl}
                alt="Banner"
                width={TWITTER_BANNER_WIDTH}
                height={TWITTER_BANNER_HEIGHT}
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          {/* Profile Area Below Banner */}
          <div
            className="bg-white"
            style={{
              width: `${TWITTER_BANNER_WIDTH}px`,
              minHeight: `${TWITTER_PFP_SIZE / 2 + 100}px`,
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            {/* This area represents the profile info section */}
            <div style={{ height: `${TWITTER_PFP_SIZE / 2 + 20}px` }} />
            <div className="text-black">
              <h2 className="text-2xl font-bold">Username</h2>
              <p className="text-gray-600">@username</p>
              <p className="mt-3 text-gray-800">Bio text goes here...</p>
            </div>
          </div>

          {/* Profile Picture - positioned absolutely over the banner/profile area */}
          {pfpUrl && (
            <div
              className="absolute rounded-full border-4 border-white overflow-hidden bg-gray-700"
              style={{
                width: `${TWITTER_PFP_SIZE}px`,
                height: `${TWITTER_PFP_SIZE}px`,
                left: `${PROFILE_LEFT}px`,
                top: `${PROFILE_TOP}px`,
              }}
            >
              <Image
                src={pfpUrl}
                alt="Profile picture"
                width={TWITTER_PFP_SIZE}
                height={TWITTER_PFP_SIZE}
                className="rounded-full"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Banner: {TWITTER_BANNER_WIDTH}x{TWITTER_BANNER_HEIGHT}px</p>
          <p>Profile Picture: {TWITTER_PFP_SIZE}x{TWITTER_PFP_SIZE}px</p>
        </div>
      </motion.div>
    </div>
  );
}
