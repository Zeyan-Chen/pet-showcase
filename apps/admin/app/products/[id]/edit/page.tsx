import { notFound } from "next/navigation";
import { ProductForm } from "../../../../components/product-form";
import { getProductById } from "../../../../lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductForm action="update" title="Edit product" initialValue={product} />;
}
