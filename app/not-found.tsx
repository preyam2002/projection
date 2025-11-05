import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-300">404</h1>
        <h2 className="text-xl font-semibold text-gray-400">Page Not Found</h2>
        <p className="text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600"
        >
          <Home className="w-4 h-4" />
          <span>Go Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
