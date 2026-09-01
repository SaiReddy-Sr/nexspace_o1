import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SearchProvider } from "@/lib/SearchContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background pt-16 overflow-x-hidden`}
      >
        <SearchProvider>
          <SidebarProvider>
            <div className="flex flex-col min-h-[calc(100vh-64px)]">
              <Header />
              <div className="flex flex-1 flex-col sm:flex-row relative w-full max-w-full">
                <Sidebar />
                <MainLayoutWrapper>
                  {children}
                </MainLayoutWrapper>
              </div>
            </div>
          </SidebarProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
