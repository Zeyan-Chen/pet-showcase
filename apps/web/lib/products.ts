import type { ProductRecord } from "@pet-showcase/shared";
import { apiBaseUrl } from "./api";

export async function getPublishedProducts(): Promise<ProductRecord[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/products?status=published`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ProductRecord[];
  } catch {
    return [];
  }
}

export async function getPublishedProductById(id: string): Promise<ProductRecord | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
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
