import { describe, expect, it } from "vitest";
import { serializeCategory, slugifyCategoryName } from "./categories";

describe("slugifyCategoryName", () => {
  it("creates lowercase hyphenated slugs", () => {
    expect(slugifyCategoryName("Grande Terre")).toBe("grande-terre");
  });
});

describe("serializeCategory", () => {
  it("returns a public-safe category record", () => {
    const result = serializeCategory({
      _id: { toString: () => "cat1" },
      name: "Leachianus",
      slug: "leachianus",
      createdAt: new Date("2026-05-19T00:00:00.000Z"),
      updatedAt: new Date("2026-05-19T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      _id: "cat1",
      name: "Leachianus",
      slug: "leachianus"
    });
  });
});
