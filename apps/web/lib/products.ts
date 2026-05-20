import type { ProductRecord } from "@pet-showcase/shared";
import { getAdminApiBaseUrl } from "./api";

export async function getPublishedProducts(categorySlug?: string): Promise<ProductRecord[]> {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/api/products?status=published`, {
      cache: "no-store"
    });

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
    const response = await fetch(`${getAdminApiBaseUrl()}/api/products/${id}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ProductRecord;
  } catch {
    return null;
  }
}
