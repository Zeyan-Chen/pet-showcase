import { describe, expect, it, vi } from "vitest";
import { getPublishedProducts } from "./products";

vi.mock("./api", () => ({
  fetchFromAdmin: vi.fn()
}));

import { fetchFromAdmin } from "./api";

describe("getPublishedProducts", () => {
  it("filters out products whose main category is excluded from the all listing", async () => {
    vi.mocked(fetchFromAdmin).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: "visible-1",
          name: "睫角守宮",
          price: 1500,
          imageUrl: "https://example.com/crestie.jpg",
          description: "visible",
          status: "published",
          mainCategoryId: "main-1",
          childCategoryId: null,
          mainCategory: {
            _id: "main-1",
            name: "守宮活體",
            slug: "守宮活體",
            parentCategoryId: null,
            includeInAllListing: true
          },
          childCategory: null,
          category: {
            _id: "main-1",
            name: "守宮活體",
            slug: "守宮活體",
            parentCategoryId: null,
            includeInAllListing: true
          },
          createdAt: "",
          updatedAt: ""
        },
        {
          _id: "hidden-1",
          name: "守宮飼養箱",
          price: 980,
          imageUrl: "https://example.com/box.jpg",
          description: "hidden",
          status: "published",
          mainCategoryId: "main-2",
          childCategoryId: null,
          mainCategory: {
            _id: "main-2",
            name: "設備用品",
            slug: "設備用品",
            parentCategoryId: null,
            includeInAllListing: false
          },
          childCategory: null,
          category: {
            _id: "main-2",
            name: "設備用品",
            slug: "設備用品",
            parentCategoryId: null,
            includeInAllListing: false
          },
          createdAt: "",
          updatedAt: ""
        }
      ]
    } as Response);

    const result = await getPublishedProducts();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("睫角守宮");
  });
});
