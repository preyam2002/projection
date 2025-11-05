import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "pattern.css/dist/pattern.min.css";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seamless",
  description: "Where your header and PFP finally meet.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <div className="h-screen flex flex-col overflow-hidden pattern-grid-md text-gray-800">
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          <footer className="w-full py-2 flex items-center justify-center flex-shrink-0 bg-black">
            <a
              href="https://x.com/WispyWinter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group"
            >
              <span className="text-xs">Follow me on</span>
              <svg
                className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
