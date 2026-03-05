import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "智行 AI 旅行规划",
  description: "AI 驱动的旅行行程生成与管理",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-[-140px] top-[-120px] h-80 w-80 rounded-full bg-cyan-300/45 blur-3xl" />
          <div className="absolute right-[-120px] top-[80px] h-80 w-80 rounded-full bg-blue-300/35 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />
        </div>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

