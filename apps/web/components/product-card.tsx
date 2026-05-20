import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";

const currencyFormatter = new Intl.NumberFormat("en-US");

export function ProductCard({
  product,
  index = 0
}: {
  product: ProductRecord;
  index?: number;
}) {
  const imageClass =
    index % 3 === 0 ? "aspect-[4/5.3]" : index % 3 === 1 ? "aspect-[4/4.6]" : "aspect-[4/5.8]";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-[1.75rem] border border-black/10 bg-[var(--store-card)] shadow-[0_22px_50px_rgba(15,13,10,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(15,13,10,0.18)] md:mb-0"
    >
      <div className={`relative ${imageClass} overflow-hidden bg-stone-200`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="space-y-2 px-4 py-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-stone-500">
          {product.category.name}
        </p>
        <h2 className="text-base font-semibold leading-snug text-stone-950 md:text-lg">
          {product.name}
        </h2>
        <p className="text-sm font-semibold text-stone-700">
          NT$ {currencyFormatter.format(product.price)}
        </p>
      </div>
    </Link>
  );
}
