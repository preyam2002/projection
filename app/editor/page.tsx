"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Editor to avoid SSR issues with Konva
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-400">Loading editor...</div>
    </div>
  ),
});

export default function EditorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure React is fully ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsMounted(true);
      }, 100);
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return <Editor />;
}
