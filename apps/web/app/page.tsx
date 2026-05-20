import { EmptyState } from "../components/empty-state";
import { ProductList } from "../components/product-list";
import { getPublishedProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">Pet Showcase</p>
        <h1 className="text-3xl font-bold">Find your next companion</h1>
      </header>
      {products.length === 0 ? <EmptyState /> : <ProductList products={products} />}
    </main>
  );
}
