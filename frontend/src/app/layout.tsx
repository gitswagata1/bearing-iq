import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Micro Turner AI — Bearing Manufacturing Intelligence",
  description: "AI-powered bearing manufacturing platform for Micro Turner Group",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex h-full min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </body>
    </html>
  );
}
