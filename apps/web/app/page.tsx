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

function getBrowseTitle(
  activeCategory: CategoryRecord | null,
  activeSlug?: string,
) {
  if (activeCategory) {
    return activeCategory.name;
  }

  if (activeSlug) {
    return "目前分類";
  }

  return "全部守宮";
}

function getBrowseDescription(
  activeCategory: CategoryRecord | null,
  activeSlug?: string,
) {
  if (activeCategory) {
    return `目前展示 ${activeCategory.name} 分類下已發布的守宮個體。`;
  }

  if (activeSlug) {
    return "這個分類目前正在整理中，你也可以先瀏覽其他已上架的守宮個體。";
  }

  return "以品種分類整理目前展示與在售的守宮個體，方便你快速找到想看的方向。";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeSlug = getActiveSlug(resolvedSearchParams.category);
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(activeSlug),
  ]);
  const activeCategory =
    categories.find((category) => category.slug === activeSlug) ?? null;
  const browseTitle = getBrowseTitle(activeCategory, activeSlug);
  const browseDescription = getBrowseDescription(activeCategory, activeSlug);

  return (
    <StorefrontShell
      categoryNav={
        <CategoryNav categories={categories} activeSlug={activeSlug} />
      }
    >
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-4">
          <header className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(248,244,236,0.98),rgba(240,232,220,0.98))] p-5 text-[var(--store-ink)] shadow-[0_24px_56px_rgba(9,22,39,0.22)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#6f655c]">
                  守宮品種展示
                </p>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {browseTitle}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#5f5851]">
                  {browseDescription}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-[1.4rem] bg-[#efe7da] px-4 py-3 text-[var(--store-ink)] shadow-[inset_0_0_0_1px_rgba(120,105,90,0.08)]">
                  <p className="text-[0.64rem] uppercase tracking-[0.22em] text-[#6f655c]">
                    已展示個體
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {products.length}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#efe7da] px-4 py-3 text-[var(--store-ink)] shadow-[inset_0_0_0_1px_rgba(120,105,90,0.08)]">
                  <p className="text-[0.64rem] uppercase tracking-[0.22em] text-[#6f655c]">
                    分類數量
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {Math.max(categories.length, 1)}
                  </p>
                </div>
              </div>
            </div>
          </header>
          {products.length === 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,38,63,0.52)] p-8 text-center shadow-[0_24px_40px_rgba(0,0,0,0.28)]">
              <h2 className="text-xl font-semibold text-white">
                {activeCategory
                  ? `${activeCategory.name} 目前還沒有展示中的個體`
                  : activeSlug
                    ? "這個分類目前還沒有展示中的個體"
                    : "目前還沒有展示中的守宮個體"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#d6ccbe]">
                {activeCategory
                  ? "你可以先切換到其他品種分類看看，或稍後再回來查看最新上架的守宮個體。"
                  : activeSlug
                    ? "這個分類正在整理中，建議先瀏覽其他已發布的品種分類。"
                    : "站內資料正在更新中，你也可以稍後再回來查看最新的守宮展示。"}
              </p>
            </section>
          ) : (
            <ProductList products={products} />
          )}
        </section>
      </main>
    </StorefrontShell>
  );
}
