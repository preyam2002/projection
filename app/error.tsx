"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-300">Something went wrong</h1>
        <p className="text-gray-500">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600"
          >
            <Home className="w-4 h-4" />
            <span>Go Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

