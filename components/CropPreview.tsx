"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, Download } from "lucide-react";

interface CropPreviewProps {
  onClose: () => void;
  originalImage: string;
  imageElement: HTMLImageElement;
  imageX: number;
  imageY: number;
  zoom: number;
  stageSize: { width: number; height: number };
}

// Twitter's exact dimensions
const TWITTER_BANNER_WIDTH = 1500;
const TWITTER_BANNER_HEIGHT = 500;
const TWITTER_PFP_SIZE = 200;
// Profile picture on LEFT side, half over banner vertically (matching Twitter's actual layout)
const PROFILE_LEFT = 16; // 16px from left edge like Twitter
const PROFILE_TOP = TWITTER_BANNER_HEIGHT - TWITTER_PFP_SIZE / 2; // 400px (half over banner)

export default function CropPreview({
  onClose,
  originalImage,
  imageElement,
  imageX,
  imageY,
  zoom,
  stageSize,
}: CropPreviewProps) {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [bannerImageUrl, setBannerImageUrl] = useState<string>("");

  useEffect(() => {
    // Calculate the crop area in the original image
    const circleCenterX = stageSize.width / 2;
    const circleCenterY = stageSize.height / 2;
    const circleRadius = 150; // FIXED_CIRCLE_RADIUS from editor

    // Find crop center in original image coordinates
    const cropX = (circleCenterX - imageX) / zoom;
    const cropY = (circleCenterY - imageY) / zoom;
    const cropRadius = circleRadius / zoom;

    // Create profile picture - 400x400 (Twitter exact size)
    const profileCanvas = document.createElement("canvas");
    profileCanvas.width = TWITTER_PFP_SIZE;
    profileCanvas.height = TWITTER_PFP_SIZE;
    const profileCtx = profileCanvas.getContext("2d");
    if (profileCtx) {
      profileCtx.beginPath();
      profileCtx.arc(
        TWITTER_PFP_SIZE / 2,
        TWITTER_PFP_SIZE / 2,
        TWITTER_PFP_SIZE / 2,
        0,
        Math.PI * 2
      );
      profileCtx.clip();
      profileCtx.drawImage(
        imageElement,
        cropX - cropRadius,
        cropY - cropRadius,
        cropRadius * 2,
        cropRadius * 2,
        0,
        0,
        TWITTER_PFP_SIZE,
        TWITTER_PFP_SIZE
      );
    }
    setProfilePictureUrl(profileCanvas.toDataURL());

    // Create banner - 1500x500 (Twitter exact size)
    // Use the same crop center and scale it appropriately
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = TWITTER_BANNER_WIDTH;
    bannerCanvas.height = TWITTER_BANNER_HEIGHT;
    const bannerCtx = bannerCanvas.getContext("2d");
    if (bannerCtx) {
      // Calculate scale: profile picture is 400px, so crop radius * 2 = 400px in output
      // Banner should use the same scale
      const displayScale = TWITTER_PFP_SIZE / (cropRadius * 2);

      // Calculate source dimensions for banner
      const sourceWidth = TWITTER_BANNER_WIDTH / displayScale;
      const sourceHeight = TWITTER_BANNER_HEIGHT / displayScale;

      // Profile center in banner:
      // X: left (16px) + half size (100px) = 116px
      // Y: banner bottom (500px) - profile center is at banner bottom
      const profileCenterXInBanner = PROFILE_LEFT + TWITTER_PFP_SIZE / 2; // 16 + 100 = 116px
      const profileCenterYInBanner = TWITTER_BANNER_HEIGHT; // 500px (banner bottom)

      // Calculate source position: crop center should map to profile center in banner
      const headerStartX = cropX - profileCenterXInBanner / displayScale;
      const headerStartY = cropY - profileCenterYInBanner / displayScale;

      bannerCtx.drawImage(
        imageElement,
        headerStartX,
        headerStartY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        TWITTER_BANNER_WIDTH,
        TWITTER_BANNER_HEIGHT
      );
    }
    setBannerImageUrl(bannerCanvas.toDataURL());
  }, [imageElement, imageX, imageY, zoom, stageSize]);

  const handleDownloadBanner = () => {
    if (!bannerImageUrl) return;

    const link = document.createElement("a");
    link.href = bannerImageUrl;
    link.download = "twitter-banner-preview.png";
    link.click();
  };

  const handleDownloadProfile = () => {
    if (!profilePictureUrl) return;

    const link = document.createElement("a");
    link.href = profilePictureUrl;
    link.download = "twitter-profile-picture.png";
    link.click();
  };

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
          <div className="flex gap-2">
            <button
              onClick={handleDownloadBanner}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              title="Download Banner"
            >
              <Download className="w-4 h-4" />
              Banner
            </button>
            <button
              onClick={handleDownloadProfile}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              title="Download Profile Picture"
            >
              <Download className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
            {bannerImageUrl ? (
              <Image
                src={bannerImageUrl}
                alt="Banner"
                width={TWITTER_BANNER_WIDTH}
                height={TWITTER_BANNER_HEIGHT}
                className="object-cover"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                <div className="text-white text-sm">Generating preview...</div>
              </div>
            )}
          </div>

          {/* Profile picture - Twitter exact dimensions: 400x400 */}
          {profilePictureUrl && (
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
                src={profilePictureUrl}
                alt="Profile picture"
                width={TWITTER_PFP_SIZE}
                height={TWITTER_PFP_SIZE}
                className="object-cover"
                style={{ borderRadius: "50%" }}
                unoptimized
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
