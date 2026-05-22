export default function Loading() {
  return (
    <div
      aria-live="polite"
      aria-label="頁面載入中"
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(244,239,230,0.68)] backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-3 rounded-full border border-[#d8cdbf] bg-[rgba(255,253,250,0.92)] px-4 py-3 shadow-[0_18px_40px_rgba(16,38,63,0.12)]">
        <span className="store-overlay-spinner" aria-hidden="true" />
        <span className="text-sm font-medium tracking-[0.04em] text-[#4f4740]">
          載入中...
        </span>
      </div>
    </div>
  );
}
