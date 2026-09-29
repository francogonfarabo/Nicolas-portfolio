import type { Viewport } from "next";
import { geist, geistMono } from "@/lib/fonts";
import "../globals.css";

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
