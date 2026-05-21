"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/products", label: "商品" },
  { href: "/categories", label: "分類" },
  { href: "/announcements", label: "公告" }
];

export function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <div className="border-b border-[#22496f] bg-[rgba(16,38,63,0.98)] text-white shadow-[0_18px_40px_rgba(16,38,63,0.26)]">
      <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-4">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-11 items-center rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#f4efe6] text-[#17385d] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                  : "border border-white/18 text-white/88 hover:border-[#cf8f44] hover:text-[#ffd7a7]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
