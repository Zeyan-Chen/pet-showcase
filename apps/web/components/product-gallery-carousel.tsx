"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 48;

export function ProductGalleryCarousel({
  productName,
  images
}: {
  productName: string;
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gestureStartXRef = useRef<number | null>(null);

  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => Math.min(totalImages - 1, currentIndex + 1));
  };

  const commitSwipe = (endX: number) => {
    if (gestureStartXRef.current === null || !hasMultipleImages) {
      gestureStartXRef.current = null;
      return;
    }

    const deltaX = endX - gestureStartXRef.current;
    gestureStartXRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      goToNext();
      return;
    }

    goToPrevious();
  };

  if (totalImages === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#d8cdbf] p-8 text-center text-sm text-[#6d6359]">
        目前沒有可顯示的商品圖片。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#e6ddd1] bg-white shadow-[0_20px_40px_rgba(16,38,63,0.08)]">
        <div
          className="product-gallery-viewport"
          onPointerDown={(event) => {
            gestureStartXRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            commitSwipe(event.clientX);
          }}
          onPointerCancel={() => {
            gestureStartXRef.current = null;
          }}
          onTouchStart={(event) => {
            gestureStartXRef.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const endX = event.changedTouches[0]?.clientX;

            if (typeof endX === "number") {
              commitSwipe(endX);
              return;
            }

            gestureStartXRef.current = null;
          }}
        >
          <div
            className="product-gallery-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="product-gallery-slide"
                aria-hidden={activeIndex !== index}
              >
                <div className="relative aspect-[16/10] bg-[#f8f5ef]">
                  <Image
                    src={imageUrl}
                    alt={`${productName} 圖片 ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              aria-label="上一張圖片"
              className="product-gallery-arrow product-gallery-arrow-left"
              onClick={goToPrevious}
              disabled={activeIndex === 0}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M11.75 4.75L6.5 10l5.25 5.25"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="下一張圖片"
              className="product-gallery-arrow product-gallery-arrow-right"
              onClick={goToNext}
              disabled={activeIndex === totalImages - 1}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M8.25 4.75L13.5 10l-5.25 5.25"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="product-gallery-dots" aria-label="商品圖片分頁">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`product-gallery-dot ${
                  index === activeIndex ? "product-gallery-dot-active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`顯示第 ${index + 1} 張圖片`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
          <p className="text-sm font-medium tracking-[0.18em] text-[#6d6359]">
            {activeIndex + 1} / {totalImages}
          </p>
        </div>
      ) : null}
    </div>
  );
}
