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
      <section className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(250,246,240,0.95),rgba(239,231,218,0.95))] px-5 py-5 shadow-[0_28px_70px_-32px_rgba(16,38,63,0.26)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#6d6359]">
              後台導覽
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center rounded-3xl border border-[#cfc1b0] bg-white/75 px-4 py-3 text-sm font-semibold text-[#3d352f] transition hover:border-[#214b7a] hover:text-[#214b7a]"
              >
                商品
              </Link>
              <span className="inline-flex min-h-11 items-center rounded-3xl bg-[linear-gradient(180deg,#214b7a,#17385d)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(16,38,63,0.24)]">
                分類
              </span>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-[#1f1a17]">守宮品種分類</h1>
            <p className="text-sm leading-6 text-[#605850]">
              你可以在這裡建立、重新命名與刪除分類，讓每筆商品都能正確歸屬到對應品種。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <CategoryForm categoryCount={categories.length} />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-[#d8cdbf] bg-[#fffaf3] px-5 py-4 shadow-[0_18px_60px_-40px_rgba(16,38,63,0.34)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d6359]">
                分類列表
              </p>
              <h2 className="text-xl font-semibold text-[#1f1a17]">
                目前共有 {categories.length} 個品種分類
              </h2>
            </div>

            <Link href="/products/new">
              <Button type="button" className="bg-[#cf8f44] text-[#1f1a17] hover:opacity-100">
                新增商品
              </Button>
            </Link>
          </div>

          <CategoryTable categories={categories} />
        </div>
      </section>
    </main>
  );
}
