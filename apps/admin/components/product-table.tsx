import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";
import { Button, Card } from "@pet-showcase/ui";

export function ProductTable({ products }: { products: ProductRecord[] }) {
  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <Card key={product._id} className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{product.name}</h2>
              <p className="text-sm text-stone-600">NT$ {product.price}</p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase">
              {product.status}
            </span>
          </div>
          <div className="flex gap-3">
            <Link href={`/products/${product._id}/edit`} className="text-sm font-semibold text-bark">
              Edit
            </Link>
            <form action={`/api/products/${product._id}`} method="post">
              <input type="hidden" name="_method" value="delete" />
              <Button type="submit" className="bg-red-600">
                Delete
              </Button>
            </form>
          </div>
        </Card>
      ))}
    </div>
  );
}
