import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nexspace",
  description: "A community for developers and clients to connect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <div className="flex flex-col sm:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 sm:pl-16 pb-16 sm:pb-0 min-h-screen flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
