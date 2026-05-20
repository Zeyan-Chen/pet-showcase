import type { ProductRecord } from "@pet-showcase/shared";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductRecord[] }) {
  return (
    <>
      <section
        aria-label="Desktop catalog"
        className="hidden grid-cols-2 gap-5 md:grid xl:grid-cols-3"
      >
        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} />
        ))}
      </section>
      <section
        aria-label="Mobile catalog"
        className="columns-2 gap-3 md:hidden [column-fill:_balance]"
      >
        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} />
        ))}
      </section>
    </>
  );
}
