import type { CategoryRecord } from "@pet-showcase/shared";
import { getAdminApiBaseUrl } from "./api";

export async function getCategories(): Promise<CategoryRecord[]> {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/api/categories`, {
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
