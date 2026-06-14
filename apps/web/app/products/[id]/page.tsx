import { notFound } from "next/navigation";
import { CategoryNav } from "../../../components/category-nav";
import { ProductGalleryCarousel } from "../../../components/product-gallery-carousel";
import { StorefrontShell } from "../../../components/storefront-shell";
import { getCategories } from "../../../lib/categories";
import { getPublishedProductById } from "../../../lib/products";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US");

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getPublishedProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const activeSlug = product.childCategory?.slug ?? product.mainCategory.slug;
  const productImages =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  return (
    <StorefrontShell
      categoryNav={
        <CategoryNav categories={categories} activeSlug={activeSlug} />
      }
    >
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.02fr,0.98fr] lg:items-start">
          <section className="space-y-4 rounded-[2rem] border border-[#d8cdbf] bg-white p-4 shadow-[0_26px_56px_rgba(16,38,63,0.14)]">
            <ProductGalleryCarousel
              productName={product.name}
              images={productImages}
            />
          </section>
          <section className="rounded-[2rem] border border-[#d8cdbf] bg-white p-6 text-[#1f1a17] shadow-[0_26px_56px_rgba(16,38,63,0.14)] sm:p-8">
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
                {product.isSoldOut ? (
                  <p className="text-sm font-medium text-[#6b5143]">
                    目前狀態：已售罄，歡迎詢問是否可預訂。
                  </p>
                ) : null}
              </div>
              <div className="space-y-3">
                <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#6d6359]">
                  說明
                </h2>
                <p className="text-sm leading-7 text-[#4f4943] sm:text-base">
                  {product.description}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
