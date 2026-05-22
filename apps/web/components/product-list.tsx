import type { ProductRecord } from "@pet-showcase/shared";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductRecord[] }) {
  return (
    <>
      <section
        aria-label="Desktop catalog"
        className="hidden grid-cols-2 gap-5 md:grid xl:grid-cols-3"
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
      <section
        aria-label="Mobile catalog"
        className="grid grid-cols-2 items-start gap-3 md:hidden"
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
    </>
  );
}
