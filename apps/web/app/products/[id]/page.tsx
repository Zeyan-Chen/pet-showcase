import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProductById } from "../../../lib/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublishedProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm font-semibold text-bark">
        Back to list
      </Link>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
        <div className="relative aspect-[4/5]">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-lg font-semibold text-bark">NT$ {product.price}</p>
          <p className="text-sm leading-6 text-stone-700">{product.description}</p>
        </div>
      </div>
    </main>
  );
}
