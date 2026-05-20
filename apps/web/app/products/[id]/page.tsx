import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "../../../components/storefront-shell";
import { getPublishedProductById } from "../../../lib/products";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US");

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublishedProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <StorefrontShell
      hero={
        <div className="space-y-4">
          <Link
            href={`/?category=${product.category.slug}`}
            className="inline-flex items-center text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--store-muted)] transition hover:text-white"
          >
            返回 {product.category.name}
          </Link>
          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[var(--store-accent)]">
              {product.category.name}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--store-muted)] sm:text-base">
              這裡整理個體的基本展示資訊，延續品種分類的瀏覽脈絡，方便你回頭比較不同守宮。
            </p>
          </div>
        </div>
      }
    >
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--store-panel)] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="relative aspect-[4/5]">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
          </section>
          <section className="rounded-[2rem] border border-white/10 bg-[var(--store-panel-2)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">
            <div className="space-y-5">
              <div className="space-y-3 border-b border-white/10 pb-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--store-accent)]">
                  品種分類
                </p>
                <p className="text-xl font-semibold text-white">{product.category.name}</p>
                <p className="text-2xl font-semibold text-stone-100">
                  NT$ {currencyFormatter.format(product.price)}
                </p>
              </div>
              <div className="space-y-3">
                <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--store-muted)]">
                  個體介紹
                </h2>
                <p className="text-sm leading-7 text-stone-300 sm:text-base">
                  {product.description}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-[var(--store-muted)]">
                看完這隻守宮後，可以回到原本品種列表，繼續比較不同個體的外觀與售價資訊。
              </div>
            </div>
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
