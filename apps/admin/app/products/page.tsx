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
      <section className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(250,246,240,0.95),rgba(239,231,218,0.95))] px-5 py-5 shadow-[0_28px_70px_-32px_rgba(16,38,63,0.26)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#6d6359]">
              後台導覽
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-11 items-center rounded-3xl bg-[linear-gradient(180deg,#214b7a,#17385d)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(16,38,63,0.24)]">
                商品
              </span>
              <Link
                href="/categories"
                className="inline-flex min-h-11 items-center rounded-3xl border border-[#cfc1b0] bg-white/75 px-4 py-3 text-sm font-semibold text-[#3d352f] transition hover:border-[#214b7a] hover:text-[#214b7a]"
              >
                分類
              </Link>
            </div>
          </div>

          <div className="space-y-2 lg:max-w-xl lg:text-right">
            <h1 className="text-3xl font-bold text-[#1f1a17]">商品管理</h1>
            <p className="text-sm leading-6 text-[#605850]">
              每筆商品都歸屬到一個真實分類，並隨時掌握目前的上架狀態。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-[#d8cdbf] bg-[#fffaf3] px-5 py-4 shadow-[0_18px_60px_-40px_rgba(16,38,63,0.34)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d6359]">商品數量</p>
          <p className="mt-2 text-3xl font-bold text-[#1f1a17]">{products.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-[#d8cdbf] bg-[#fffaf3] px-5 py-4 shadow-[0_18px_60px_-40px_rgba(16,38,63,0.34)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d6359]">分類數量</p>
          <p className="mt-2 text-3xl font-bold text-[#1f1a17]">{categories.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-[#214b7a]/16 bg-[linear-gradient(180deg,#17385d,#10263f)] px-5 py-4 text-white shadow-[0_22px_60px_-34px_rgba(16,38,63,0.38)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/68">快速操作</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/products/new">
              <Button type="button" className="bg-[#cf8f44] text-[#1f1a17] hover:opacity-100">
                新增商品
              </Button>
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center rounded-3xl border border-white/22 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#ffd7a7] hover:text-[#ffd7a7]"
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
