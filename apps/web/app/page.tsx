import type { CategoryTreeRecord } from "@pet-showcase/shared";
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

  return (
    <StorefrontShell categoryNav={<CategoryNav categories={categories} activeSlug={activeSlug} />}>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {products.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,38,63,0.52)] p-8 text-center shadow-[0_24px_40px_rgba(0,0,0,0.28)]">
            <h2 className="text-xl font-semibold text-white">
              {activeChildCategory
                ? `${activeChildCategory.name} 目前沒有展示個體`
                : activeMainCategory
                  ? `${activeMainCategory.name} 目前沒有展示個體`
                  : activeSlug
                    ? "目前沒有符合條件的商品"
                    : "目前沒有展示中的守宮"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#d6ccbe]">
              {activeChildCategory || activeMainCategory
                ? "之後如果有上架新的個體，會在這個分類底下直接顯示。"
                : activeSlug
                  ? "你可以切換其他分類，或稍後再回來看看新上架的商品。"
                  : "等你把商品設為已發布之後，這裡就會開始顯示守宮卡片。"}
            </p>
          </section>
        ) : (
          <ProductList products={products} />
        )}
      </main>
    </StorefrontShell>
  );
}
