import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { KeycloakProvider } from "../components/KeycloakProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AWS Cost ✨",
  description: "AI-powered AWS cost management and analysis platform",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <KeycloakProvider>
          <div className="flex">
            <aside className="sticky top-0 h-screen">
              <Navbar />
            </aside>
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </KeycloakProvider>
      </body>
    </html>
  );
}
