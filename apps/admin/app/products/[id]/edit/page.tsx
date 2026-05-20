import { notFound } from "next/navigation";
import { ProductForm } from "../../../../components/product-form";
import { listCategories } from "../../../../lib/categories";
import { getProductById } from "../../../../lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      action="update"
      title="編輯商品"
      initialValue={product}
      categories={categories}
    />
  );
}
