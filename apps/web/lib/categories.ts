import type { CategoryRecord } from "@pet-showcase/shared";
import { fetchFromAdmin } from "./api";

export async function getCategories(): Promise<CategoryRecord[]> {
  try {
    const response = await fetchFromAdmin("/api/categories");

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as CategoryRecord[];
  } catch {
    return [];
  }
}
