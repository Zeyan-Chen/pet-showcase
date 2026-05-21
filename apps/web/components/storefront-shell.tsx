import type { ReactNode } from "react";
import { getActiveAnnouncements } from "../lib/announcements";
import { AnnouncementBar } from "./announcement-bar";

type StorefrontShellProps = {
  categoryNav?: ReactNode;
  children: ReactNode;
};

export async function StorefrontShell({ categoryNav, children }: StorefrontShellProps) {
  const announcements = await getActiveAnnouncements();

  return (
    <div className="min-h-screen bg-[var(--store-bg)] text-[var(--store-text)]">
      <AnnouncementBar announcements={announcements} />
      <header className="border-b border-[#d4c7b7]/80 bg-[rgba(244,239,230,0.98)] text-[var(--store-ink)] shadow-[0_16px_40px_rgba(16,38,63,0.16)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4 sm:py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-32 items-center justify-center rounded-[1.25rem] border border-[#d8cdbf] bg-[#fffdfa] text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7f766e] shadow-[0_16px_24px_rgba(16,38,63,0.07)] sm:h-20 sm:w-40">
                Logo
              </div>
            </div>
          </div>
          {categoryNav ? (
            <div className="border-t border-[#ddd2c4] py-3">{categoryNav}</div>
          ) : null}
        </div>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}
