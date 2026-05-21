import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";
import { Button, Card } from "@pet-showcase/ui";

export function ProductTable({ products }: { products: ProductRecord[] }) {
  if (products.length === 0) {
    return (
      <Card className="border border-dashed border-[#d4c7b7] bg-[#fffaf3] p-8 text-center shadow-none">
        <p className="text-base font-semibold text-[#1f1a17]">目前還沒有商品</p>
        <p className="mt-2 text-sm leading-6 text-[#605850]">
          先新增一筆商品後，這裡就會顯示所有守宮個體與對應分類。
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <Card
          key={product._id}
          className="overflow-hidden border border-[#d8cdbf] bg-[#fffaf3] p-4 shadow-[0_20px_60px_-34px_rgba(16,38,63,0.22)]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-20 w-20 rounded-[1.25rem] border border-[#d8cdbf] object-cover"
              />
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#214b7a]">
                    {product.category.name}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      product.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {product.status === "published" ? "已發布" : "草稿"}
                  </span>
                </div>
                <div>
                  <h2 className="truncate text-lg font-semibold text-[#1f1a17]">{product.name}</h2>
                  <p className="text-sm text-[#605850]">NT$ {product.price}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/products/${product._id}/edit`}
                className="inline-flex min-h-11 items-center rounded-3xl border border-[#cfc1b0] bg-white/80 px-4 py-3 text-sm font-semibold text-[#214b7a] transition hover:border-[#214b7a]"
              >
                編輯
              </Link>
              <form action={`/api/products/${product._id}`} method="post">
                <input type="hidden" name="_method" value="delete" />
                <Button type="submit" className="bg-red-700">
                  刪除
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
