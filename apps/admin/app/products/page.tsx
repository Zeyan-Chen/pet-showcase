import Link from "next/link";
import { Button } from "@pet-showcase/ui";
import { ProductTable } from "../../components/product-table";
import { listProducts } from "../../lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button type="button">New</Button>
        </Link>
      </div>
      <ProductTable products={products} />
    </main>
  );
}
