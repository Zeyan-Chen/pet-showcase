import type { CategoryTreeRecord } from "@pet-showcase/shared";
import { fetchFromAdmin } from "./api";

export async function getCategories(): Promise<CategoryTreeRecord[]> {
  try {
    const response = await fetchFromAdmin("/api/categories");

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as CategoryTreeRecord[];
  } catch {
    return [];
  }
}
