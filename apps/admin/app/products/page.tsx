import Link from "next/link";
import { Button } from "@pet-showcase/ui";
import { ProductTable } from "../../components/product-table";
import { listCategories } from "../../lib/categories";
import { listProducts } from "../../lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(247,241,232,0.98))] px-5 py-5 shadow-[0_28px_70px_-42px_rgba(76,57,35,0.16)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              商品管理
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] shadow-[0_10px_24px_rgba(76,57,35,0.08)]">
                商品
              </span>
              <Link
                href="/categories"
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-white hover:text-[var(--admin-brand-strong)]"
              >
                分類
              </Link>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-[var(--admin-ink)]">商品列表</h1>
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              在這裡管理目前展示中的守宮個體，包含品種、價格、圖片與發布狀態。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-[0_18px_60px_-42px_rgba(76,57,35,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            商品數量
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--admin-ink)]">{products.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-[0_18px_60px_-42px_rgba(76,57,35,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            分類數量
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--admin-ink)]">{categories.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white px-5 py-4 shadow-[0_18px_60px_-42px_rgba(76,57,35,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            快速操作
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/products/new">
              <Button
                type="button"
                className="bg-[var(--admin-ink)] text-white hover:bg-[var(--admin-brand-strong)]"
              >
                新增商品
              </Button>
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3 text-sm font-semibold text-[var(--admin-brand-strong)] transition hover:bg-white"
            >
              管理分類
            </Link>
          </div>
        </div>
      </section>

      <ProductTable products={products} />
    </main>
  );
}
