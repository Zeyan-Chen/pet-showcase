import type { ReactNode } from "react";
import Image from "next/image";
import { getActiveAnnouncements } from "../lib/announcements";
import { getSiteSettings } from "../lib/site-settings";
import { AnnouncementBar } from "./announcement-bar";

type StorefrontShellProps = {
  categoryNav?: ReactNode;
  children: ReactNode;
};

export async function StorefrontShell({
  categoryNav,
  children,
}: StorefrontShellProps) {
  const [announcements, siteSettings] = await Promise.all([
    getActiveAnnouncements(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--store-bg)] text-[var(--store-text)]">
      <AnnouncementBar announcements={announcements} />
      <header className="border-b border-[#d4c7b7]/80 bg-[rgba(244,239,230,0.98)] text-[var(--store-ink)] shadow-[0_16px_40px_rgba(16,38,63,0.16)]">
        <div className="store-header-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="store-header-brand-row py-4 sm:py-5">
            <div className="store-header-brand-slot">
              {siteSettings ? (
                <div className="store-header-logo-frame">
                  <Image
                    src={siteSettings.logoImageUrl}
                    alt={siteSettings.logoAlt}
                    width={420}
                    height={210}
                    priority
                    className="store-header-logo-image"
                  />
                </div>
              ) : (
                <div className="store-header-logo-placeholder">Logo</div>
              )}
            </div>
          </div>
          {categoryNav ? (
            <div className="store-header-nav-row border-t border-[#ddd2c4] py-3">
              {categoryNav}
            </div>
          ) : null}
        </div>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}
