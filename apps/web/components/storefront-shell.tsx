import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";

type StorefrontShellProps = {
  hero: ReactNode;
  children: ReactNode;
};

export function StorefrontShell({ hero, children }: StorefrontShellProps) {
  return (
    <div className="min-h-screen bg-[var(--store-bg)] text-[var(--store-text)]">
      <AnnouncementBar />
      <header className="relative overflow-hidden border-b border-white/10 bg-[var(--store-panel)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,165,93,0.18),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.09),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {hero}
        </div>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}
