"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/products", label: "商品" },
  { href: "/categories", label: "分類" },
  { href: "/announcements", label: "公告" },
  { href: "/settings", label: "站台設定" }
];

export function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <div className="border-b border-[var(--admin-border)] bg-[rgba(255,253,249,0.98)] text-[var(--admin-ink)] shadow-[0_14px_40px_rgba(76,57,35,0.08)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--admin-muted)]">
            Gecko Admin
          </p>
          <p className="text-lg font-semibold text-[var(--admin-brand-strong)]">
            守宮網站管理後台
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-11 items-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] text-[var(--admin-brand-strong)]"
                    : "border border-transparent bg-[var(--admin-brand-soft)]/72 text-[var(--admin-muted)] hover:border-[var(--admin-border)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-brand-strong)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
