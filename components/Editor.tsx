"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Konva from "konva";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Download, Sparkles, Eye, Upload } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Preview from "./Preview";
import CropPreview from "./CropPreview";

// Dynamically import Konva components to avoid SSR and React initialization issues
const KonvaStage = dynamic(() => import("./KonvaStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-400">Loading canvas...</div>
    </div>
  ),
});

export default function Editor() {
  const router = useRouter();
  const originalImage = useEditorStore((state) => state.originalImage);
  const setCropData = useEditorStore((state) => state.setCropData);
  const setCroppedImage = useEditorStore((state) => state.setCroppedImage);
  const setGeneratedHeader = useEditorStore(
    (state) => state.setGeneratedHeader
  );
  const setLoading = useEditorStore((state) => state.setLoading);
  const isLoading = useEditorStore((state) => state.isLoading);
  const generatedHeader = useEditorStore((state) => state.generatedHeader);
  const error = useEditorStore((state) => state.error);
  const setError = useEditorStore((state) => state.setError);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [showPreview, setShowPreview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const circleRef = useRef<Konva.Circle>(null);

  // Fixed circle size (Twitter-like)
  const FIXED_CIRCLE_RADIUS = 150; // Fixed radius in stage coordinates

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!originalImage) {
      router.push("/upload");
      return;
    }

    const img = new window.Image();
    img.src = originalImage;
    img.onload = () => {
      setImage(img);
      // Set stage size - make it square to accommodate the circle nicely
      const stageDimension = 600;
      setStageSize({
        width: stageDimension,
        height: stageDimension,
      });
      // Center the image initially
      setImageX(0);
      setImageY(0);
      // Set initial zoom to fit image in stage
      const scale = Math.min(
        stageDimension / img.width,
        stageDimension / img.height
      );
      setZoom(scale);
    };
  }, [originalImage, router]);

  useEffect(() => {
    const handleResize = () => {
      if (image) {
        const maxWidth = Math.min(window.innerWidth - 400, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        const scale = Math.min(
          maxWidth / image.width,
          maxHeight / image.height,
          1
        );
        setStageSize({
          width: image.width * scale,
          height: image.height * scale,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [image]);

  const handleCropChange = useCallback(() => {
    if (!image || !imageRef.current) return;

    // Circle is always centered on stage
    const circleCenterX = stageSize.width / 2;
    const circleCenterY = stageSize.height / 2;

    // Calculate the position in the original image coordinate space
    // The image is positioned at (imageX, imageY) and scaled by zoom
    // Calculate the point in the original image that corresponds to the circle center
    const relativeX = (circleCenterX - imageX) / zoom;
    const relativeY = (circleCenterY - imageY) / zoom;

    // Convert to original image coordinates
    const cropX = relativeX;
    const cropY = relativeY;

    // Calculate the radius in original image coordinates
    const cropRadius = FIXED_CIRCLE_RADIUS / zoom;

    setCropData({ x: cropX, y: cropY, radius: cropRadius });

    // Create cropped circular image (200x200 for Twitter profile picture)
    const outputSize = 200;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      cropX - cropRadius,
      cropY - cropRadius,
      cropRadius * 2,
      cropRadius * 2,
      0,
      0,
      outputSize,
      outputSize
    );

    setCroppedImage(canvas.toDataURL());
  }, [image, zoom, imageX, imageY, stageSize, setCropData, setCroppedImage]);

  useEffect(() => {
    handleCropChange();
  }, [handleCropChange]);

  // Handle image dragging
  const handleStageMouseMove = useCallback(
    (e: any) => {
      if (!isDragging) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const dx = pointerPos.x - lastPointerPos.x;
      const dy = pointerPos.y - lastPointerPos.y;

      setImageX((prevX) => prevX + dx);
      setImageY((prevY) => prevY + dy);
      setLastPointerPos(pointerPos);
    },
    [isDragging, lastPointerPos]
  );

  const handleStageMouseDown = useCallback((e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Allow dragging from anywhere on the stage (like Twitter)
    // Don't drag if clicking on the circle overlay
    if (
      e.target !== circleRef.current &&
      e.target.getParent() !== circleRef.current
    ) {
      setIsDragging(true);
      setLastPointerPos(pointerPos);
      stage.container().style.cursor = "grabbing";
    }
  }, []);

  const handleStageMouseUp = useCallback(() => {
    setIsDragging(false);
    const stage = stageRef.current;
    if (stage) {
      stage.container().style.cursor = "grab";
    }
  }, []);

  const handleGenerateHeader = async () => {
    if (!originalImage || !image) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/outpaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: originalImage,
          cropData: {
            // Calculate crop position from current image position and zoom
            x: (stageSize.width / 2 - imageX) / zoom,
            y: (stageSize.height / 2 - imageY) / zoom,
            radius: FIXED_CIRCLE_RADIUS / zoom,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate header");
      }

      const data = await response.json();
      if (!data.headerUrl) {
        throw new Error("No header URL returned from API");
      }
      setGeneratedHeader(data.headerUrl);
      setError(null);
    } catch (error) {
      console.error("Error generating header:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate header. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHeader = () => {
    if (!generatedHeader) return;

    const link = document.createElement("a");
    link.href = generatedHeader;
    link.download = "twitter-header.png";
    link.click();
  };

  const handleDownloadProfile = () => {
    const croppedImage = useEditorStore.getState().croppedImage;
    if (!croppedImage) return;

    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "profile-picture.png";
    link.click();
  };

  if (!isMounted || !image) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-2xl p-4 shadow-2xl"
        >
          {isMounted && (
            <KonvaStage
              stageSize={stageSize}
              image={image}
              zoom={zoom}
              imageX={imageX}
              imageY={imageY}
              circleRadius={FIXED_CIRCLE_RADIUS}
              stageRef={stageRef}
              imageRef={imageRef}
              circleRef={circleRef}
              onStageMouseDown={handleStageMouseDown}
              onStageMouseUp={handleStageMouseUp}
              onStageMouseMove={handleStageMouseMove}
            />
          )}
        </motion.div>
      </div>

      <div className="w-80 bg-gray-950 border-l border-gray-800 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            Seamless
          </h1>
          <p className="text-sm text-gray-500">
            Where your header and PFP finally meet.
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <button
            onClick={() => router.push("/upload")}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4" />
            Choose Another Image
          </button>

          <div className="pt-2 border-t border-gray-800">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Image Controls
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Zoom</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => {
                    const newZoom = Number(e.target.value);
                    // Zoom relative to circle center
                    const circleCenterX = stageSize.width / 2;
                    const circleCenterY = stageSize.height / 2;

                    // Calculate the point in the original image at the circle center
                    const imagePointX = (circleCenterX - imageX) / zoom;
                    const imagePointY = (circleCenterY - imageY) / zoom;

                    // Adjust image position to keep the same point under the circle
                    const newImageX = circleCenterX - imagePointX * newZoom;
                    const newImageY = circleCenterY - imagePointY * newZoom;

                    setZoom(newZoom);
                    setImageX(newImageX);
                    setImageY(newImageY);
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {Math.round(zoom * 100)}%
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newZoom = Math.max(0.5, zoom - 0.1);
                    const circleCenterX = stageSize.width / 2;
                    const circleCenterY = stageSize.height / 2;
                    const imagePointX = (circleCenterX - imageX) / zoom;
                    const imagePointY = (circleCenterY - imageY) / zoom;
                    setZoom(newZoom);
                    setImageX(circleCenterX - imagePointX * newZoom);
                    setImageY(circleCenterY - imagePointY * newZoom);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const newZoom = Math.min(3, zoom + 0.1);
                    const circleCenterX = stageSize.width / 2;
                    const circleCenterY = stageSize.height / 2;
                    const imagePointX = (circleCenterX - imageX) / zoom;
                    const imagePointY = (circleCenterY - imageY) / zoom;
                    setZoom(newZoom);
                    setImageX(circleCenterX - imagePointX * newZoom);
                    setImageY(circleCenterY - imagePointY * newZoom);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-800">
                Drag the image to position it
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            <button
              onClick={() => setShowPreview(true)}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Twitter Layout
            </button>
            <button
              onClick={handleGenerateHeader}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Header
                </>
              )}
            </button>
          </div>

          {generatedHeader && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 pt-4 border-t border-gray-800"
            >
              <button
                onClick={() => setShowPreview(true)}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleDownloadHeader}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Header
              </button>
              <button
                onClick={handleDownloadProfile}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Profile Picture
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {showPreview && !generatedHeader && image && (
        <CropPreview
          onClose={() => setShowPreview(false)}
          originalImage={originalImage!}
          imageElement={image}
          imageX={imageX}
          imageY={imageY}
          zoom={zoom}
          stageSize={stageSize}
        />
      )}
      {showPreview && generatedHeader && (
        <Preview onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
