import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "./category";

describe("categoryInputSchema", () => {
  it("defaults top-level categories to include in all listing", () => {
    const parsed = categoryInputSchema.parse({
      name: "設備用品"
    });

    expect(parsed.parentCategoryId).toBeNull();
    expect(parsed.includeInAllListing).toBe(true);
  });

  it("preserves explicit includeInAllListing for top-level categories", () => {
    const parsed = categoryInputSchema.parse({
      name: "周邊用品",
      includeInAllListing: false
    });

    expect(parsed.includeInAllListing).toBe(false);
  });

  it("allows child categories to carry the field through parsing", () => {
    const parsed = categoryInputSchema.parse({
      name: "飼養箱",
      parentCategoryId: "parent-id",
      includeInAllListing: false
    });

    expect(parsed.parentCategoryId).toBe("parent-id");
    expect(parsed.includeInAllListing).toBe(false);
  });
});
