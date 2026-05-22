"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoryRecord } from "@pet-showcase/shared";

type CategoryNavProps = {
  categories: CategoryRecord[];
  activeSlug?: string;
};

function buildCategoryHref(slug?: string) {
  if (!slug) {
    return "/";
  }

  return `/?category=${encodeURIComponent(slug)}`;
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const currentHref = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pendingHref && currentHref === pendingHref) {
      setPendingHref(null);
    }
  }, [currentHref, pendingHref]);

  function handleNavigate(href: string) {
    if (href === currentHref) {
      return;
    }

    setPendingHref(href);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <div
      className={`store-nav-wrap ${isPending ? "store-nav-wrap-pending" : ""}`}
      aria-busy={isPending}
    >
      <nav aria-label="品種分類導覽" className="store-nav-strip">
        <button
          type="button"
          onClick={() => handleNavigate("/")}
          className={
            activeSlug
              ? "store-nav-link"
              : "store-nav-link store-nav-link-active"
          }
          aria-current={activeSlug ? undefined : "page"}
        >
          <span>全部</span>
          {pendingHref === "/" ? (
            <span className="store-nav-loading-dot" aria-hidden="true" />
          ) : null}
        </button>
        {categories.map((category) => {
          const href = buildCategoryHref(category.slug);
          const isActive = activeSlug === category.slug;

          return (
            <button
              key={category._id}
              type="button"
              onClick={() => handleNavigate(href)}
              className={
                isActive
                  ? "store-nav-link store-nav-link-active"
                  : "store-nav-link"
              }
              aria-current={isActive ? "page" : undefined}
            >
              <span>{category.name}</span>
              {pendingHref === href ? (
                <span className="store-nav-loading-dot" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </nav>
      <div className="sr-only" aria-live="polite">
        {isPending ? "分類切換中..." : ""}
      </div>
      {isPending ? (
        <div className="store-loading-overlay" aria-hidden="true">
          <div className="store-loading-overlay-card">
            <span className="store-overlay-spinner" />
            <span>載入中...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
