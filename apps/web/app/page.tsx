import type { CategoryRecord, CategoryTreeRecord } from "@pet-showcase/shared";
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

function findCategoryContext(categories: CategoryTreeRecord[], activeSlug?: string) {
  if (!activeSlug) {
    return { activeMainCategory: null, activeChildCategory: null };
  }

  for (const category of categories) {
    if (category.slug === activeSlug) {
      return { activeMainCategory: category, activeChildCategory: null };
    }

    const child = category.children.find((item) => item.slug === activeSlug);

    if (child) {
      return { activeMainCategory: category, activeChildCategory: child };
    }
  }

  return { activeMainCategory: null, activeChildCategory: null };
}

function getBrowseTitle(activeMainCategory: CategoryTreeRecord | null, activeChildCategory: CategoryRecord | null) {
  if (activeChildCategory) {
    return activeChildCategory.name;
  }

  if (activeMainCategory) {
    return activeMainCategory.name;
  }

  return "全部守宮";
}

function getBrowseDescription(
  activeMainCategory: CategoryTreeRecord | null,
  activeChildCategory: CategoryRecord | null,
  activeSlug?: string
) {
  if (activeChildCategory && activeMainCategory) {
    return `目前顯示 ${activeMainCategory.name} 底下的 ${activeChildCategory.name} 個體。`;
  }

  if (activeMainCategory) {
    return `以 ${activeMainCategory.name} 為主分類整理目前展示與在售的守宮個體。`;
  }

  if (activeSlug) {
    return "找不到對應的分類，請重新選擇想看的方向。";
  }

  return "以品種與主分類整理目前展示與在售的守宮個體，方便你快速找到想看的方向。";
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
  const { activeMainCategory, activeChildCategory } = findCategoryContext(categories, activeSlug);
  const browseTitle = getBrowseTitle(activeMainCategory, activeChildCategory);
  const browseDescription = getBrowseDescription(activeMainCategory, activeChildCategory, activeSlug);

  return (
    <StorefrontShell categoryNav={<CategoryNav categories={categories} activeSlug={activeSlug} />}>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-4">
          <header className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(248,244,236,0.98),rgba(240,232,220,0.98))] p-5 text-[var(--store-ink)] shadow-[0_24px_56px_rgba(9,22,39,0.22)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#6f655c]">
                  守宮展示目錄
                </p>
                <h1 className="text-2xl font-semibold sm:text-3xl">{browseTitle}</h1>
                <p className="max-w-2xl text-sm leading-7 text-[#5f5851]">{browseDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-[1.4rem] bg-[#efe7da] px-4 py-3 text-[var(--store-ink)] shadow-[inset_0_0_0_1px_rgba(120,105,90,0.08)]">
                  <p className="text-[0.64rem] uppercase tracking-[0.22em] text-[#6f655c]">已展示個體</p>
                  <p className="mt-2 text-2xl font-semibold">{products.length}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#efe7da] px-4 py-3 text-[var(--store-ink)] shadow-[inset_0_0_0_1px_rgba(120,105,90,0.08)]">
                  <p className="text-[0.64rem] uppercase tracking-[0.22em] text-[#6f655c]">主分類數量</p>
                  <p className="mt-2 text-2xl font-semibold">{Math.max(categories.length, 1)}</p>
                </div>
              </div>
            </div>
          </header>
          {products.length === 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,38,63,0.52)] p-8 text-center shadow-[0_24px_40px_rgba(0,0,0,0.28)]">
              <h2 className="text-xl font-semibold text-white">
                {activeChildCategory
                  ? `${activeChildCategory.name} 目前沒有展示中的個體`
                  : activeMainCategory
                    ? `${activeMainCategory.name} 目前沒有展示中的個體`
                    : activeSlug
                      ? "找不到符合的分類"
                      : "目前還沒有展示中的守宮"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#d6ccbe]">
                {activeChildCategory || activeMainCategory
                  ? "你可以先切換到其他主分類或細項，看看目前上架中的守宮個體。"
                  : activeSlug
                    ? "請切換到其他分類，或回到全部分類重新瀏覽。"
                    : "之後有新的展示個體上架時，這裡會顯示最新內容。"}
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
