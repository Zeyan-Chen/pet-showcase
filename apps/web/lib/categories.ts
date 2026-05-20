import type { CategoryRecord } from "@pet-showcase/shared";
import { apiBaseUrl } from "./api";

export async function getCategories(): Promise<CategoryRecord[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/categories`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as CategoryRecord[];
  } catch {
    return [];
  }
}
