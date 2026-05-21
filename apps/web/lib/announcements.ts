import type { AnnouncementRecord } from "@pet-showcase/shared";
import { fetchFromAdmin } from "./api";

export async function getActiveAnnouncements(): Promise<AnnouncementRecord[]> {
  try {
    const response = await fetchFromAdmin("/api/announcements?active=true");

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as AnnouncementRecord[];
  } catch {
    return [];
  }
}
