"use client";

import { useEffect, useState } from "react";
import type { AnnouncementRecord } from "@pet-showcase/shared";

const ROTATE_INTERVAL_MS = 4600;

export function AnnouncementBar({ announcements }: { announcements: AnnouncementRecord[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [announcements]);

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % announcements.length);
    }, ROTATE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [announcements]);

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex] ?? announcements[0];
  const isAnimated = announcements.length > 1;

  return (
    <div className="announcement-bar bg-[#123f7c] px-4 py-2 text-center text-[0.72rem] font-semibold text-white/90 sm:text-[0.78rem]">
      <div className="announcement-viewport">
        <span
          key={`${currentAnnouncement._id}-${currentIndex}`}
          className={`announcement-text ${isAnimated ? "is-marquee" : "is-static"}`}
        >
          {currentAnnouncement.message}
        </span>
      </div>
    </div>
  );
}
