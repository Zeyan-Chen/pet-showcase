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
      <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(247,241,232,0.98))] px-5 py-5 shadow-[0_28px_70px_-42px_rgba(76,57,35,0.16)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              分類管理
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
              >
                商品
              </Link>
              <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] shadow-[0_10px_24px_rgba(76,57,35,0.08)]">
                分類
              </span>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-[var(--admin-ink)]">分類與細項</h1>
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              在這裡建立主分類與細項分類，前台選單會直接依照這份結構呈現，並可控制哪些主分類商品會進入「全部」。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <CategoryForm categories={categories} categoryCount={categories.length} />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-[0_18px_60px_-42px_rgba(76,57,35,0.16)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                分類總覽
              </p>
              <h2 className="text-xl font-semibold text-[var(--admin-ink)]">
                目前共有 {categories.length} 個分類項目
              </h2>
            </div>

            <Link href="/products/new">
              <Button
                type="button"
                className="bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
              >
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
