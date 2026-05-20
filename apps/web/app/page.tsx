import type { CategoryRecord } from "@pet-showcase/shared";
import { CategoryNav } from "../components/category-nav";
import { ProductList } from "../components/product-list";
import { StorefrontShell } from "../components/storefront-shell";
import { getCategories } from "../lib/categories";
import { getPublishedProducts } from "../lib/products";

export const dynamic = "force-dynamic";

function getActiveSlug(searchValue: string | string[] | undefined) {
  if (Array.isArray(searchValue)) {
    return searchValue[0];
  }

  return searchValue;
}

function getBrowseTitle(activeCategory: CategoryRecord | null, activeSlug?: string) {
  if (activeCategory) {
    return activeCategory.name;
  }

  if (activeSlug) {
    return "找不到這個品種";
  }

  return "全部守宮";
}

function getBrowseDescription(activeCategory: CategoryRecord | null, activeSlug?: string) {
  if (activeCategory) {
    return `目前展示 ${activeCategory.name} 品種的在售與公開個體。`;
  }

  if (activeSlug) {
    return "這個品種分類目前沒有可瀏覽內容，請切換到其他品種查看。";
  }

  return "依照品種快速瀏覽目前公開展示的守宮個體，方便比較外觀與分類。";
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ category?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeSlug = getActiveSlug(resolvedSearchParams.category);
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(activeSlug)
  ]);
  const activeCategory = categories.find((category) => category.slug === activeSlug) ?? null;
  const browseTitle = getBrowseTitle(activeCategory, activeSlug);
  const browseDescription = getBrowseDescription(activeCategory, activeSlug);

  return (
    <StorefrontShell
      hero={
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),16rem] lg:items-end">
          <div className="space-y-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[var(--store-accent)]">
              守宮品種展示
            </p>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                依品種整理的守宮展示網站，快速查看各類個體與目前在售資訊。
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--store-muted)] sm:text-base">
                這裡以守宮品種為主軸，整理公開展示與上架中的個體，讓你在桌機與手機上都能清楚瀏覽。
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                展示個體
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{products.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                品種分類
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {Math.max(categories.length, 1)}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[18rem,minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[2rem] border border-white/10 bg-[var(--store-panel-2)] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--store-muted)]">
                依品種瀏覽
              </p>
              <CategoryNav categories={categories} activeSlug={activeSlug} />
            </section>
            <section className="rounded-[2rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-[var(--store-muted)]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--store-accent)]">
                站點說明
              </p>
              <p className="mt-3">
                桌機版保留品種目錄的展示感，手機版則採雙欄瀑布流，方便快速查看不同個體。
              </p>
            </section>
          </aside>
          <section className="space-y-4">
            <header className="rounded-[2rem] border border-black/10 bg-[rgba(247,241,231,0.96)] p-5 text-stone-900 shadow-[0_18px_40px_rgba(15,13,10,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-stone-500">
                    目前瀏覽
                  </p>
                  <h2 className="text-2xl font-semibold sm:text-3xl">{browseTitle}</h2>
                  <p className="max-w-2xl text-sm leading-7 text-stone-600">
                    {browseDescription}
                  </p>
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                  共 {products.length} 隻個體
                </p>
              </div>
            </header>
            {products.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-white/15 bg-[var(--store-panel)] p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
                <h3 className="text-xl font-semibold text-white">
                  {activeCategory
                    ? `${activeCategory.name} 目前還沒有展示中的個體。`
                    : activeSlug
                      ? "這個品種目前還沒有可瀏覽的個體。"
                      : "目前還沒有已公開的守宮個體。"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--store-muted)]">
                  {activeCategory
                    ? "可以稍後再回來看看，或切換到其他品種繼續瀏覽。"
                    : activeSlug
                      ? "請從上方品種分類切換到其他列表，查看目前已公開的個體。"
                      : "後台發布新的守宮個體後，這裡就會自動更新。"}
                </p>
              </section>
            ) : (
              <ProductList products={products} />
            )}
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
