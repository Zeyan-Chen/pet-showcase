import Link from "next/link";
import { Button } from "@pet-showcase/ui";
import { CategoryForm } from "../../components/category-form";
import { CategoryTable } from "../../components/category-table";
import { listCategories } from "../../lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border border-stone-200/80 bg-white/75 px-5 py-5 shadow-[0_24px_80px_-42px_rgba(52,34,18,0.5)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-bark/70">
              分類管理
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-bark hover:text-bark"
              >
                商品
              </Link>
              <span className="inline-flex min-h-11 items-center rounded-3xl bg-bark px-4 py-3 text-sm font-semibold text-white">
                分類
              </span>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-stone-950">守宮品種分類</h1>
            <p className="text-sm leading-6 text-stone-600">
              在這裡維護前台會顯示的守宮品種分類。你可以新增、重新命名，或刪除未被商品使用的分類。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <CategoryForm categoryCount={categories.length} />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-stone-200/70 bg-white/80 px-5 py-4 shadow-[0_18px_60px_-40px_rgba(52,34,18,0.45)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                目前分類
              </p>
              <h2 className="text-xl font-semibold text-stone-950">
                目前有 {categories.length} 個守宮品種分類
              </h2>
            </div>

            <Link href="/products/new">
              <Button type="button">新增商品</Button>
            </Link>
          </div>

          <CategoryTable categories={categories} />
        </div>
      </section>
    </main>
  );
}
