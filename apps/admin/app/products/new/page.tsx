import { ProductForm } from "../../../components/product-form";
import { listCategories } from "../../../lib/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listCategories();

  return <ProductForm action="create" title="新增商品" categories={categories} />;
}
