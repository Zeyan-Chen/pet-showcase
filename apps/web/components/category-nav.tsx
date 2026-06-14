"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoryTreeRecord } from "@pet-showcase/shared";

type CategoryNavProps = {
  categories: CategoryTreeRecord[];
  activeSlug?: string;
};

function buildCategoryHref(slug?: string) {
  return slug ? `/?category=${encodeURIComponent(slug)}` : "/";
}

function categoryIsActive(category: CategoryTreeRecord, activeSlug?: string) {
  return category.slug === activeSlug || category.children.some((child) => child.slug === activeSlug);
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const desktopShellRef = useRef<HTMLDivElement | null>(null);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const desktopItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const desktopCloseTimeoutRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [openDesktopSlug, setOpenDesktopSlug] = useState<string | null>(null);
  const [openMobileSlug, setOpenMobileSlug] = useState<string | null>(null);
  const [canScrollDesktopLeft, setCanScrollDesktopLeft] = useState(false);
  const [canScrollDesktopRight, setCanScrollDesktopRight] = useState(false);
  const [desktopDropdownLeft, setDesktopDropdownLeft] = useState<number | null>(null);

  const currentHref = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pendingHref && currentHref === pendingHref) {
      setPendingHref(null);
    }
  }, [currentHref, pendingHref]);

  useEffect(() => {
    const activeParent = categories.find((category) => categoryIsActive(category, activeSlug));
    setOpenMobileSlug(activeParent?.children.length ? activeParent.slug : null);
  }, [activeSlug, categories]);

  useEffect(() => {
    function updateDesktopScrollState() {
      const nav = desktopNavRef.current;

      if (!nav) {
        return;
      }

      const maxScrollLeft = nav.scrollWidth - nav.clientWidth;
      setCanScrollDesktopLeft(nav.scrollLeft > 4);
      setCanScrollDesktopRight(maxScrollLeft - nav.scrollLeft > 4);
      setOpenDesktopSlug(null);
    }

    updateDesktopScrollState();

    const nav = desktopNavRef.current;
    nav?.addEventListener("scroll", updateDesktopScrollState, { passive: true });
    window.addEventListener("resize", updateDesktopScrollState);

    return () => {
      nav?.removeEventListener("scroll", updateDesktopScrollState);
      window.removeEventListener("resize", updateDesktopScrollState);
    };
  }, [categories, activeSlug]);

  useEffect(() => {
    return () => {
      if (desktopCloseTimeoutRef.current) {
        window.clearTimeout(desktopCloseTimeoutRef.current);
      }
    };
  }, []);

  const openDesktopCategory = useMemo(
    () => categories.find((category) => category.slug === openDesktopSlug && category.children.length > 0) ?? null,
    [categories, openDesktopSlug]
  );

  function handleNavigate(href: string) {
    if (href === currentHref) {
      return;
    }

    setPendingHref(href);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function handleMobileParentClick(category: CategoryTreeRecord) {
    if (category.children.length === 0) {
      handleNavigate(buildCategoryHref(category.slug));
      return;
    }

    setOpenMobileSlug((current) => (current === category.slug ? null : category.slug));
  }

  function scrollDesktopBy(direction: "left" | "right") {
    const nav = desktopNavRef.current;

    if (!nav) {
      return;
    }

    const distance = Math.max(220, Math.round(nav.clientWidth * 0.42));
    nav.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth"
    });
  }

  function cancelDesktopClose() {
    if (!desktopCloseTimeoutRef.current) {
      return;
    }

    window.clearTimeout(desktopCloseTimeoutRef.current);
    desktopCloseTimeoutRef.current = null;
  }

  function scheduleDesktopClose() {
    cancelDesktopClose();
    desktopCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenDesktopSlug(null);
      desktopCloseTimeoutRef.current = null;
    }, 160);
  }

  function handleDesktopParentClick(category: CategoryTreeRecord) {
    if (category.children.length === 0) {
      handleNavigate(buildCategoryHref(category.slug));
      return;
    }

    if (openDesktopSlug === category.slug) {
      handleNavigate(buildCategoryHref(category.slug));
      return;
    }

    openDesktopDropdown(category);
  }

  function openDesktopDropdown(category: CategoryTreeRecord) {
    cancelDesktopClose();

    if (category.children.length === 0) {
      setOpenDesktopSlug(null);
      return;
    }

    const shell = desktopShellRef.current;
    const button = desktopItemRefs.current[category.slug];

    if (!shell || !button) {
      setOpenDesktopSlug(category.slug);
      setDesktopDropdownLeft(null);
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const estimatedWidth = Math.min(288, Math.max(240, buttonRect.width + 88));
    const gutter = 12;
    const maxLeft = Math.max(gutter, shellRect.width - estimatedWidth - gutter);
    const preferredLeft = buttonRect.left - shellRect.left;
    const nextLeft = Math.min(Math.max(gutter, preferredLeft), maxLeft);

    setDesktopDropdownLeft(nextLeft);
    setOpenDesktopSlug(category.slug);
  }

  return (
    <div className={`store-nav-wrap ${isPending ? "store-nav-wrap-pending" : ""}`} aria-busy={isPending}>
      <div className="store-nav-desktop" onMouseEnter={cancelDesktopClose} onMouseLeave={scheduleDesktopClose}>
        <div className="store-nav-desktop-shell" ref={desktopShellRef}>
          {canScrollDesktopLeft ? (
            <button
              type="button"
              className="store-nav-desktop-arrow store-nav-desktop-arrow-left"
              onClick={() => scrollDesktopBy("left")}
              aria-label="向左瀏覽分類"
            >
              <span aria-hidden="true">
                <svg viewBox="0 0 12 12" className="store-nav-desktop-arrow-icon">
                  <path d="M7.5 2.25 4 6l3.5 3.75" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ) : null}

          <div className="store-nav-desktop-viewport">
            <nav ref={desktopNavRef} aria-label="商品分類導覽" className="store-nav-strip store-nav-strip-desktop">
              <button
                type="button"
                onClick={() => handleNavigate("/")}
                className={activeSlug ? "store-nav-link" : "store-nav-link store-nav-link-active"}
                aria-current={activeSlug ? undefined : "page"}
              >
                <span>全部</span>
              </button>

              {categories.map((category) => {
                const hasChildren = category.children.length > 0;
                const isActive = categoryIsActive(category, activeSlug);
                const isOpen = openDesktopSlug === category.slug;

                return (
                  <div
                    key={category._id}
                    className="store-nav-item"
                    onMouseEnter={() => openDesktopDropdown(category)}
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        desktopItemRefs.current[category.slug] = node;
                      }}
                      onClick={() => handleDesktopParentClick(category)}
                      className={isActive ? "store-nav-link store-nav-link-active" : "store-nav-link"}
                      aria-current={category.slug === activeSlug ? "page" : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                    >
                      <span>{category.name}</span>
                      {hasChildren ? <span className="store-nav-caret">▾</span> : null}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {canScrollDesktopRight ? (
            <button
              type="button"
              className="store-nav-desktop-arrow store-nav-desktop-arrow-right"
              onClick={() => scrollDesktopBy("right")}
              aria-label="向右瀏覽分類"
            >
              <span aria-hidden="true">
                <svg viewBox="0 0 12 12" className="store-nav-desktop-arrow-icon">
                  <path d="M4.5 2.25 8 6l-3.5 3.75" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ) : null}

          {openDesktopCategory ? (
            <div
              className="store-nav-dropdown store-nav-dropdown-floating"
              style={desktopDropdownLeft == null ? undefined : { left: `${desktopDropdownLeft}px` }}
              onMouseEnter={cancelDesktopClose}
              onMouseLeave={scheduleDesktopClose}
            >
              <button
                type="button"
                onClick={() => handleNavigate(buildCategoryHref(openDesktopCategory.slug))}
                className={
                  openDesktopCategory.slug === activeSlug
                    ? "store-nav-dropdown-link store-nav-dropdown-link-active"
                    : "store-nav-dropdown-link"
                }
              >
                查看全部 {openDesktopCategory.name}
              </button>
              {openDesktopCategory.children.map((child) => (
                <button
                  key={child._id}
                  type="button"
                  onClick={() => handleNavigate(buildCategoryHref(child.slug))}
                  className={
                    child.slug === activeSlug
                      ? "store-nav-dropdown-link store-nav-dropdown-link-active"
                      : "store-nav-dropdown-link"
                  }
                  aria-current={child.slug === activeSlug ? "page" : undefined}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="store-nav-mobile">
        <nav aria-label="商品分類導覽" className="store-nav-strip store-nav-strip-mobile">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className={activeSlug ? "store-nav-link" : "store-nav-link store-nav-link-active"}
            aria-current={activeSlug ? undefined : "page"}
          >
            <span>全部</span>
          </button>

          {categories.map((category) => {
            const hasChildren = category.children.length > 0;
            const isActive = categoryIsActive(category, activeSlug);
            const isOpen = openMobileSlug === category.slug;

            return (
              <button
                key={category._id}
                type="button"
                onClick={() => handleMobileParentClick(category)}
                className={isActive ? "store-nav-link store-nav-link-active" : "store-nav-link"}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-current={category.slug === activeSlug ? "page" : undefined}
              >
                <span>{category.name}</span>
                {hasChildren ? <span className="store-nav-caret">{isOpen ? "▾" : "+"}</span> : null}
              </button>
            );
          })}
        </nav>

        {openMobileSlug ? (
          <div className="store-nav-mobile-children">
            {categories
              .filter((category) => category.slug === openMobileSlug)
              .flatMap((category) => [
                <button
                  key={`${category._id}-all`}
                  type="button"
                  onClick={() => handleNavigate(buildCategoryHref(category.slug))}
                  className={
                    category.slug === activeSlug
                      ? "store-nav-mobile-child store-nav-mobile-child-active"
                      : "store-nav-mobile-child"
                  }
                >
                  查看全部 {category.name}
                </button>,
                ...category.children.map((child) => (
                  <button
                    key={child._id}
                    type="button"
                    onClick={() => handleNavigate(buildCategoryHref(child.slug))}
                    className={
                      child.slug === activeSlug
                        ? "store-nav-mobile-child store-nav-mobile-child-active"
                        : "store-nav-mobile-child"
                    }
                    aria-current={child.slug === activeSlug ? "page" : undefined}
                  >
                    {child.name}
                  </button>
                ))
              ])}
          </div>
        ) : null}
      </div>

      <div className="sr-only" aria-live="polite">
        {isPending ? "分類切換中" : ""}
      </div>

      {isPending ? (
        <div
          className="store-loading-overlay store-loading-overlay-fullscreen"
          aria-hidden="true"
          aria-label="頁面載入中"
        >
          <div className="store-loading-overlay-card">
            <span className="store-overlay-spinner" />
            <span>載入中...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
