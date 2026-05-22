"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { AnnouncementRecord } from "@pet-showcase/shared";

const ROTATE_INTERVAL_MS = 4600;

export function AnnouncementBar({ announcements }: { announcements: AnnouncementRecord[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const lastSignatureRef = useRef("");
  const [animationMetrics, setAnimationMetrics] = useState({
    centerOffset: "-50%",
    exitOffset: "-100%",
    textWidth: "0px",
    viewportWidth: "0px"
  });
  const announcementsSignature = useMemo(
    () =>
      announcements
        .map((announcement) => `${announcement._id}:${announcement.message}:${announcement.isActive}`)
        .join("|"),
    [announcements]
  );

  useEffect(() => {
    if (!announcements.length) {
      setCurrentIndex(0);
      lastSignatureRef.current = "";
      return;
    }

    if (!lastSignatureRef.current) {
      lastSignatureRef.current = announcementsSignature;
      setCurrentIndex((current) =>
        current >= announcements.length ? 0 : current
      );
      return;
    }

    if (lastSignatureRef.current === announcementsSignature) {
      return;
    }

    lastSignatureRef.current = announcementsSignature;
    setCurrentIndex((current) =>
      current >= announcements.length ? 0 : current
    );
  }, [announcements.length, announcementsSignature]);

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
  }, [announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex] ?? announcements[0];
  const isAnimated = announcements.length > 1;
  const animationStyle = useMemo(
    () =>
      ({
        "--announcement-center-offset": animationMetrics.centerOffset,
        "--announcement-exit-offset": animationMetrics.exitOffset,
        "--announcement-text-width": animationMetrics.textWidth,
        "--announcement-viewport-width": animationMetrics.viewportWidth
      }) as CSSProperties,
    [animationMetrics]
  );

  useEffect(() => {
    if (!isAnimated) {
      return;
    }

    function updateMetrics() {
      const viewport = viewportRef.current;
      const text = textRef.current;

      if (!viewport || !text) {
        return;
      }

      const viewportWidth = viewport.clientWidth;
      const textWidth = text.scrollWidth;
      const centerOffset = -((viewportWidth + textWidth) / 2);
      const exitOffset = -(viewportWidth + textWidth);

      setAnimationMetrics({
        centerOffset: `${centerOffset}px`,
        exitOffset: `${exitOffset}px`,
        textWidth: `${textWidth}px`,
        viewportWidth: `${viewportWidth}px`
      });
    }

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    return () => {
      window.removeEventListener("resize", updateMetrics);
    };
  }, [currentAnnouncement._id, currentIndex, isAnimated]);

  return (
    <div className="announcement-bar bg-[#123f7c] py-2 text-center text-[0.72rem] font-semibold text-white/90 sm:text-[0.78rem]">
      <div ref={viewportRef} className="announcement-viewport">
        <span
          ref={textRef}
          key={`${currentAnnouncement._id}-${currentIndex}`}
          className={`announcement-text ${isAnimated ? "is-marquee" : "is-static"}`}
          style={isAnimated ? animationStyle : undefined}
        >
          {currentAnnouncement.message}
        </span>
      </div>
    </div>
  );
}
