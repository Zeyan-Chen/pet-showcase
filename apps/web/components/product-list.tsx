import type { ProductRecord } from "@pet-showcase/shared";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductRecord[] }) {
  return (
    <section className="grid gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}
