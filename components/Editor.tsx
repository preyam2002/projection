"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  TWITTER_BANNER_WIDTH,
  TWITTER_BANNER_HEIGHT,
  TWITTER_PFP_SIZE,
  PROFILE_LEFT,
  PROFILE_TOP,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
  DISPLAY_PFP_SIZE,
  DISPLAY_SCALE,
} from "@/lib/constants";
// import Preview from "./Preview"; // AI generation - commented out

export default function Editor() {
  const router = useRouter();
  const originalImage = useEditorStore((state) => state.originalImage);
  const setOriginalImage = useEditorStore((state) => state.setOriginalImage);
  const setCroppedImage = useEditorStore((state) => state.setCroppedImage);
  // AI generation - commented out for now
  // const setGeneratedHeader = useEditorStore(
  //   (state) => state.setGeneratedHeader
  // );
  // const setLoading = useEditorStore((state) => state.setLoading);
  // const isLoading = useEditorStore((state) => state.isLoading);
  // const generatedHeader = useEditorStore((state) => state.generatedHeader);
  // const error = useEditorStore((state) => state.error);
  // const setError = useEditorStore((state) => state.setError);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);
  const [initialImageX, setInitialImageX] = useState(0);
  const [initialImageY, setInitialImageY] = useState(0);
  // const [showPreview, setShowPreview] = useState(false); // AI generation - commented out
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [pfpUrl, setPfpUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
  const dragStartImagePosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const downloadBtnRef = useRef<HTMLDivElement>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCheckedRef = useRef<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    // Wait for zustand persist to hydrate from localStorage
    // Use a longer timeout to ensure everything is ready
    const timer = setTimeout(() => {
      setIsHydrated(true);
      hasCheckedRef.current = true;
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    if (!isMounted || !image) return;

    const ctx = gsap.context(() => {
      // Animate card entrance
      gsap.from(cardRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 30,
        duration: 0.6,
        ease: "power3.out",
      });

      // Animate sidebar entrance
      gsap.from(sidebarRef.current, {
        opacity: 0,
        x: 40,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animate download buttons
      gsap.from(downloadBtnRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.out",
      });

      // Info box animations removed
    });

    return () => ctx.revert();
  }, [isMounted, image]);

  useEffect(() => {
    // Wait for hydration before checking originalImage
    if (!isHydrated || !hasCheckedRef.current) return;

    // Don't redirect - allow user to upload directly on editor page
    // If no originalImage, just return early - the render will show upload UI
    if (!originalImage) {
      // Explicitly do nothing - show upload UI in render
      return;
    }

    const img = new window.Image();
    img.onerror = () => {
      console.error("Failed to load image");
      alert("Failed to load image. Please try uploading again.");
      // Don't redirect - allow user to upload again
      setImage(null);
    };
    img.onload = () => {
      // Validate image dimensions
      if (img.width <= 0 || img.height <= 0) {
        console.error("Invalid image dimensions");
        alert("Invalid image. Please try uploading again.");
        setImage(null);
        return;
      }
      setImage(img);
      // Calculate zoom to fill banner (cover mode - like CSS object-fit: cover)
      // Use the larger of width/height ratios to ensure banner is fully filled with no gaps
      // Calculate zoom based on actual canvas dimensions (TWITTER_BANNER_WIDTH x TWITTER_BANNER_HEIGHT)
      const widthRatio = TWITTER_BANNER_WIDTH / img.width;
      const heightRatio = TWITTER_BANNER_HEIGHT / img.height;
      const calculatedInitialZoom = Math.max(widthRatio, heightRatio);
      setZoom(calculatedInitialZoom);
      setInitialZoom(calculatedInitialZoom);

      // Calculate the scaled image dimensions in display space (for UI positioning)
      const imageDisplayWidth =
        img.width * calculatedInitialZoom * DISPLAY_SCALE;
      const imageDisplayHeight =
        img.height * calculatedInitialZoom * DISPLAY_SCALE;

      // With cover mode, one dimension will match exactly and the other will overflow
      // Always center the overflow dimension to ensure banner is fully covered
      // If widthRatio was larger: imageDisplayWidth = DISPLAY_WIDTH, imageDisplayHeight > DISPLAY_HEIGHT -> center Y
      // If heightRatio was larger: imageDisplayHeight = DISPLAY_HEIGHT, imageDisplayWidth > DISPLAY_WIDTH -> center X

      // Center horizontally (will be 0 if width matches exactly, negative if width overflows)
      const calculatedInitialX = (DISPLAY_WIDTH - imageDisplayWidth) / 2;
      // Center vertically (will be 0 if height matches exactly, negative if height overflows)
      const calculatedInitialY = (DISPLAY_HEIGHT - imageDisplayHeight) / 2;

      setImageX(calculatedInitialX);
      setImageY(calculatedInitialY);
      setInitialImageX(calculatedInitialX);
      setInitialImageY(calculatedInitialY);
    };
    img.src = originalImage;
  }, [
    originalImage,
    router,
    isHydrated,
    TWITTER_BANNER_WIDTH,
    TWITTER_BANNER_HEIGHT,
    DISPLAY_SCALE,
    DISPLAY_WIDTH,
    DISPLAY_HEIGHT,
  ]);

  // Generate canvases - optimized with RAF
  const generateCanvases = useCallback(() => {
    if (!image || isGeneratingRef.current) return;

    isGeneratingRef.current = true;

    // Scale coordinates from display space to canvas space
    const canvasImageX = imageX / DISPLAY_SCALE;
    const canvasImageY = imageY / DISPLAY_SCALE;

    // Create banner (1500x500)
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = TWITTER_BANNER_WIDTH;
    bannerCanvas.height = TWITTER_BANNER_HEIGHT;
    const bannerCtx = bannerCanvas.getContext("2d");

    if (!bannerCtx) {
      console.error("Failed to get 2d context for banner canvas");
      isGeneratingRef.current = false;
      return;
    }
    // Fill with grey background
    bannerCtx.fillStyle = "#808080";
    bannerCtx.fillRect(0, 0, TWITTER_BANNER_WIDTH, TWITTER_BANNER_HEIGHT);

    // Draw the image with current position and zoom
    // Image is drawn at full resolution in canvas coordinates
    try {
      bannerCtx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        canvasImageX,
        canvasImageY,
        image.width * zoom,
        image.height * zoom
      );
      const newBannerUrl = bannerCanvas.toDataURL();
      setBannerUrl(newBannerUrl);
    } catch (error) {
      console.error("Error drawing banner image:", error);
      isGeneratingRef.current = false;
      return;
    }

    // Create PFP (335x335 circular)
    const pfpCanvas = document.createElement("canvas");
    pfpCanvas.width = TWITTER_PFP_SIZE;
    pfpCanvas.height = TWITTER_PFP_SIZE;
    const pfpCtx = pfpCanvas.getContext("2d");

    if (!pfpCtx) {
      console.error("Failed to get 2d context for PFP canvas");
      isGeneratingRef.current = false;
      return;
    }
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

    // Calculate PFP position in banner canvas
    // PFP top-left is at (PROFILE_LEFT, PROFILE_TOP) - exact pixel measurement from Twitter
    // To extract the profile picture, we need to draw the banner image positioned such that
    // the banner content at (PROFILE_LEFT, PROFILE_TOP) appears at (0, 0) in the PFP canvas
    // The image is positioned at (canvasImageX, canvasImageY) in the banner canvas
    // So we draw the image at (canvasImageX - PROFILE_LEFT, canvasImageY - PROFILE_TOP) in PFP canvas
    try {
      pfpCtx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        canvasImageX - PROFILE_LEFT,
        canvasImageY - PROFILE_TOP,
        image.width * zoom,
        image.height * zoom
      );

      pfpCtx.restore();

      const pfpDataUrl = pfpCanvas.toDataURL();
      setPfpUrl(pfpDataUrl);
      setCroppedImage(pfpDataUrl);
    } catch (error) {
      console.error("Error drawing PFP image:", error);
      pfpCtx.restore();
    }

    isGeneratingRef.current = false;
  }, [
    image,
    imageX,
    imageY,
    zoom,
    DISPLAY_SCALE,
    TWITTER_BANNER_WIDTH,
    TWITTER_BANNER_HEIGHT,
    TWITTER_PFP_SIZE,
    PROFILE_LEFT,
    PROFILE_TOP,
    setCroppedImage,
  ]);

  // Throttled canvas generation with RAF - only when not dragging
  useEffect(() => {
    if (!image) return;

    // During drag, don't regenerate canvas to avoid black frames
    if (isDragging) return;

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule canvas generation on next frame
    rafRef.current = requestAnimationFrame(() => {
      generateCanvases();
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [image, imageX, imageY, zoom, isDragging, generateCanvases]);

  // Update canvas when drag ends
  useEffect(() => {
    if (!isDragging && image) {
      // Generate final canvas after drag ends
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        generateCanvases();
      });
    }
  }, [isDragging, image, generateCanvases]);

  // Handle image dragging on banner
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setLastPointerPos({ x: e.clientX, y: e.clientY });
      dragStartImagePosRef.current = { x: imageX, y: imageY };
      if (bannerRef.current) {
        bannerRef.current.style.cursor = "grabbing";
      }
    },
    [imageX, imageY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - lastPointerPos.x;
      const dy = e.clientY - lastPointerPos.y;

      setImageX((prevX) => prevX + dx);
      setImageY((prevY) => prevY + dy);
      setLastPointerPos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastPointerPos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (bannerRef.current) {
      bannerRef.current.style.cursor = "grab";
    }
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (!bannerRef.current || !image) return;

      // Get mouse position relative to banner
      const rect = bannerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Simple zoom calculation: scroll up = zoom in, scroll down = zoom out
      const zoomSpeed = 0.01;
      const zoomDelta = -e.deltaY * zoomSpeed;
      const newZoom = Math.max(0.1, Math.min(3, zoom + zoomDelta));

      if (Math.abs(newZoom - zoom) < 0.01) return;

      // Calculate the point in the image that the mouse is over (before zoom)
      const imagePointX = (mouseX - imageX) / zoom;
      const imagePointY = (mouseY - imageY) / zoom;

      // Calculate new image position to keep the same point under the mouse
      const newImageX = mouseX - imagePointX * newZoom;
      const newImageY = mouseY - imagePointY * newZoom;

      setZoom(newZoom);
      setImageX(newImageX);
      setImageY(newImageY);
    },
    [zoom, imageX, imageY, image]
  );

  // AI generation - commented out for now
  // const handleGenerateHeader = async () => {
  //   if (!originalImage || !image) return;
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch("/api/outpaint", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         image: originalImage,
  //         cropData: {
  //           x: 0,
  //           y: 0,
  //           radius: 100,
  //         },
  //       }),
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.error || "Failed to generate header");
  //     }
  //     const data = await response.json();
  //     if (!data.headerUrl) {
  //       throw new Error("No header URL returned from API");
  //     }
  //     setGeneratedHeader(data.headerUrl);
  //     setError(null);
  //   } catch (error) {
  //     console.error("Error generating header:", error);
  //     const errorMessage =
  //       error instanceof Error
  //         ? error.message
  //         : "Failed to generate header. Please try again.";
  //     setError(errorMessage);
  //     alert(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDownloadHeader = () => {
  //   if (!generatedHeader) return;
  //   const link = document.createElement("a");
  //   link.href = generatedHeader;
  //   link.download = "twitter-header.png";
  //   link.click();
  // };

  const handleDownloadProfile = () => {
    if (!pfpUrl) return;

    const link = document.createElement("a");
    link.href = pfpUrl;
    link.download = "twitter-profile-picture.png";
    link.click();
  };

  const handleDownloadBanner = () => {
    if (!bannerUrl) return;

    const link = document.createElement("a");
    link.href = bannerUrl;
    link.download = "twitter-banner-preview.png";
    link.click();
  };

  const handleCopyPrompt = useCallback(() => {
    const prompt =
      "Upscale the image while preserving every detail and texture. Extend the scene naturally in all directions, using the original image as the visual reference for style, colors, lighting, and atmosphere. Maintain the same art style, depth, and visual tone throughout.";
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleChooseAnotherImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleReset = useCallback(() => {
    setZoom(initialZoom);
    setImageX(initialImageX);
    setImageY(initialImageY);
  }, [initialZoom, initialImageX, initialImageY]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
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
          setOriginalImage(result);
          // Zoom and position will be calculated automatically by useEffect
          // when the image loads to ensure it covers the entire banner
        } else {
          alert("Failed to process the image. Please try again.");
        }
      };
      reader.readAsDataURL(file);

      // Reset the input so the same file can be selected again
      if (e.target) {
        e.target.value = "";
      }
    },
    [setOriginalImage]
  );

  if (!isMounted || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  // Show upload UI if no originalImage (e.g., after page refresh)
  // Note: originalImage is not persisted to localStorage to avoid quota issues
  // User needs to re-upload after page refresh
  if (!originalImage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <Image
              src="/logo.png"
              alt="Seamless Logo"
              width={60}
              height={60}
              className="w-16 h-16 mx-auto mb-4"
              priority
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent font-poppins mb-2">
              SEAMLESS
            </h1>
            <p className="text-gray-400 text-sm mb-2">
              Upload an image to get started
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Images are not saved after page refresh
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-3 border border-gray-700 text-white font-semibold"
          >
            <Upload className="w-5 h-5" />
            Choose Image
          </button>
          <p className="text-xs text-gray-600">All image formats up to 5MB</p>
        </div>
      </div>
    );
  }

  // Show loading state while image is being loaded
  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
        <button
          onClick={() => router.push("/")}
          className="mb-8 hover:opacity-80 transition-opacity cursor-pointer flex flex-col items-center"
          aria-label="Go to homepage"
        >
          <Image
            src="/logo.png"
            alt="Seamless Logo"
            width={60}
            height={60}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-2"
            priority
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent font-poppins leading-none">
            SEAMLESS
          </h1>
        </button>
        <div ref={cardRef} className="relative">
          {/* Twitter Profile Preview Card */}
          <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            {/* Banner - draggable */}
            <div
              ref={bannerRef}
              className="relative overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                width: `${DISPLAY_WIDTH}px`,
                height: `${DISPLAY_HEIGHT}px`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {bannerUrl && (
                <div
                  className="absolute inset-0 pointer-events-none select-none"
                  style={{
                    transform: isDragging
                      ? `translate(${
                          imageX - dragStartImagePosRef.current.x
                        }px, ${imageY - dragStartImagePosRef.current.y}px)`
                      : undefined,
                    transition: isDragging ? "none" : undefined,
                  }}
                >
                  <Image
                    src={bannerUrl}
                    alt="Banner"
                    width={TWITTER_BANNER_WIDTH}
                    height={TWITTER_BANNER_HEIGHT}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority
                  />
                </div>
              )}

              {/* Drag hint overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none flex items-center justify-center">
                <div className="bg-black/50 px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-base font-medium">
                    Drag to reposition • Scroll to zoom
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Picture - overlapping banner */}
            {pfpUrl && (
              <div
                className="absolute rounded-full border-4 border-gray-900 overflow-hidden shadow-xl"
                style={{
                  width: `${DISPLAY_PFP_SIZE}px`,
                  height: `${DISPLAY_PFP_SIZE}px`,
                  left: `${PROFILE_LEFT * DISPLAY_SCALE}px`,
                  top: `${PROFILE_TOP * DISPLAY_SCALE}px`,
                }}
              >
                <Image
                  src={pfpUrl}
                  alt="Profile picture"
                  width={TWITTER_PFP_SIZE}
                  height={TWITTER_PFP_SIZE}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Bottom padding area - enough to show full profile picture circle with border */}
            <div
              className="bg-black"
              style={{ height: `${DISPLAY_PFP_SIZE / 2 + 20}px` }}
            />
          </div>

          {/* Download buttons */}
          <div ref={downloadBtnRef} className="flex gap-3 mt-6">
            <button
              onClick={handleDownloadBanner}
              disabled={!bannerUrl}
              aria-label="Download banner image"
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-700 hover:scale-105 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed relative text-white"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span className="font-semibold text-base">Banner</span>
              </span>
            </button>
            <button
              onClick={handleDownloadProfile}
              disabled={!pfpUrl}
              aria-label="Download profile picture"
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-700 hover:scale-105 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed relative text-white"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span className="font-semibold text-base">Profile</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sidebarRef}
        className="w-full lg:w-[550px] glass border-t lg:border-t-0 lg:border-l border-gray-800 p-4 lg:p-6 flex flex-col gap-2 lg:gap-3 max-h-screen overflow-y-auto relative z-10"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            onClick={handleChooseAnotherImage}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-base relative text-white"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Choose Another Image
            </span>
          </button>

          <div className="pt-2 border-t border-gray-800">
            <label className="text-base font-semibold text-gray-300 mb-3 block">
              Image Controls
            </label>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block font-medium">
                  Zoom
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => {
                    setZoom(Number(e.target.value));
                  }}
                  aria-label="Zoom level"
                  className="w-full"
                />
                <div className="text-sm text-gray-400 mt-2 text-center font-medium">
                  {Math.round(zoom * 100)}%
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setZoom((prevZoom) => Math.max(0.1, prevZoom - 0.1))
                  }
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setZoom((prevZoom) => Math.min(3, prevZoom + 0.1))
                  }
                  className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="font-medium">Reset to Original</span>
              </button>
              <div className="text-sm text-gray-400 text-center pt-2 border-t border-gray-800">
                Drag to position • Scroll to zoom
              </div>
            </div>
          </div>

          {/* AI generation - commented out for now */}
          {/* <div className="pt-4 border-t border-gray-800 space-y-2">
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
                onClick={handleDownloadHeader}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Generated Header
              </button>
            </motion.div>
          )} */}

          {/* Better Results Info Box */}
          <div
            ref={infoBoxRef}
            className="bg-black border-2 border-gray-600 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-base font-bold text-gray-200">
                For Better Results
              </h3>
            </div>
            <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
              <ol className="list-decimal list-inside space-y-2.5 text-gray-300 pl-2">
                <li className="leading-relaxed">
                  Go to{" "}
                  <a
                    href="https://www.imagine.art/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    https://www.imagine.art/
                  </a>{" "}
                  or your favourite AI image generation website
                </li>
                <li className="leading-relaxed">Attach your image</li>
                <li className="leading-relaxed">
                  <span>Use this prompt:</span>
                  <div className="relative mt-1.5">
                    <span className="text-gray-200 italic bg-gray-900 px-3 py-2 rounded block border border-gray-700">
                      &quot;Upscale the image while preserving every detail and
                      texture. Extend the scene naturally in all directions,
                      using the original image as the visual reference for
                      style, colors, lighting, and atmosphere. Maintain the same
                      art style, depth, and visual tone throughout.&quot;
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors text-white"
                      aria-label="Copy prompt"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </li>
              </ol>
              <p className="text-gray-300 pt-2 border-t border-gray-700/50">
                This will result in better results and will have reduced black
                bars.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* {showPreview && generatedHeader && (
        <Preview onClose={() => setShowPreview(false)} />
      )} */}
    </div>
  );
}
