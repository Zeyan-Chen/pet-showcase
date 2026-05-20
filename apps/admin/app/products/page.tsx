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
      <section className="rounded-[2rem] border border-stone-200/80 bg-white/75 px-5 py-5 shadow-[0_24px_80px_-42px_rgba(52,34,18,0.5)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-bark/70">
              後台導覽
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-11 items-center rounded-3xl bg-bark px-4 py-3 text-sm font-semibold text-white">
                商品
              </span>
              <Link
                href="/categories"
                className="inline-flex min-h-11 items-center rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-bark hover:text-bark"
              >
                分類
              </Link>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-stone-950">商品管理</h1>
            <p className="text-sm leading-6 text-stone-600">
              每筆商品都歸屬到一個真實分類，並隨時掌握目前的上架狀態。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-stone-200/70 bg-white/85 px-5 py-4 shadow-[0_18px_60px_-40px_rgba(52,34,18,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">商品數量</p>
          <p className="mt-2 text-3xl font-bold text-stone-950">{products.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200/70 bg-white/85 px-5 py-4 shadow-[0_18px_60px_-40px_rgba(52,34,18,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">分類數量</p>
          <p className="mt-2 text-3xl font-bold text-stone-950">{categories.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200/70 bg-white/85 px-5 py-4 shadow-[0_18px_60px_-40px_rgba(52,34,18,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            快速操作
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/products/new">
              <Button type="button">新增商品</Button>
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center rounded-3xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-bark hover:text-bark"
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
