import type { ProductRecord } from "@pet-showcase/shared";
import { fetchFromAdmin } from "./api";

export async function getPublishedProducts(categorySlug?: string): Promise<ProductRecord[]> {
  try {
    const response = await fetchFromAdmin("/api/products?status=published");

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as ProductRecord[];

    if (!categorySlug) {
      return products;
    }

    return products.filter((product) => product.category?.slug === categorySlug);
  } catch {
    return [];
  }
}

export async function getPublishedProductById(id: string): Promise<ProductRecord | null> {
  try {
    const response = await fetchFromAdmin(`/api/products/${id}`);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ProductRecord;
  } catch {
    return null;
  }
}
