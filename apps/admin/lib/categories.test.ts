import { describe, expect, it } from "vitest";
import { buildCategoryTree, normalizeCategoryName, serializeCategory, slugifyCategoryName } from "./categories";

describe("slugifyCategoryName", () => {
  it("creates lowercase hyphenated slugs", () => {
    expect(slugifyCategoryName("Grande Terre")).toBe("grande-terre");
  });

  it("supports Chinese category names", () => {
    expect(slugifyCategoryName("睫角守宮")).toBe("睫角守宮");
  });

  it("keeps mixed names readable", () => {
    expect(slugifyCategoryName("Leachianus 巨人守宮")).toBe("leachianus-巨人守宮");
  });
});

describe("normalizeCategoryName", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeCategoryName("  睫角守宮  ")).toBe("睫角守宮");
  });
});

describe("serializeCategory", () => {
  it("defaults legacy top-level categories to include in all listing", () => {
    const result = serializeCategory({
      _id: { toString: () => "cat1" },
      name: "守宮活體",
      slug: "守宮活體",
      parentCategoryId: null,
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      _id: "cat1",
      name: "守宮活體",
      includeInAllListing: true
    });
  });

  it("preserves explicit top-level all-listing visibility", () => {
    const result = serializeCategory({
      _id: { toString: () => "cat2" },
      name: "周邊用品",
      slug: "周邊用品",
      parentCategoryId: null,
      includeInAllListing: false,
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z")
    });

    expect(result.includeInAllListing).toBe(false);
  });

  it("forces child categories to follow the parent visibility behavior", () => {
    const result = serializeCategory({
      _id: { toString: () => "child1" },
      name: "飼養箱",
      slug: "飼養箱",
      parentCategoryId: { toString: () => "parent1" },
      includeInAllListing: false,
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z")
    });

    expect(result.parentCategoryId).toBe("parent1");
    expect(result.includeInAllListing).toBe(true);
  });
});

describe("buildCategoryTree", () => {
  it("keeps child categories nested under their top-level parent", () => {
    const result = buildCategoryTree([
      {
        _id: "child1",
        name: "飼養箱",
        slug: "飼養箱",
        parentCategoryId: "parent1",
        includeInAllListing: true,
        createdAt: "2026-05-25T00:00:00.000Z",
        updatedAt: "2026-05-25T00:00:00.000Z"
      },
      {
        _id: "parent1",
        name: "設備用品",
        slug: "設備用品",
        parentCategoryId: null,
        includeInAllListing: false,
        createdAt: "2026-05-25T00:00:00.000Z",
        updatedAt: "2026-05-25T00:00:00.000Z"
      }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.includeInAllListing).toBe(false);
    expect(result[0]?.children[0]?.name).toBe("飼養箱");
  });
});
