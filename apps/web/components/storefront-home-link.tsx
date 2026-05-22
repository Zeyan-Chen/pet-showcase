"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type StorefrontHomeLinkProps = {
  children: ReactNode;
  className: string;
};

export function StorefrontHomeLink({
  children,
  className,
}: StorefrontHomeLinkProps) {
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

  function handleNavigate() {
    if (currentHref === "/") {
      return;
    }

    setPendingHref("/");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        startTransition(() => {
          router.push("/", { scroll: false });
        });
      });
    });
  }

  const showOverlay = pendingHref === "/" && currentHref !== "/";

  return (
    <>
      <button
        type="button"
        onClick={handleNavigate}
        aria-label="回到首頁"
        className={className}
      >
        {children}
      </button>
      {showOverlay ? (
        <div className="store-loading-overlay" aria-hidden="true">
          <div className="store-loading-overlay-card">
            <span className="store-overlay-spinner" />
            <span>載入中...</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
