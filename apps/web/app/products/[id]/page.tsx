import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryNav } from "../../../components/category-nav";
import { StorefrontShell } from "../../../components/storefront-shell";
import { getCategories } from "../../../lib/categories";
import { getPublishedProductById } from "../../../lib/products";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US");

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getPublishedProductById(id), getCategories()]);

  if (!product) {
    notFound();
  }

  const activeSlug = product.childCategory?.slug ?? product.mainCategory.slug;
  const backLabel = product.childCategory?.name ?? product.mainCategory.name;

  return (
    <StorefrontShell categoryNav={<CategoryNav categories={categories} activeSlug={activeSlug} />}>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(248,244,236,0.98),rgba(240,232,220,0.98))] p-5 text-[var(--store-ink)] shadow-[0_24px_56px_rgba(16,38,63,0.16)] sm:p-6">
          <div className="space-y-3">
            <Link
              href={`/?category=${activeSlug}`}
              className="inline-flex items-center text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#6d6359] transition hover:text-[#17385d]"
            >
              返回 {backLabel}
            </Link>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#6d6359]">
              {product.childCategory
                ? `${product.mainCategory.name} / ${product.childCategory.name}`
                : product.mainCategory.name}
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{product.name}</h1>
            <p className="max-w-3xl text-sm leading-7 text-[#5f5851] sm:text-base">
              這裡整理這隻守宮的基本展示資訊，方便你快速查看品系、價格與個體說明。
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.08fr,0.92fr] lg:items-start">
          <section className="overflow-hidden rounded-[2rem] border border-[#d8cdbf] bg-[#f6efe5] shadow-[0_26px_56px_rgba(16,38,63,0.14)]">
            <div className="relative aspect-[4/5]">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
          </section>
          <section className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,#fffaf3,#ece2d3)] p-6 text-[#1f1a17] shadow-[0_26px_56px_rgba(16,38,63,0.14)] sm:p-8">
            <div className="space-y-5">
              <div className="space-y-3 border-b border-[#d8cdbf] pb-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#214b7a]">
                  分類資訊
                </p>
                <p className="text-xl font-semibold text-[#1f1a17]">
                  {product.childCategory
                    ? `${product.mainCategory.name} / ${product.childCategory.name}`
                    : product.mainCategory.name}
                </p>
                <p className="text-2xl font-semibold text-[#17385d]">
                  NT$ {currencyFormatter.format(product.price)}
                </p>
              </div>
              <div className="space-y-3">
                <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#6d6359]">
                  個體介紹
                </h2>
                <p className="text-sm leading-7 text-[#4f4943] sm:text-base">{product.description}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#d8cdbf] bg-[#f7f2e9] p-4 text-sm leading-7 text-[#625a53]">
                如需了解更多飼養資訊或想確認個體狀況，可以再透過後續聯繫方式進一步詢問。
              </div>
            </div>
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
