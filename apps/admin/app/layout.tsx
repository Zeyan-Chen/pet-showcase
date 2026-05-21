import type { ReactNode } from "react";
import { AdminNav } from "../components/admin-nav";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-ink)] antialiased">
        <div className="min-h-screen">
          <AdminNav />
          {children}
        </div>
      </body>
    </html>
  );
}
