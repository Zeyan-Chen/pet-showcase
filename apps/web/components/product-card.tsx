import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <Link
      href={`/products/${product._id}`}
      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200"
    >
      <div className="relative aspect-[4/5]">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm font-semibold text-bark">NT$ {product.price}</p>
      </div>
    </Link>
  );
}
