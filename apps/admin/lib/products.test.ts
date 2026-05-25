import { describe, expect, it } from "vitest";
import { serializeProduct } from "./products";

describe("serializeProduct", () => {
  it("returns a public-safe product record", () => {
    const result = serializeProduct({
      _id: { toString: () => "abc123" },
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "published",
      categoryId: "cat1",
      mainCategoryId: "cat1",
      childCategoryId: "child1",
      mainCategory: { _id: "cat1", name: "Geckos", slug: "geckos", parentCategoryId: null },
      childCategory: {
        _id: "child1",
        name: "Leachianus",
        slug: "leachianus",
        parentCategoryId: "cat1"
      },
      createdAt: new Date("2026-05-19T00:00:00.000Z"),
      updatedAt: new Date("2026-05-19T00:00:00.000Z")
    });

    expect(result._id).toBe("abc123");
    expect(result.status).toBe("published");
    expect(result.category.name).toBe("Leachianus");
    expect(result.mainCategoryId).toBe("cat1");
    expect(result.childCategoryId).toBe("child1");
    expect(result.mainCategory.name).toBe("Geckos");
  });
});
