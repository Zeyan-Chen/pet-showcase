export default function Loading() {
  return (
    <div
      aria-live="polite"
      aria-label="頁面載入中"
      className="fixed inset-0 z-[90] flex min-h-screen items-center justify-center bg-[rgba(244,239,230,0.92)] backdrop-blur-[4px]"
    >
      <div className="flex items-center gap-3 rounded-full border border-[#d8cdbf] bg-[rgba(255,253,250,0.96)] px-4 py-3 shadow-[0_18px_40px_rgba(16,38,63,0.12)]">
        <span className="store-overlay-spinner" aria-hidden="true" />
        <span className="text-sm font-medium tracking-[0.04em] text-[#4f4740]">
          載入中...
        </span>
      </div>
    </div>
  );
}
