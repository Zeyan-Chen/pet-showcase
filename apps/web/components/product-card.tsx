import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";

const currencyFormatter = new Intl.NumberFormat("en-US");

export function ProductCard({
  product
}: {
  product: ProductRecord;
}) {
  const cardContent = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ddd3c5]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition duration-500 ${
            product.isSoldOut ? "" : "group-hover:scale-[1.04]"
          }`}
        />
        {product.isSoldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold tracking-[0.02em] text-[#201d1a] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            售罄
          </span>
        ) : null}
      </div>
      <div className="space-y-2 border-t border-[#ebe2d6] bg-white px-4 py-4 text-[var(--store-ink)]">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#73695f]">
          {product.category.name}
        </p>
        <h2 className="text-base font-semibold leading-snug text-[#1f1a17] md:text-lg">
          {product.name}
        </h2>
        <p className="text-sm font-semibold text-[#214b7a]">
          NT$ {currencyFormatter.format(product.price)}
        </p>
      </div>
    </>
  );

  if (product.isSoldOut) {
    return (
      <article className="overflow-hidden rounded-[1.75rem] border border-[#ddd3c6] bg-white shadow-[0_18px_46px_rgba(16,38,63,0.1)]">
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      href={`/products/${product._id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-[#ddd3c6] bg-white shadow-[0_18px_46px_rgba(16,38,63,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(16,38,63,0.16)]"
    >
      {cardContent}
    </Link>
  );
}
