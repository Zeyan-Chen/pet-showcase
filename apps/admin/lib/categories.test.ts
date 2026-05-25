import { describe, expect, it } from "vitest";
import { normalizeCategoryName, serializeCategory, slugifyCategoryName } from "./categories";

describe("slugifyCategoryName", () => {
  it("creates lowercase hyphenated slugs", () => {
    expect(slugifyCategoryName("Grande Terre")).toBe("grande-terre");
  });

  it("supports chinese category names", () => {
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
  it("returns a public-safe category record", () => {
    const result = serializeCategory({
      _id: { toString: () => "cat1" },
      name: "Leachianus",
      slug: "leachianus",
      parentCategoryId: null,
      createdAt: new Date("2026-05-19T00:00:00.000Z"),
      updatedAt: new Date("2026-05-19T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      _id: "cat1",
      name: "Leachianus",
      slug: "leachianus",
      parentCategoryId: null
    });
  });
});
