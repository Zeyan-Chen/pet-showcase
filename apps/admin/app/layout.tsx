import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-sand text-ink antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(111,78,55,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.6),_rgba(244,239,231,0.98))]">
          {children}
        </div>
      </body>
    </html>
  );
}
